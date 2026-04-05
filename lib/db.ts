import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

// Use createBrowserClient on the client side to share session state (cookies)
// Use createSupabaseClient on the server side (or for static generation)
// Custom fetch with 30s timeout to prevent 'fetch failed' on slow networks
const customFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    return fetch(input, {
        ...init,
        signal: init?.signal || AbortSignal.timeout(30000)
    });
};

export const supabase = typeof window !== 'undefined'
    ? createBrowserClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
        },
        global: {
            fetch: customFetch
        },
        cookieOptions: {
            name: 'nbf_v5_final',
            domain: typeof window !== 'undefined' && window.location.hostname === 'localhost' ? undefined : '.nbfhomes.in',
            path: '/',
            sameSite: 'lax',
            secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
        },
        realtime: {
            params: {
                eventsPerSecond: 10,
            },
        },
    })
    : createSupabaseClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
        },
        global: {
            fetch: customFetch
        }
    })
