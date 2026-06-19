"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  getUser,
  listRepos,
  listBranches,
  createRepo,
  pushFiles,
  GitHubUser,
  GitHubRepo,
  GitHubBranch,
} from "@/lib/github"

const STORAGE_KEY = "github_token"
const LAST_SELECTION_KEY = "github_last_selection"

interface LastSelection {
  mode?: "new-repo" | "existing-repo"
  repoId?: number
  branch?: string
  branchMode?: "existing" | "new"
  newBranchName?: string
}

function loadLastSelection(): LastSelection | null {
  if (typeof window === "undefined") return null
  try {
    return JSON.parse(localStorage.getItem(LAST_SELECTION_KEY) ?? "null") as LastSelection | null
  } catch {
    return null
  }
}

function saveLastSelection(patch: Partial<LastSelection>) {
  try {
    const current = loadLastSelection() ?? {}
    localStorage.setItem(LAST_SELECTION_KEY, JSON.stringify({ ...current, ...patch }))
  } catch {}
}

function getAuthUrl(): string {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? ""
  const params = new URLSearchParams({ client_id: clientId, scope: "repo" })
  return `https://github.com/login/oauth/authorize?${params}`
}

interface Props {
  files: Record<string, string>
}

export function GitHubExportTab({ files }: Props) {
  const storedRef = useRef<LastSelection | null>(
    typeof window !== "undefined" ? loadLastSelection() : null
  )

  // ── Auth state ───────────────────────────────────────────────────────────────
  const [authLoading, setAuthLoading] = useState<boolean>(
    () => typeof window !== "undefined" && !!localStorage.getItem(STORAGE_KEY)
  )
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  // ── Mode ─────────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<"new-repo" | "existing-repo">(
    () => storedRef.current?.mode ?? "new-repo"
  )

  // ── New repo form ────────────────────────────────────────────────────────────
  const [repoName, setRepoName] = useState("")
  const [repoDesc, setRepoDesc] = useState("")
  const [repoPrivate, setRepoPrivate] = useState(true)

  // ── Existing repo ────────────────────────────────────────────────────────────
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [repoSearch, setRepoSearch] = useState("")
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)

  // Branch cache keyed by repo.id — avoids synchronous reset in effects
  const [branchCache, setBranchCache] = useState<Record<string, GitHubBranch[]>>({})
  const branches = selectedRepo ? (branchCache[selectedRepo.id] ?? []) : []
  const branchesLoading = !!selectedRepo && !(selectedRepo.id in branchCache)

  const [branchMode, setBranchMode] = useState<"existing" | "new">(
    () => storedRef.current?.branchMode ?? "existing"
  )
  const [selectedBranch, setSelectedBranch] = useState("")
  const [newBranchName, setNewBranchName] = useState(
    () => storedRef.current?.newBranchName ?? "zmp-export"
  )

  // ── Push state ───────────────────────────────────────────────────────────────
  const [pushing, setPushing] = useState(false)
  const [pushError, setPushError] = useState<string | null>(null)
  const [pushedUrl, setPushedUrl] = useState<string | null>(null)

  // Derive repos loading — no loading state needed
  const reposLoading = mode === "existing-repo" && !!token && repos.length === 0

  // ── Auth ─────────────────────────────────────────────────────────────────────

  const loadUser = useCallback(async (t: string) => {
    try {
      const u = await getUser(t)
      setToken(t)
      setUser(u)
      setAuthError(null)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      setAuthError("Token không hợp lệ. Vui lòng kết nối lại.")
    } finally {
      setAuthLoading(false)
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadUser(stored)
    }
  }, [loadUser])

  function disconnect() {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUser(null)
    setAuthError(null)
    setPushedUrl(null)
    setPushError(null)
    setRepos([])
    setSelectedRepo(null)
    setBranchCache({})
    setAuthLoading(false)
  }

  // ── Load repos when entering existing-repo mode ───────────────────────────────

  useEffect(() => {
    if (mode !== "existing-repo" || !token || repos.length > 0) return
    let cancelled = false
    listRepos(token)
      .then((data) => { if (!cancelled) setRepos(data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [mode, token, repos.length])

  // ── Auto-select last used repo after repos load ───────────────────────────────

  useEffect(() => {
    if (repos.length === 0 || selectedRepo !== null || !storedRef.current?.repoId) return
    const stored = repos.find((r) => r.id === storedRef.current!.repoId)
    if (stored) setSelectedRepo(stored)
  }, [repos, selectedRepo])

  // ── Load branches when a repo is selected ────────────────────────────────────

  useEffect(() => {
    if (!selectedRepo || !token || selectedRepo.id in branchCache) return
    let cancelled = false
    listBranches(token, selectedRepo.owner.login, selectedRepo.name)
      .then((b) => {
        if (!cancelled) {
          setBranchCache((prev) => ({ ...prev, [selectedRepo.id]: b }))
          const storedBranch = storedRef.current?.branch
          const preferred =
            storedBranch && b.some((br) => br.name === storedBranch)
              ? storedBranch
              : (b[0]?.name ?? "")
          setSelectedBranch(preferred)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBranchCache((prev) => ({ ...prev, [selectedRepo.id]: [] }))
        }
      })
    return () => { cancelled = true }
  }, [selectedRepo, token, branchCache])

  // ── Persist last selection to localStorage ───────────────────────────────────

  useEffect(() => { saveLastSelection({ mode }) }, [mode])
  useEffect(() => {
    if (selectedRepo) saveLastSelection({ repoId: selectedRepo.id })
  }, [selectedRepo])
  useEffect(() => { saveLastSelection({ branch: selectedBranch }) }, [selectedBranch])
  useEffect(() => { saveLastSelection({ branchMode, newBranchName }) }, [branchMode, newBranchName])

  const filteredRepos = repos.filter((r) =>
    r.full_name.toLowerCase().includes(repoSearch.toLowerCase())
  )

  // ── Push ──────────────────────────────────────────────────────────────────────

  async function handlePush() {
    if (!token || !user) return
    setPushing(true)
    setPushError(null)
    setPushedUrl(null)

    try {
      if (mode === "new-repo") {
        if (!repoName.trim()) throw new Error("Vui lòng nhập tên repository")
        const repo = await createRepo(token, repoName.trim(), repoDesc.trim(), repoPrivate)
        await pushFiles(token, user.login, repo.name, "main", files, {
          isNewRepo: true,
          isNewBranch: false,
        })
        setPushedUrl(`https://github.com/${user.login}/${repo.name}`)
      } else {
        if (!selectedRepo) throw new Error("Vui lòng chọn repository")
        const branch = branchMode === "new" ? newBranchName.trim() : selectedBranch
        if (!branch) throw new Error("Vui lòng chọn hoặc nhập tên branch")
        await pushFiles(token, selectedRepo.owner.login, selectedRepo.name, branch, files, {
          isNewRepo: false,
          isNewBranch: branchMode === "new",
          defaultBranch: selectedRepo.default_branch,
        })
        setPushedUrl(`https://github.com/${selectedRepo.full_name}/tree/${branch}`)
      }
    } catch (err) {
      setPushError((err as Error).message)
    } finally {
      setPushing(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-400 text-xs">
        Đang kiểm tra kết nối...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-14 px-8">
        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
          <GitHubIcon size={20} className="text-zinc-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-800">Kết nối GitHub</p>
          <p className="text-xs text-zinc-400 mt-1">
            Tạo repo mới hoặc push vào repo có sẵn
          </p>
        </div>
        {authError && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg text-center max-w-xs">
            {authError}
          </p>
        )}
        <a
          href={getAuthUrl()}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-700 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <GitHubIcon size={14} className="text-white" />
          Kết nối với GitHub
        </a>
        {!process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID && (
          <p className="text-[10px] text-amber-600 bg-amber-50 px-3 py-1.5 rounded text-center max-w-xs">
            Chưa cấu hình NEXT_PUBLIC_GITHUB_CLIENT_ID trong .env.local
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="p-5 flex flex-col gap-4 min-h-0">
      {/* User info bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-6 h-6 rounded-full border border-zinc-200"
          />
          <span className="text-xs font-medium text-zinc-700">@{user.login}</span>
          <span className="text-[10px] text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
            Đã kết nối
          </span>
        </div>
        <button
          onClick={disconnect}
          className="text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          Ngắt kết nối
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1.5 p-1 bg-zinc-100 rounded-lg">
        <button
          onClick={() => { setMode("new-repo"); setPushedUrl(null); setPushError(null) }}
          className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${
            mode === "new-repo"
              ? "bg-white text-zinc-800 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Tạo repo mới
        </button>
        <button
          onClick={() => { setMode("existing-repo"); setPushedUrl(null); setPushError(null) }}
          className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${
            mode === "existing-repo"
              ? "bg-white text-zinc-800 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Repo có sẵn
        </button>
      </div>

      {/* ── New repo form ── */}
      {mode === "new-repo" && (
        <div className="flex flex-col gap-3">
          <Field label="Tên repository">
            <input
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="my-zmp-app"
              className="w-full text-xs border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-[#0068FF] transition-colors"
            />
          </Field>
          <Field label="Mô tả (tùy chọn)">
            <input
              value={repoDesc}
              onChange={(e) => setRepoDesc(e.target.value)}
              placeholder="Zalo Mini App built with ZMP Builder"
              className="w-full text-xs border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-[#0068FF] transition-colors"
            />
          </Field>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => setRepoPrivate(!repoPrivate)}
              className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${
                repoPrivate ? "bg-[#0068FF]" : "bg-zinc-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
                  repoPrivate ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-xs text-zinc-600">Private repository</span>
          </label>
        </div>
      )}

      {/* ── Existing repo form ── */}
      {mode === "existing-repo" && (
        <div className="flex flex-col gap-3">
          <Field label="Repository">
            {reposLoading ? (
              <p className="text-xs text-zinc-400 py-1">Đang tải danh sách...</p>
            ) : (
              <>
                <input
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  placeholder="Tìm repository..."
                  className="w-full text-xs border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-[#0068FF] transition-colors mb-1.5"
                />
                <div className="border border-zinc-200 rounded-lg max-h-32 overflow-y-auto divide-y divide-zinc-100">
                  {filteredRepos.length === 0 ? (
                    <p className="text-xs text-zinc-400 px-3 py-2.5">Không tìm thấy</p>
                  ) : (
                    filteredRepos.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => { setSelectedRepo(r); setPushedUrl(null) }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                          selectedRepo?.id === r.id
                            ? "bg-blue-50 text-[#0068FF]"
                            : "text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        <span>{r.full_name}</span>
                        {r.private && (
                          <span className="text-[10px] text-zinc-400 shrink-0 ml-2">private</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </Field>

          {selectedRepo && (
            <Field label="Branch">
              <div className="flex gap-1 p-0.5 bg-zinc-100 rounded-md mb-2">
                <button
                  onClick={() => setBranchMode("existing")}
                  className={`flex-1 py-1 text-[11px] font-medium rounded transition-all ${
                    branchMode === "existing"
                      ? "bg-white text-zinc-800 shadow-sm"
                      : "text-zinc-500"
                  }`}
                >
                  Branch có sẵn
                </button>
                <button
                  onClick={() => setBranchMode("new")}
                  className={`flex-1 py-1 text-[11px] font-medium rounded transition-all ${
                    branchMode === "new"
                      ? "bg-white text-zinc-800 shadow-sm"
                      : "text-zinc-500"
                  }`}
                >
                  Tạo branch mới
                </button>
              </div>

              {branchMode === "existing" && (
                branchesLoading ? (
                  <p className="text-xs text-zinc-400">Đang tải branches...</p>
                ) : (
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full text-xs border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-[#0068FF] transition-colors bg-white"
                  >
                    {branches.map((b) => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                )
              )}

              {branchMode === "new" && (
                <input
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="zmp-export"
                  className="w-full text-xs border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-[#0068FF] transition-colors"
                />
              )}
            </Field>
          )}
        </div>
      )}

      {/* Error */}
      {pushError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {pushError}
        </div>
      )}

      {/* Success */}
      {pushedUrl && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2.5 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckIcon />
            <span className="text-xs text-green-700 font-medium">Push thành công!</span>
          </div>
          <a
            href={pushedUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-medium text-green-700 hover:text-green-900 underline"
          >
            Mở repo →
          </a>
        </div>
      )}

      {/* Submit */}
      {!pushedUrl && (
        <button
          onClick={() => void handlePush()}
          disabled={pushing}
          className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          {pushing ? (
            <>
              <SpinnerIcon />
              Đang push...
            </>
          ) : (
            <>
              <GitHubIcon size={13} className="text-white" />
              {mode === "new-repo" ? "Tạo repo & Push" : "Push lên GitHub"}
            </>
          )}
        </button>
      )}
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-zinc-500 block mb-1">{label}</label>
      {children}
    </div>
  )
}

function GitHubIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
