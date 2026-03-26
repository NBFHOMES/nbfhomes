'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ReviewModal } from '@/components/modals/ReviewModal';
import { useAuth } from '@/lib/auth-context';

interface ReviewContextType {
    trackPropertyContact: (propertyId: string) => void;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [contactedList, setContactedList] = useState<string[]>([]);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [dismissedAt, setDismissedAt] = useState<number | null>(null);
    const [clicksSinceDismissal, setClicksSinceDismissal] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem('nbf_contacted_properties');
        const reviewed = localStorage.getItem('nbf_has_reviewed');
        const dismissed = localStorage.getItem('nbf_review_dismissed_at');
        const retryClicks = localStorage.getItem('nbf_review_retry_clicks');

        if (stored) setContactedList(JSON.parse(stored));
        if (reviewed) setHasReviewed(true);
        if (dismissed) setDismissedAt(parseInt(dismissed));
        if (retryClicks) setClicksSinceDismissal(parseInt(retryClicks));
    }, []);

    const trackPropertyContact = (propertyId: string) => {
        if (!user || hasReviewed || isModalOpen) return;

        // Logic check: Can we show the modal?
        let canShow = false;

        // Condition 1: Direct 3 clicks if never dismissed
        if (!dismissedAt && contactedList.length + (contactedList.includes(propertyId) ? 0 : 1) >= 3) {
            canShow = true;
        }

        // Condition 2: Check dismissal delay (3 days) + Additional clicks (5)
        if (dismissedAt) {
            const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
            const timePassed = Date.now() - dismissedAt;
            const newRetryCount = clicksSinceDismissal + 1;
            
            setClicksSinceDismissal(newRetryCount);
            localStorage.setItem('nbf_review_retry_clicks', newRetryCount.toString());

            if (timePassed > threeDaysInMs && newRetryCount >= 5) {
                canShow = true;
                // Reset dismissal state for a fresh cycle if they dismiss again
                setDismissedAt(null);
                setClicksSinceDismissal(0);
                localStorage.removeItem('nbf_review_dismissed_at');
                localStorage.removeItem('nbf_review_retry_clicks');
            }
        }

        if (!contactedList.includes(propertyId)) {
            const newList = [...contactedList, propertyId];
            setContactedList(newList);
            localStorage.setItem('nbf_contacted_properties', JSON.stringify(newList));
        }

        if (canShow) {
            setTimeout(() => {
                setIsModalOpen(true);
            }, 1500);
        }
    };

    const handleDismiss = () => {
        setIsModalOpen(false);
        const now = Date.now();
        setDismissedAt(now);
        setClicksSinceDismissal(0);
        localStorage.setItem('nbf_review_dismissed_at', now.toString());
        localStorage.setItem('nbf_review_retry_clicks', '0');
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        setHasReviewed(true);
        localStorage.setItem('nbf_has_reviewed', 'true');
    };

    return (
        <ReviewContext.Provider value={{ trackPropertyContact }}>
            {children}
            <ReviewModal 
                isOpen={isModalOpen} 
                onClose={handleDismiss} 
                onSuccess={handleSuccess} 
            />
        </ReviewContext.Provider>
    );
}

export const useReviews = () => {
    const context = useContext(ReviewContext);
    if (!context) throw new Error('useReviews must be used within ReviewProvider');
    return context;
};
