import { Metadata } from 'next';
import { getReviewsAction } from '@/app/actions';
import { Star, Quote, User } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Verified Reviews & Happy Users | NBF Homes',
    description: 'Read what people say about NBF Homes. Discover how users are finding their perfect homes and PG without brokerage in Mandsaur and nearby cities.',
    openGraph: {
        title: 'Verified Reviews & Happy Users | NBF Homes',
        description: 'Discover verified reviews from happy NBF Homes users. Zero brokerage, genuine listings, and direct owner contacts.',
    }
};

export default async function ReviewsPage() {
    const res = await getReviewsAction(1, 100);
    const reviews = res.success ? res.reviews : [];

    // Calculate Average for Schema
    const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 5;

    // JSON-LD Schema
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'NBF Homes Property Search',
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avgRating,
            reviewCount: Math.max(reviews.length, 1)
        },
        review: reviews.map((r: any) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.user?.full_name || 'Verified User' },
            reviewRating: { '@type': 'Rating', ratingValue: r.rating },
            reviewBody: r.content,
            datePublished: r.created_at
        }))
    };

    return (
        <main className="min-h-screen bg-neutral-50 pb-20">
            {/* SEO Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header */}
            <div className="bg-white border-b border-neutral-100 py-20 px-4 text-center">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Verified Community Reviews</h1>
                    <p className="text-lg text-neutral-500">Discover why thousands of people trust NBF Homes for their housing needs.</p>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="max-w-7xl mx-auto px-4 -mt-10">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-100 flex flex-col md:flex-row items-center justify-around gap-8">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-neutral-900">{avgRating}/5</p>
                        <div className="flex justify-center my-1 text-yellow-400">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 fill-current" />)}
                        </div>
                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-widest mt-1">Average Rating</p>
                    </div>
                    <div className="h-12 w-[1px] bg-neutral-100 hidden md:block" />
                    <div className="text-center">
                        <p className="text-4xl font-bold text-neutral-900">{reviews.length}+</p>
                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-widest mt-1">Total Reviews</p>
                    </div>
                    <div className="h-12 w-[1px] bg-neutral-100 hidden md:block" />
                    <div className="text-center">
                        <p className="text-4xl font-bold text-neutral-900">100%</p>
                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-widest mt-1">Brokerage Free</p>
                    </div>
                </div>
            </div>

            {/* Reviews Feed */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                {reviews.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-neutral-200">
                        <p className="text-neutral-400 font-medium text-lg">Be the first to share your experience!</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {reviews.map((review: any) => (
                            <div key={review.id} className="break-inside-avoid bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow relative">
                                <Quote className="absolute top-6 right-8 w-10 h-10 text-neutral-50" />
                                
                                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                </div>

                                <p className="text-neutral-700 leading-relaxed mb-8 relative z-10 italic">"{review.content}"</p>

                                <div className="flex items-center gap-4 pt-6 border-t border-neutral-50">
                                    <div className="w-12 h-12 bg-neutral-100 rounded-full overflow-hidden flex-shrink-0 relative border-2 border-white shadow-sm">
                                        {review.user?.avatar_url ? (
                                            <Image 
                                                src={review.user.avatar_url} 
                                                alt={review.user.full_name || 'User'} 
                                                fill 
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                <User className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-neutral-900">{review.user?.full_name || 'Verified User'}</p>
                                        <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-tighter">Verified Experience</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
