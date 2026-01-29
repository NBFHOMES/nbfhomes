'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/db';

/**
 * AuthCleaner - Runs ONCE on app startup to detect and clear corrupted auth state
 * This prevents infinite loops and rate limit errors
 */
export function AuthCleaner() {
    useEffect(() => {
        const cleanCorruptedAuth = async () => {
            const CLEANUP_KEY = 'nbf_auth_cleaned';

            // Only run cleanup once per browser session
            if (sessionStorage.getItem(CLEANUP_KEY)) {
                return;
            }

            try {
                // Try to get session - if it fails, clear everything
                const { error } = await supabase.auth.getSession();

                if (error && (
                    error.message.includes('refresh_token') ||
                    (error as any)?.code === 'refresh_token_already_used' ||
                    (error as any)?.code === 'over_request_rate_limit'
                )) {
                    console.warn('🧹 Cleaning corrupted auth state...');

                    // Force sign out
                    await supabase.auth.signOut();

                    // Clear ALL storage
                    localStorage.clear();
                    sessionStorage.clear();

                    // Clear cookies manually
                    document.cookie.split(';').forEach(c => {
                        const cookieName = c.split('=')[0].trim();
                        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                    });

                    console.log('✅ Auth state cleaned! Reloading...');

                    // Mark cleanup as done
                    sessionStorage.setItem(CLEANUP_KEY, 'true');

                    // Hard reload to clear all state
                    window.location.reload();
                } else {
                    // No errors, mark as clean
                    sessionStorage.setItem(CLEANUP_KEY, 'true');
                }
            } catch (err) {
                console.error('Cleanup failed:', err);
                sessionStorage.setItem(CLEANUP_KEY, 'true');
            }
        };

        cleanCorruptedAuth();
    }, []); // Run once on mount

    return null; // This component renders nothing
}
