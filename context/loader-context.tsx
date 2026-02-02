'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoaderContextType {
    isLoading: boolean;
    showLoader: () => void;
    hideLoader: () => void;
    toggleLoader: (state?: boolean) => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    const showLoader = () => setIsLoading(true);
    const hideLoader = () => setIsLoading(false);
    const toggleLoader = (state?: boolean) => {
        if (typeof state === 'boolean') {
            setIsLoading(state);
        } else {
            setIsLoading((prev) => !prev);
        }
    };

    return (
        <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader, toggleLoader }}>
            {children}
        </LoaderContext.Provider>
    );
}

export function useLoader() {
    const context = useContext(LoaderContext);
    if (context === undefined) {
        throw new Error('useLoader must be used within a LoaderProvider');
    }
    return context;
}
