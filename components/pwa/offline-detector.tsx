'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineDetector() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        // Initial check
        if (typeof window !== 'undefined') {
            setIsOffline(!navigator.onLine);
        }

        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[99999] bg-neutral-900 border-b border-red-500 text-white px-4 py-2 text-center text-xs md:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-xl animate-in slide-in-from-top-full duration-300">
            <WifiOff size={16} className="text-red-500" />
            <span>NO INTERNET CONNECTION - BROWSING OFFLINE MODE</span>
        </div>
    );
}
