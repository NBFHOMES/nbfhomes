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
            // Force Redirection to Home/Dashboard as requested
            // Using absolute URL to prevent relative path ambiguity
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nbfhomes.in'
            // For local dev, prioritize localhost if origin is localhost
            // Ensure we redirect to the live site in production, or localhost only if strictly needed during dev
            const targetUrl = siteUrl;

            return NextResponse.redirect(`${targetUrl}${next === '/' ? '' : next}`)
        }
    }

    // Redirect to the error page we created
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
