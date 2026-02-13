'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Use SmartProgressBar instead of blocking GlobalLoader
const SmartProgressBar = dynamic(() => import('@/components/ui/smart-progress-bar').then(mod => mod.SmartProgressBar), {
    ssr: false,
});

export function LoadingBarWrapper() {
    return (
        <Suspense fallback={null}>
            <SmartProgressBar />
        </Suspense>
    );
}
