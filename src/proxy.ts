import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: do not add logic between createServerClient and getClaims()
  const { data: claimsData } = await supabase.auth.getClaims()
  const claims = claimsData?.claims
  const isAuthenticated = Boolean(claims?.sub)
  const appRole = claims?.app_metadata?.app_role

  const { pathname } = request.nextUrl

  // Trainer dashboard routes — require authenticated user
  const trainerRoutes = [
    "/dashboard",
    "/students",
    "/exercises",
    "/workouts",
    "/templates",
  ]

  const isTrainerRoute = trainerRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isPortalRoute = pathname.startsWith("/portal")
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/reset-password" ||
    pathname === "/portal-login"

  if (isTrainerRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isPortalRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/portal-login", request.url))
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    const destination = appRole === "student" ? "/portal" : "/dashboard"
    return NextResponse.redirect(new URL(destination, request.url))
  }

  // Redirect root to dashboard or login
  if (pathname === "/") {
    if (isAuthenticated) {
      const destination = appRole === "student" ? "/portal" : "/dashboard"
      return NextResponse.redirect(new URL(destination, request.url))
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/|auth/confirm|favicon.ico|sw.js|manifest.webmanifest|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
