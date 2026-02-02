import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // 0. Skip Middleware for Auth Callback (Crucial for OAuth)
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  // 1. Setup Response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Clear known bad cookies if they exist to prevent 400/429
  // (Optional: proactive cleanup list)
  const allCookies = request.cookies.getAll()
  const hasBadCookie = allCookies.some(c => c.name.includes('supabase-auth-token') && c.value === 'undefined')
  if (hasBadCookie) {
    request.cookies.getAll().forEach(c => {
      if (c.name.includes('supabase-auth-token')) {
        request.cookies.delete(c.name)
        response.cookies.delete(c.name)
      }
    })
  }

  // 3. Create Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 4. Check Session (Safe Method)
  let user = null
  try {
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()
    if (error) throw error
    user = supabaseUser
  } catch (error: any) {
    // Aggressive cleanup ONLY on actual refresh token failure (which means session is invalid/stolen/expired)
    const isRefreshError = error?.code === 'refresh_token_not_found' ||
      error?.code === 'refresh_token_already_used' ||
      error?.message?.includes('Already Used') ||
      error?.message?.includes('Refresh Token Not Found');

    const isSessionMissing = error?.message === 'Auth session missing!' || error?.message?.includes('Auth session missing');

    // If it's just "Auth session missing", it simply means user is not logged in.
    // We should NOT wipe cookies or log error unless looking for a session specifically.
    if (!isSessionMissing) {
      if (error?.code === 'UND_ERR_CONNECT_TIMEOUT') {
        console.warn('Proxy Auth: Supabase Connection Timed Out (Review Network)');
      } else {
        console.error(`Proxy Auth Error: ${isRefreshError ? 'Invalid Refresh Token (Cleaning Cookies)' : error?.message || 'Unknown'}`);
      }
    }

    // Only wipe cookies if the Refresh Token is explicitly invalid (security risk or stale)
    if (isRefreshError) {
      const cookieNames = request.cookies.getAll().map(c => c.name)
      cookieNames.forEach(name => {
        if (name.startsWith('sb-') || name.includes('auth')) {
          response.cookies.set(name, '', { maxAge: 0 })
        }
      })

      // Force signOut to sync server state
      await supabase.auth.signOut()
    }

    user = null

    // Force strict redirect ONLY for Already Used Token to break loop immediately
    if (isRefreshError && request.nextUrl.pathname !== '/') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 5. Protected Routes Logic
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/sell')

  // Redirects
  if (!user && isProtectedRoute) {
    // Redirect to Home (opening modal is handled by client or user action)
    // Since /login does not exist, we send them to root.
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user is logged in but tries to access a login page (if one existed, or root with param)
  // For now, removing the /login check since it doesn't exist
  // if (user && isLoginPage) { ... }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
