'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { submitReviewAction, getReviewsAction } from '@/app/actions';
import { toast } from 'sonner';
import { generateHumanReview } from '@/lib/review-templates';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ReviewModal({ isOpen, onClose, onSuccess }: ReviewModalProps) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [recentReviews, setRecentReviews] = useState<string[]>([]);

    useEffect(() => {
        const fetchRecent = async () => {
             // Only fetch if opening
             const res = await getReviewsAction(1, 50);
             if (res.success) {
                 setRecentReviews(res.reviews.map((r: any) => r.content));
             }
        };

        if (isOpen) {
            fetchRecent();
            setFeedback(generateHumanReview());
            setRating(0);
            setIsSuccess(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            // Generate 3 truly unique suggestions
            const newSuggestions: string[] = [];
            let attempts = 0;
            while (newSuggestions.length < 3 && attempts < 50) {
                attempts++;
                const s = generateHumanReview();
                // Ensure no duplicates in the current list, and not in the DB, and not the current feedback
                if (!newSuggestions.includes(s) && s !== feedback && !recentReviews.includes(s)) {
                    newSuggestions.push(s);
                }
            }
            setSuggestions(newSuggestions);
        }
    }, [isOpen, recentReviews, feedback]);

    const handleSubmit = async () => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const res = await submitReviewAction(rating, feedback);
            if (res.success) {
                setIsSuccess(true);
                onSuccess(); // Mark as reviewed forever
                toast.success("समीक्षा आपकी प्रोफाइल में सेव हो गई है!");
            } else {
                toast.error(res.error || "समीक्षा जमा करने में विफल");
            }
        } catch (error) {
            toast.error("एक त्रुटि हुई");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleRedirect = () => {
        // Updated with user's specific Google Business Review link
        window.open('https://g.page/r/CfKcwrl6aAEGEAE/review', '_blank');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative"
            >
                {!isSuccess ? (
                    <>
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full transition-colors z-10">
                            <X className="w-5 h-5 text-neutral-400" />
                        </button>

                        <div className="p-8">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-neutral-900">क्या आपको NBF होम्स पसंद आ रहे हैं?</h3>
                                <p className="text-neutral-500 text-sm mt-1">अपनी स्टार रेटिंग चुनें और अनुभव साझा करें</p>
                            </div>

                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setRating(s)}
                                        className="transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <Star
                                            className={`w-10 h-10 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200'}`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 block">आपकी प्रतिक्रिया</label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="w-full p-4 bg-neutral-50 border-2 border-neutral-100 rounded-xl focus:border-black outline-none min-h-[100px] text-sm resize-none transition-all text-neutral-700"
                                        placeholder="NBF होम्स के साथ आपका अनुभव..."
                                    />
                                </div>

                                {/* Dynamic Suggestions */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">सुझाई गई समीक्षाएँ (उपयोग करने के लिए क्लिक करें)</p>
                                    <div className="flex flex-col gap-2">
                                        {suggestions.map((s, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setFeedback(s)}
                                                className="text-left text-xs p-2 bg-blue-50/50 border border-blue-100 rounded-lg hover:bg-blue-100/50 transition-colors text-blue-700 leading-tight"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !feedback.trim() || rating === 0}
                                    className="w-full py-6 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "समीक्षा जमा करें"}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 text-center"
                    >
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-900 mb-2">आपका धन्यवाद!</h3>
                        <p className="text-neutral-500 mb-8 px-2">आपकी समीक्षा हमारे प्लेटफॉर्म पर लाइव है। क्या आप गूगल पर और लोगों तक पहुँचने में हमारी मदद कर सकते हैं?</p>

                        <div className="space-y-3">
                            <Button
                                onClick={handleGoogleRedirect}
                                className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                            >
                                <ExternalLink className="w-5 h-5" />
                                गूगल पर रेटिंग दें
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="w-full h-12 text-neutral-400 font-medium"
                            >
                                बाद में
                            </Button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
