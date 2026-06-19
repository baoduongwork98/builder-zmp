const BASE = "https://api.github.com"

function apiHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  }
}

async function ghFetch<T>(token: string, path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...apiHeaders(token), ...(options?.headers ?? {}) },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? `GitHub API error ${res.status}`)
  }
  return res.json() as Promise<T>
}

export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  private: boolean
  default_branch: string
  owner: { login: string }
}

export interface GitHubBranch {
  name: string
  commit: { sha: string }
}

export function getUser(token: string): Promise<GitHubUser> {
  return ghFetch(token, "/user")
}

export function listRepos(token: string): Promise<GitHubRepo[]> {
  return ghFetch(token, "/user/repos?per_page=100&sort=updated&type=owner")
}

export function listBranches(token: string, owner: string, repo: string): Promise<GitHubBranch[]> {
  return ghFetch(token, `/repos/${owner}/${repo}/branches?per_page=100`)
}

export function createRepo(
  token: string,
  name: string,
  description: string,
  isPrivate: boolean
): Promise<GitHubRepo> {
  return ghFetch(token, "/user/repos", {
    method: "POST",
    body: JSON.stringify({ name, description, private: isPrivate, auto_init: false }),
  })
}

async function createBlob(token: string, owner: string, repo: string, content: string): Promise<string> {
  const data = await ghFetch<{ sha: string }>(token, `/repos/${owner}/${repo}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content, encoding: "utf-8" }),
  })
  return data.sha
}

async function createTree(
  token: string,
  owner: string,
  repo: string,
  blobs: { path: string; sha: string }[]
): Promise<string> {
  const data = await ghFetch<{ sha: string }>(token, `/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      tree: blobs.map(({ path, sha }) => ({ path, mode: "100644", type: "blob", sha })),
    }),
  })
  return data.sha
}

async function createCommit(
  token: string,
  owner: string,
  repo: string,
  treeSha: string,
  message: string,
  parentSha?: string
): Promise<string> {
  const body: Record<string, unknown> = { message, tree: treeSha }
  if (parentSha) body.parents = [parentSha]
  const data = await ghFetch<{ sha: string }>(token, `/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify(body),
  })
  return data.sha
}

async function getBranchSha(
  token: string,
  owner: string,
  repo: string,
  branch: string
): Promise<string | null> {
  try {
    const data = await ghFetch<{ object: { sha: string } }>(
      token,
      `/repos/${owner}/${repo}/git/ref/heads/${branch}`
    )
    return data.object.sha
  } catch {
    return null
  }
}

// UTF-8 safe base64 encode for Contents API
function toBase64(content: string): string {
  const bytes = new TextEncoder().encode(content)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

// Fallback for repos with no commits — Contents API handles init automatically
async function pushViaContentsApi(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  files: Record<string, string>
): Promise<void> {
  // Sequential: each PUT creates a commit; parallel would race on empty-repo init
  for (const [path, content] of Object.entries(files)) {
    await ghFetch(token, `/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify({
        message: "chore: export from ZMP Builder",
        content: toBase64(content),
        branch,
      }),
    })
  }
}

export async function pushFiles(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  files: Record<string, string>,
  opts: { isNewRepo: boolean; isNewBranch: boolean; defaultBranch?: string }
): Promise<void> {
  try {
    await pushViaGitDataApi(token, owner, repo, branch, files, opts)
  } catch (err) {
    // Git Data API rejects all operations on repos with no commits
    if ((err as Error).message?.includes("Git Repository is empty")) {
      await pushViaContentsApi(token, owner, repo, branch, files)
    } else {
      throw err
    }
  }
}

async function pushViaGitDataApi(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  files: Record<string, string>,
  opts: { isNewRepo: boolean; isNewBranch: boolean; defaultBranch?: string }
): Promise<void> {
  // Create all blobs in parallel
  const blobEntries = await Promise.all(
    Object.entries(files).map(async ([path, content]) => ({
      path,
      sha: await createBlob(token, owner, repo, content),
    }))
  )

  const treeSha = await createTree(token, owner, repo, blobEntries)

  let parentSha: string | undefined

  if (opts.isNewRepo) {
    // Empty new repo — orphan commit
  } else if (opts.isNewBranch && opts.defaultBranch) {
    // Base new branch on the default branch's HEAD
    const sha = await getBranchSha(token, owner, repo, opts.defaultBranch)
    if (sha) parentSha = sha
  } else {
    // Existing branch — build on top of current HEAD
    const sha = await getBranchSha(token, owner, repo, branch)
    if (sha) parentSha = sha
  }

  const commitSha = await createCommit(
    token,
    owner,
    repo,
    treeSha,
    "chore: export from ZMP Builder",
    parentSha
  )

  if (opts.isNewRepo || opts.isNewBranch) {
    await ghFetch(token, `/repos/${owner}/${repo}/git/refs`, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commitSha }),
    })
  } else {
    await ghFetch(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commitSha, force: true }),
    })
  }
}
