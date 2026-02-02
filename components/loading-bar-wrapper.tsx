'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const GlobalLoader = dynamic(() => import('@/components/ui/global-loader').then(mod => mod.GlobalLoader), {
    ssr: false,
});

export function LoadingBarWrapper() {
    return (
        <Suspense fallback={null}>
            <GlobalLoader />
        </Suspense>
    );
}
