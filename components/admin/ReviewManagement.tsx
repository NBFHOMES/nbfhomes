'use client';

import { useState, useEffect, useCallback } from 'react';
import { getReviewsAdminAction, deleteReviewAction, replyToReviewAction, updateReviewStatusAction } from '@/app/actions';
import { Trash2, Star, User, Loader2, AlertCircle, Quote, MessageCircle, Ban, Send, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useLoader } from '@/context/loader-context';
import Image from 'next/image';

export function ReviewManagement({ adminId }: { adminId: string }) {
    const { showLoader, hideLoader } = useLoader();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getReviewsAdminAction(page, 20);
            if (res.success) {
                setReviews(res.reviews);
                setTotal(res.total ?? 0);
            } else {
                toast.error(res.error || "Failed to load reviews");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleDelete = async (id: string) => {
        if (!confirm("क्या आप वाकई इस समीक्षा को हटाना चाहते हैं?")) return;
        
        showLoader();
        try {
            const res = await deleteReviewAction(id, adminId);
            if (res.success) {
                toast.success("समीक्षा सफलतापूर्वक हटा दी गई");
                setReviews(prev => prev.filter(r => r.id !== id));
                setTotal(prev => prev - 1);
            } else {
                toast.error(res.error || "हटाने में विफल");
            }
        } catch (error) {
            toast.error("एक त्रुटि हुई");
        } finally {
            hideLoader();
        }
    };

    const handleReply = async (id: string) => {
        if (!replyText.trim()) return;
        showLoader();
        try {
            const res = await replyToReviewAction(id, replyText, adminId);
            if (res.success) {
                toast.success("जवाब भेज दिया गया");
                setReplyingTo(null);
                setReplyText("");
                fetchReviews();
            } else {
                toast.error(res.error || "जवाब भेजने में विफल");
            }
        } catch (error) {
            toast.error("एक त्रुटि हुई");
        } finally {
            hideLoader();
        }
    };

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'blocked') => {
        const msg = status === 'blocked' ? "इस उपयोगकर्ता को ब्लॉक करें?" : `स्थिति को ${status} पर सेट करें?`;
        if (!confirm(msg)) return;
        
        showLoader();
        try {
            const res = await updateReviewStatusAction(id, status, adminId);
            if (res.success) {
                toast.success(`स्थिति ${status} में अपडेट की गई`);
                fetchReviews();
            } else {
                toast.error(res.error || "अपडेट करने में विफल");
            }
        } catch (error) {
            toast.error("एक त्रुटि हुई");
        } finally {
            hideLoader();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Review Moderation</h2>
                    <p className="text-neutral-500 text-sm">प्रतिक्रिया प्रबंधित करें और खराब समीक्षाएं हटाएं</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-neutral-100">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Total Reviews: </span>
                    <span className="text-lg font-bold text-neutral-900">{total}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-neutral-300 mb-4" />
                        <p className="text-neutral-400">समीक्षाएं लोड हो रही हैं...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="p-20 text-center text-neutral-400 flex flex-col items-center">
                        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                        अभी तक कोई समीक्षा नहीं मिली।
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-100">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-6 hover:bg-neutral-50/50 transition-colors group">
                                <div className="flex gap-6">
                                    {/* User Info */}
                                    <div className="w-48 flex-shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 overflow-hidden relative">
                                                {review.user?.avatar_url ? (
                                                    <Image src={review.user.avatar_url} alt="User" fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-neutral-900 truncate" title={review.user?.full_name}>
                                                    {review.user?.full_name || 'User'}
                                                </p>
                                                <p className="text-[10px] text-neutral-400 truncate">{review.user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase">Date</span>
                                            <p className="text-xs text-neutral-600">
                                                {new Date(review.created_at).toLocaleDateString('hi-IN', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1 text-yellow-400 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-neutral-200'}`} 
                                                />
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <Quote className="absolute -top-2 -left-3 w-8 h-8 text-neutral-100" />
                                            <p className="text-neutral-700 leading-relaxed relative z-10 italic">
                                                "{review.content}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="w-32 flex flex-col items-end gap-2">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                                                className={`p-2 rounded-lg transition-all ${replyingTo === review.id ? 'bg-black text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}
                                                title="जवाब दें"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(review.id, review.status === 'blocked' ? 'approved' : 'blocked')}
                                                className={`p-2 rounded-lg transition-all ${review.status === 'blocked' ? 'bg-red-500 text-white' : 'text-neutral-400 hover:bg-red-50 hover:text-red-500'}`}
                                                title={review.status === 'blocked' ? "अनब्लॉक करें" : "ब्लॉक करें"}
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="p-2 text-neutral-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                                                title="समीक्षा हटाएं"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            review.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                            review.status === 'blocked' ? 'bg-red-100 text-red-700' :
                                            'bg-neutral-100 text-neutral-500'
                                        }`}>
                                            {review.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Reply Section */}
                                {(replyingTo === review.id || review.admin_reply) && (
                                    <div className="mt-4 ml-14 pl-6 border-l-2 border-neutral-100 space-y-4">
                                        {review.admin_reply && (
                                            <div className="bg-neutral-50 p-4 rounded-xl relative">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-neutral-900 uppercase">Admin Reply</span>
                                                    <span className="text-[10px] text-neutral-400 ml-auto">
                                                        {new Date(review.admin_reply_at).toLocaleDateString('hi-IN')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-neutral-700 leading-relaxed font-medium">
                                                    {review.admin_reply}
                                                </p>
                                            </div>
                                        )}

                                        {replyingTo === review.id && (
                                            <div className="flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="अपना जवाब यहाँ लिखें..."
                                                    className="w-full p-4 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-black outline-none min-h-[100px] shadow-sm"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setReplyingTo(null)}
                                                        className="px-4 py-2 text-xs font-bold text-neutral-500 hover:bg-neutral-100 rounded-lg transition-all"
                                                    >
                                                        रद्द करें
                                                    </button>
                                                    <button
                                                        onClick={() => handleReply(review.id)}
                                                        disabled={!replyText.trim()}
                                                        className="px-6 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 disabled:opacity-50 flex items-center gap-2 transition-all"
                                                    >
                                                        <Send className="w-3 h-3" />
                                                        जवाब भेजें
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {total > 20 && (
                <div className="flex justify-center gap-4 py-4">
                    <button 
                        disabled={page === 1} 
                        onClick={() => setPage(p => p - 1)} 
                        className="px-6 py-2 bg-white border border-neutral-200 rounded-xl disabled:opacity-50 text-sm font-bold shadow-sm"
                    >
                        पिछला
                    </button>
                    <span className="py-2 text-neutral-400 font-bold text-sm uppercase tracking-widest px-4">Page {page}</span>
                    <button 
                        disabled={page * 20 >= total}
                        onClick={() => setPage(p => p + 1)} 
                        className="px-6 py-2 bg-white border border-neutral-200 rounded-xl disabled:opacity-50 text-sm font-bold shadow-sm"
                    >
                        अगला
                    </button>
                </div>
            )}
        </div>
    );
}
