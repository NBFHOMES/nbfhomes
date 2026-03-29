'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export function SmartAdsSlider({ ads }: { ads: any[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    
    // Only show active ads, and fallback safely
    const activeAds = ads?.filter(ad => ad.is_active) || [];
    
    useEffect(() => {
        if (activeAds.length <= 1) return;
        
        const currentAd = activeAds[currentIndex];
        
        let timer: NodeJS.Timeout;

        // If it's NOT a video, we just use a standard timeout (e.g. 5 seconds)
        // If it IS a video, the onEnded event will trigger the slide instead
        const isCurrentVideo = (window.innerWidth < 768 && currentAd.mobile_media_type === 'video') || 
                               (window.innerWidth >= 768 && currentAd.desktop_media_type === 'video');

        if (!isCurrentVideo) {
            timer = setTimeout(() => {
                handleNext();
            }, 6000); // 6 seconds for images
        } else {
             // For video, ensure it plays. If autoplay blocked, might need fallback
             const vid = videoRefs.current[currentIndex];
             if (vid) {
                 vid.currentTime = 0;
                 vid.play().catch(e => {
                     // Autoplay blocked by browser policy on some connections, fallback to timer
                     console.warn('Video autoplay blocked, falling back to timer slide', e);
                     timer = setTimeout(() => handleNext(), 6000);
                 });
             }
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [currentIndex, activeAds.length]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % activeAds.length);
    };

    if (activeAds.length === 0) return null;

    return (
        <div className="w-full relative overflow-hidden bg-neutral-100 flex items-center justify-center">
            {/* Aspect Ratio Container: 16:9 for Desktop, 9:16 for Mobile */}
            <div className="w-full relative aspect-[9/16] md:aspect-[21/9] lg:aspect-[25/9] max-h-[600px]">
                {activeAds.map((ad, index) => {
                    const isActive = index === currentIndex;
                    // Classes for Right-to-Left slide
                    // If isActive: translate-x-0
                    // If it's the next one: translate-x-full
                    // If it's the previous one: -translate-x-full
                    let transformClass = 'translate-x-full opacity-0';
                    if (isActive) transformClass = 'translate-x-0 opacity-100 z-10';
                    else if (index === (currentIndex - 1 + activeAds.length) % activeAds.length) transformClass = '-translate-x-full opacity-0';

                    return (
                        <div 
                            key={ad.id} 
                            className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${transformClass}`}
                        >
                            <Link href={ad.action_url || '#'} className={ad.action_url ? 'cursor-pointer' : 'cursor-default pointer-events-none'}>
                                {/* Mobile View */}
                                <div className="block md:hidden w-full h-full">
                                    {ad.mobile_media_type === 'video' ? (
                                        <video
                                            ref={(el) => { videoRefs.current[index] = el; }}
                                            src={ad.mobile_media_url}
                                            className="w-full h-full object-cover"
                                            playsInline
                                            muted
                                            onEnded={() => {
                                                if (isActive) handleNext();
                                            }}
                                        />
                                    ) : (
                                        <img src={ad.mobile_media_url} className="w-full h-full object-cover" alt={ad.title} loading="lazy" />
                                    )}
                                </div>
                                
                                {/* Desktop View */}
                                <div className="hidden md:block w-full h-full">
                                    {ad.desktop_media_type === 'video' ? (
                                        <video
                                            ref={(el) => { videoRefs.current[index] = el; }}
                                            src={ad.desktop_media_url}
                                            className="w-full h-full object-cover"
                                            playsInline
                                            muted
                                            onEnded={() => {
                                                if (isActive) handleNext();
                                            }}
                                        />
                                    ) : (
                                        <img src={ad.desktop_media_url} className="w-full h-full object-cover" alt={ad.title} loading="lazy" />
                                    )}
                                </div>
                            </Link>
                        </div>
                    );
                })}
                
                {/* Manual Navigation Indicators */}
                {activeAds.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                        {activeAds.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
