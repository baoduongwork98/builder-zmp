import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/?github_error=no_code", request.url))
  }

  try {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const data = await res.json() as { access_token?: string; error?: string }

    if (data.error || !data.access_token) {
      const msg = encodeURIComponent(data.error ?? "unknown")
      return NextResponse.redirect(new URL(`/?github_error=${msg}`, request.url))
    }

    const redirectUrl = new URL("/", request.url)
    redirectUrl.searchParams.set("github_token", data.access_token)
    return NextResponse.redirect(redirectUrl)
  } catch {
    return NextResponse.redirect(new URL("/?github_error=server_error", request.url))
  }
}
