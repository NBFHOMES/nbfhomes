'use client';

import { useReviews } from '@/lib/review-context';
import { Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AddReviewButton() {
    const { openManualReview, hasReviewed } = useReviews();

    if (hasReviewed) return null;

    return (
        <div className="mt-8 flex justify-center">
            <Button
                onClick={openManualReview}
                className="group relative overflow-hidden bg-black text-white px-8 py-7 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-xl hover:shadow-2xl active:scale-95"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Star className="w-5 h-5 text-yellow-400 group-hover:rotate-12 transition-transform" />
                <span className="text-lg">हमें अपनी समीक्षा दें</span>
                <Plus className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </Button>
        </div>
    );
}
