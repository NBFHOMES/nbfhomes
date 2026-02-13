import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
    const hasBadCookie = allCookies.some(c => c.name.includes('nbf_v5_final') && c.value === 'undefined')
    if (hasBadCookie) {
        request.cookies.getAll().forEach(c => {
            if (c.name.includes('nbf_v5_final')) {
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
            cookieOptions: {
                name: 'nbf_v5_final',
            },
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
                        // Force domain to nbfhomes.in
                        const secureOptions = {
                            ...options,
                            domain: '.nbfhomes.in',
                            secure: true,
                            sameSite: 'lax' as const,
                        }
                        response.cookies.set(name, value, secureOptions)
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
            } else if (isRefreshError) {
                // SILENT FAILURE: Do not log "Invalid Refresh Token" to console.
                console.log('Session Expired - Resetting');
                // Just proceed to clean cookies below.
            } else if (error?.status === 429 || error?.code === 'over_request_rate_limit') {
                // SILENT/QUIET FAILURE: Rate limit reached.
                // Do not log "Proxy Auth Error" with stack trace.
                console.warn(`Proxy Auth: Rate limit reached. Backing off.`);
            } else {
                console.error(`Proxy Auth Error: ${error?.message || 'Unknown'}`);
            }
        }

        // Only wipe cookies if the Refresh Token is explicitly invalid (security risk or stale)
        if (isRefreshError) {
            const cookieNames = request.cookies.getAll().map(c => c.name)
            cookieNames.forEach(name => {
                if (name.startsWith('sb-') || name.includes('auth') || name.includes('nbf_v5_final')) {
                    response.cookies.set(name, '', { maxAge: 0, domain: '.nbfhomes.in' })
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
        // Redirect to Login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // If user is logged in but tries to access a login page
    if (user && request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
