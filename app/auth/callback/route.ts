import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options)
                        })
                    },
                },
            }
        )
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Fix: Respect localhost origin for development to avoid redirecting to production
            const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
            const targetBase = isLocal ? origin : (process.env.NEXT_PUBLIC_SITE_URL || 'https://nbf-x-39dd7c53.vercel.app');

            // Default to /profile if no specific next path is provided
            const targetPath = (next === '/' || !next) ? '/profile' : next;

            return NextResponse.redirect(`${targetBase}${targetPath.startsWith('/') ? targetPath : `/${targetPath}`}`)
        }
    }

    // Redirect to the error page we created
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
