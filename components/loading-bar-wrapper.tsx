'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Restore the original LoadingBar as requested
const LoadingBar = dynamic(() => import('@/components/ui/loading-bar').then(mod => mod.LoadingBar), {
    ssr: false,
});

export function LoadingBarWrapper() {
    return (
        <Suspense fallback={null}>
            <LoadingBar />
        </Suspense>
    );
}
