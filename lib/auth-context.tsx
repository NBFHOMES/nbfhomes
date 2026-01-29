'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '@/lib/db';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// GLOBAL SINGLETON: Prevent multiple checks across re-renders
let globalAuthCheck: Promise<{ session: Session | null; user: User | null; error: any }> | null = null;
let killSwitchActive = false;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const isCheckingRef = useRef(false);

    useEffect(() => {
        let mounted = true;

        // CHECK KILL SWITCH
        const killUntil = typeof window !== 'undefined' ? localStorage.getItem('auth_kill_switch') : null;
        if (killUntil && parseInt(killUntil) > Date.now()) {
            console.warn('❄️ Auth Check Frozen by Kill Switch.');
            killSwitchActive = true;
            setIsLoading(false);
            return;
        }

        // INITIAL LOAD + LISTENER (The Correct Supabase Patter)
        // We do NOT call getSession() explicitly to avoid "Invalid Refresh Token: Already Used" race conditions.
        // onAuthStateChange fires 'INITIAL_SESSION' immediately on mount.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // console.log(`Auth State Change: ${event}`); // Silenced

            if (mounted) {
                // 1. HANDLE SESSION
                if (session) {
                    setSession(session);
                    setUser(session.user);

                    // Check for Ban Status / Onboarding ONLY if not already checked recently
                    // To avoid spamming DB on every event, we could cache this, but for now strict security is better.
                    // We only check if we are NOT on a special page.
                    if (window.location.pathname !== '/banned') {
                        const { data: userData, error } = await supabase
                            .from('users')
                            .select('is_banned, is_onboarded')
                            .eq('id', session.user.id)
                            .maybeSingle();

                        // KILL SWITCH LOGIC (Integrated here for non-auth errors that might occur during user fetch)
                        if (error && (error.code === '429' || error.message?.includes('Rate limit'))) {
                            // Activate Kill Switch
                            if (typeof window !== 'undefined') {
                                localStorage.setItem('auth_kill_switch', (Date.now() + 30000).toString());
                                localStorage.clear();
                                window.location.reload();
                            }
                            return;
                        }

                        if (userData?.is_banned) {
                            await supabase.auth.signOut();
                            window.location.href = '/banned';
                            return;
                        }

                        // Onboarding Redirect
                        if (userData && !userData.is_onboarded && window.location.pathname !== '/onboarding') {
                            router.replace('/onboarding');
                        } else if (userData?.is_onboarded && window.location.pathname === '/onboarding') {
                            router.replace('/dashboard');
                        }
                    }
                } else {
                    // No Session
                    setSession(null);
                    setUser(null);
                }

                setIsLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const loginWithGoogle = async () => {
        setIsLoading(true);
        const redirectUrl = `${window.location.origin}/auth/callback`;
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: false,
                flowType: 'pkce',
            } as any,
        });
        if (error) {
            toast.error(error.message);
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        router.refresh();
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, session, loginWithGoogle, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        return {
            user: null,
            session: null,
            loginWithGoogle: async () => { },
            logout: async () => { },
            isLoading: true
        };
    }
    return context;
}
