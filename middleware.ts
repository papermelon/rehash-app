import { NextResponse, type NextRequest } from "next/server"

// Vercel middleware must be extremely fast (sub-second). Avoid any network calls here.

// Supabase sets cookies shaped like sb-<project-ref>-auth-token; presence is enough for routing decisions.
function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some(cookie => cookie.name.includes('-auth-token'))
}

export function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  // Lightweight route protection/redirects based on cookie presence only.
  const protectedRoutes = ["/vault", "/upload", "/review", "/play", "/audio"]
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isAuthRoute = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup"
  const hasAuth = hasSupabaseAuthCookie(request)

  if (!hasAuth && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/signup"
    url.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (hasAuth && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/vault"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
