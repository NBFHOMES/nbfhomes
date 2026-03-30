'use client';
// rebuild fix

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/db';
import { User, Session } from '@supabase/supabase-js';
import { useLoader } from '@/context/loader-context';

interface UserProfile {
    id: string;
    role: string;
    status: string;
    full_name: string;
    contact_number?: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, role, status, full_name, contact_number')
                .eq('id', userId)
                .single();

            if (data && !error) {
                setProfile(data);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // Get initial session
                const { data: { session: initialSession }, error } = await supabase.auth.getSession();

                if (error) {
                    // Ignore AuthSessionMissingError - it just means not logged in
                    if (error.message === 'Auth session missing!' || error.message?.includes('Auth session missing')) {
                        if (mounted) {
                            setSession(null);
                            setUser(null);
                            setIsLoading(false);
                        }
                        return;
                    }

                    console.error('Error getting session:', error);
                    // ... existing error handling ...
                    if (
                        error.code === 'refresh_token_not_found' ||
                        error.code === 'refresh_token_already_used' ||
                        error.message?.includes('Refresh Token Not Found') ||
                        error.message?.includes('Already Used') ||
                        error.status === 400
                    ) {
                        // SILENT FAILURE: No console.error for expected auth expirations
                        console.log('Auth Circuit Breaker Triggered: Clearing Session');
                        // await supabase.auth.signOut(); // Let the autoRefreshToken handle it or expire naturally
                        // localStorage.clear();
                        // if (typeof window !== 'undefined') {
                        //     window.location.reload();
                        // }
                        return;
                    }

                    if (error.status === 429 || error.code === 'over_request_rate_limit') {
                        console.warn('Rate limit reached. Backing off for 5 seconds...');
                        // Simple 5s delay/backoff mechanism - effectively stops this cycle
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        return;
                    }
                } else if (mounted) {
                    setSession(initialSession);
                    setUser(initialSession?.user ?? null);
                    if (initialSession?.user) {
                        fetchProfile(initialSession.user.id);
                    }
                }
            } catch (error) {
                console.error('Error checking auth session:', error);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (!mounted) return;

            // Debounce the state update to prevent UI flickering and race conditions
            const handleAuthChange = async () => {
                if (_event === 'SIGNED_OUT' || (_event === 'TOKEN_REFRESHED' && !newSession)) {
                    // Start fresh
                    setUser(null);
                    setSession(null);
                    setProfile(null);
                } else if (newSession) {
                    setSession(newSession);
                    setUser(newSession.user ?? null);
                    // Fetch profile if user changed or we don't have it
                    if (newSession.user && (!profile || profile.id !== newSession.user.id)) {
                        fetchProfile(newSession.user.id);
                    }
                }
                setIsLoading(false);
            };

            // Use a small timeout to debounce rapid events
            setTimeout(handleAuthChange, 3000);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const { showLoader } = useLoader();

    const loginWithGoogle = async () => {
        try {
            showLoader();

            // Robust URL construction
            // Use NEXTAUTH_URL or NEXT_PUBLIC_SITE_URL to avoid localhost hardcoding in production
            let siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

            // Fallback to empty if still missing
            if (siteUrl === 'null') {
                siteUrl = '';
            }

            // Ensure protocol
            if (siteUrl && !siteUrl.startsWith('http')) {
                siteUrl = `https://${siteUrl}`;
            }

            console.log('Logging in with redirect to:', `${siteUrl}/auth/callback`);

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${siteUrl}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error logging in with Google:', error);
        }
    };

    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loginWithGoogle, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
