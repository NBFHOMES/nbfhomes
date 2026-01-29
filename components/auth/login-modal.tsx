'use client';
// Google Login Modal Refactored 

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { loginWithGoogle } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(7);
    const [showEmailLogin, setShowEmailLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setCountdown(7);
        setShowEmailLogin(false);

        // Start Countdown
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Fallback Timeout (7 seconds)
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => {
                clearInterval(interval);
                reject(new Error('TIMEOUT_FALLBACK'));
            }, 7000)
        );

        try {
            // Race: Login vs 7s Timeout
            await Promise.race([
                loginWithGoogle(),
                timeoutPromise
            ]);
            clearInterval(interval);
        } catch (error: any) {
            clearInterval(interval);
            setIsLoading(false);
            console.error("Login failed/timeout", error);

            if (error.message === 'TIMEOUT_FALLBACK' || error.message === 'TIMEOUT') {
                // Switch to Email OTP View
                setShowEmailLogin(true);
            }
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setOtpLoading(true);

        // Import supabase locally to avoid issues if not in context
        // But better to use the one from lib/db
        const { supabase } = await import('@/lib/db');

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            }
        });

        setOtpLoading(false);

        if (error) {
            alert(error.message);
            return;
        }

        setOtpSent(true);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setOtpLoading(true);
        const { supabase } = await import('@/lib/db');

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email'
        });

        if (error) {
            alert(error.message);
            setOtpLoading(false);
            return;
        }

        // Success handled by AuthContext listener usually, but we can close modal
        onClose();
        window.location.reload(); // Hard refresh to ensure session
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!isLoading && !otpLoading) onClose();
        }}>
            <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden bg-white rounded-xl border-none shadow-2xl">
                <div className="p-10 flex flex-col gap-8 items-center text-center">
                    <DialogHeader className="flex flex-col items-center text-center space-y-4">
                        <DialogTitle className="text-4xl font-serif font-medium text-neutral-900 tracking-tight">
                            {showEmailLogin ? 'Sign in with Email' : 'Welcome back'}
                        </DialogTitle>
                        <DialogDescription className="text-base text-neutral-500 max-w-[280px] leading-relaxed">
                            {showEmailLogin
                                ? (otpSent ? 'Enter the code sent to your email.' : 'Google login timed out. Please use your email.')
                                : 'Sign in with Google to manage your properties and messages.'}
                        </DialogDescription>
                    </DialogHeader>

                    {!showEmailLogin ? (
                        <div className="w-full space-y-4">
                            <Button
                                variant="outline"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="h-14 w-full bg-white border border-neutral-200 hover:bg-neutral-50 active:bg-neutral-100 text-neutral-900 text-lg font-medium rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow-md group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex items-center justify-center w-6 h-6">
                                            <svg className="animate-spin absolute inset-0 text-neutral-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-xs font-bold text-neutral-900 absolute">{countdown > 0 ? countdown : ''}</span>
                                        </div>
                                        <span>Connecting... {countdown > 0 ? `(${countdown}s)` : ''}</span>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        <span className="relative">Continue with Google</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        !otpSent ? (
                            <form onSubmit={handleEmailSubmit} className="w-full space-y-4">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                />
                                <Button type="submit" disabled={otpLoading} className="w-full h-12 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-70">
                                    {otpLoading ? 'Sending...' : 'Send 6-Digit Code'}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="w-full space-y-4">
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none tracking-widest text-center text-lg"
                                />
                                <Button type="submit" disabled={otpLoading} className="w-full h-12 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-70">
                                    {otpLoading ? 'Verifying...' : 'Verify & Login'}
                                </Button>
                            </form>
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
