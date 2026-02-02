import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                storageKey: 'nbf_auth_token',
                debug: process.env.NODE_ENV === 'development',
                persistSession: true,
                detectSessionInUrl: true,
            },
            cookieOptions: {
                domain: process.env.NODE_ENV === 'production' ? '.nbfhomes.in' : undefined,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            }
        }
    );
}
