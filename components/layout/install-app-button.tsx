'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InstallAppButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed/standalone
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsStandalone(true);
        }

        // Check for iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    // Don't show if already installed
    if (isStandalone) return null;

    // Android/Desktop Chrome: Show Install Button if prompt captured
    if (deferredPrompt) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={handleInstall}
                className="flex w-full md:w-auto gap-2 items-center bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
            >
                <Download className="w-4 h-4" />
                Install App
            </Button>
        );
    }

    // Optional: iOS Manual Instructions (User didn't explicitly ask for this logic but it's good PWA practice)
    // For now, adhering strictly to "button that appears when available" -> Android/Standard support

    return null;
}
