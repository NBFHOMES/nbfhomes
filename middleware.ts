import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // PWA & Auth Callback Optimization: Bypass heavy checks for instant login
    if (request.nextUrl.pathname.startsWith('/auth/callback')) {
        return NextResponse.next();
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, {
                            ...options,
                            sameSite: 'lax',
                            secure: process.env.NODE_ENV === 'production',
                        })
                    );
                },
            },
        }
    );

    // OPTIMIZATION: Only call getUser() on protected routes OR if auth cookies exist.
    // This prevents bad tokens from reaching Server Components and causing 429/400 errors.
    const protectedPaths = ['/admin', '/account', '/banned', '/post-property'];
    const path = request.nextUrl.pathname;
    const isProtected = protectedPaths.some(p => path.startsWith(p));
    // OPTIMIZATION: Check for ANY auth cookie. If any exist, verify them.
    // This catches partial/broken states.
    const hasAuthCookies = request.cookies.has('sb-access-token') || request.cookies.has('sb-refresh-token');

    let user = null;

    if (isProtected || hasAuthCookies) {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            user = data.user;
        } catch (error: any) {
            // STRICT SILENCE & SCRUB
            // STRICT SILENCE & SCRUB
            const url = request.nextUrl.clone();
            url.pathname = '/';
            const redirectResponse = NextResponse.redirect(url);

            // Nuke both cookies to be safe
            redirectResponse.cookies.delete('sb-access-token');
            redirectResponse.cookies.delete('sb-refresh-token');
            return redirectResponse;
        }
    }

    if (user) {
        // Protect Routes from Banned Users
        if (!path.startsWith('/banned')) {
            const { data: userData } = await supabase
                .from('users')
                .select('is_banned')
                .eq('id', user.id)
                .single();

            if (userData?.is_banned) {
                const url = request.nextUrl.clone();
                url.pathname = '/banned';
                return NextResponse.redirect(url);
            }
        }
    } else if (isProtected) {
        // Redirect unauthenticated users trying to access protected routes
        const url = request.nextUrl.clone();
        url.pathname = '/'; // Redirect to home
        return NextResponse.redirect(url);
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
