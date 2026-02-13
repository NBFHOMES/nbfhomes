'use client';

// components/ui/smart-progress-bar.tsx
// A sleek, minimal loading bar that tracks route changes AND manual loading states.

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoader } from '@/context/loader-context';

export function SmartProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isLoading } = useLoader(); // Hook into global loader state
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    // Helper to start animation
    const startAnimation = () => {
        setIsVisible(true);
        setProgress(40);
        // Auto-increment to 80% to show activity immediately
        const timer = setTimeout(() => setProgress(80), 50);
        return timer;
    };

    // Helper to complete animation
    const completeAnimation = () => {
        setProgress(100);
        setTimeout(() => {
            setIsVisible(false);
            setProgress(0);
        }, 500);
    };

    // 1. Handle Route Changes
    useEffect(() => {
        // On route change, start and then quickly complete
        const startTimer = startAnimation();
        const finishTimer = setTimeout(() => completeAnimation(), 500);

        return () => {
            clearTimeout(startTimer);
            clearTimeout(finishTimer);
        };
    }, [pathname, searchParams]);

    // 2. Handle Manual Loading (e.g. Auth)
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isLoading) {
            timer = startAnimation();
        } else {
            // Only complete if currently visible (to avoid double completion logic conflicts)
            if (isVisible) completeAnimation();
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isLoading]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 w-full z-[9999] pointer-events-none">
            <div
                className="h-1 bg-red-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(220,38,38,0.7)]"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
