'use client';

import { useState, useCallback, useEffect } from 'react';
import { Hero } from '@/components/hero';
import { Product, AdSettings } from '@/lib/types';
import { LatestProductCard } from '@/components/products/latest-product-card';
import { AdSection } from '@/components/home/ad-section';
import Link from 'next/link';
import { AutoScroll } from '@/components/ui/auto-scroll';
import { MessageCircle } from 'lucide-react';
import { getLabelPosition } from '@/lib/utils';
import { INDIAN_CITIES } from '@/constants/cities';
import { useAuth } from '@/lib/auth-context';
import { BannedView } from '@/components/common/banned-view';
import { useLocationDiscovery } from '@/hooks/use-location-discovery';
import { getProducts } from '@/lib/api';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface HomeClientProps {
    initialProducts: Product[];
    adSettings?: AdSettings | null;
}

const DISCOVERY_CACHE_KEY = 'nbf_discovery_cache_v1';
const DISCOVERY_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function HomeClient({ initialProducts, adSettings }: HomeClientProps) {
    const { profile, isLoading } = useAuth();
    
    // --- HYDRATION-SAFE INITIALIZATION ---
    // We MUST initialize with server-safe defaults (initialProducts) 
    // to prevent "patelji vs sushil" hydration errors.
    const [filteredProducts, setFilteredProducts] = useState(initialProducts);
    const [nearbyLocationName, setNearbyLocationName] = useState<string | null>(null);
    const [lastFetchCoords, setLastFetchCoords] = useState<{lat: number, lon: number} | null>(null);
    const [isSearchingNearby, setIsSearchingNearby] = useState(false);
    const { location, loading: locationLoading, permissionState, updateLocation } = useLocationDiscovery();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        
        // 1. RE-HYDRATE DISCOVERY CACHE AFTER MOUNT
        // This ensures the first client render matches server (initialProducts),
        // and then we instantly switch to discovery results.
        try {
            const stored = localStorage.getItem(DISCOVERY_CACHE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Date.now() - parsed.timestamp < DISCOVERY_TTL_MS) {
                    setFilteredProducts(parsed.products);
                    setNearbyLocationName(parsed.locationName);
                    setLastFetchCoords(parsed.coords);
                    console.log(`Sticky Discovery: Restored ${parsed.locationName} from cache.`);
                }
            }
        } catch (e) {
            console.error("Discovery cache hydration error", e);
        }
    }, []);

    const router = require('next/navigation').useRouter();

    // 2. Real-time Supabase Data Sync (Instant Admin Approval Reflection)
    useEffect(() => {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log('[Real-time] Initializing Supabase Realtime subscription...');

        const channel = supabase.channel('home_properties_realtime')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'properties' 
            }, (payload) => {
                console.log('[Real-time] UPDATE DETECTED:', payload.eventType, payload.new?.title);
                
                // 1. Force clear EVERYTHING from cache to ensure fresh start
                localStorage.removeItem(DISCOVERY_CACHE_KEY);
                sessionStorage.removeItem('nbf_discovery_coords'); // Extra safety
                
                // 2. Trigger Router Refresh (Updates Server Props / initialProducts)
                router.refresh();

                // 3. Re-trigger location discovery instantly
                // Resetting lastFetchCoords triggers the discovery useEffect
                setLastFetchCoords(null);
                
                console.log('[Real-time] UI Refresh triggered for new property.');
            })
            .subscribe((status) => {
                console.log('[Real-time] Subscription status:', status);
                if (status === 'CHANNEL_ERROR') {
                    console.error('[Real-time] FAILED to connect. Check if Realtime is enabled in Supabase Dashboard.');
                }
            });

        return () => {
            console.log('[Real-time] Cleaning up subscription...');
            supabase.removeChannel(channel);
        };
    }, [router, location]);

    // 3. Sync state with Server Props (Essential for router.refresh() to work)
    useEffect(() => {
        if (initialProducts) {
            setFilteredProducts(initialProducts);
        }
    }, [initialProducts]);

    // 3. Smart Discovery: Auto-detect location and find nearby properties (with Throttling)
    useEffect(() => {
        if (!mounted || !location?.lat || !location?.lon) return;

        const handleLocationDiscovery = async () => {
            const { calculateDistance } = require('@/lib/geocoding');
            
            // --- THROTTLING LOGIC ---
            // If we have data for THIS location (within 5km now for better sensitivity) AND it's < 30 mins old, SKIP fetch.
            if (lastFetchCoords) {
                const dist = calculateDistance(location.lat, location.lon, lastFetchCoords.lat, lastFetchCoords.lon);
                // Reduce threshold to 5km to address "stuck" feeling, while keeping stability
                if (dist < 5) return; 
            }

            setIsSearchingNearby(true);
            const locationDisplayName = location.area && location.area !== location.city 
                ? `${location.area}, ${location.city}` 
                : (location.city || "Nearby Areas");
            
            console.log(`Smart Discovery: Browser reported coords (${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}) -> ${locationDisplayName}`);

            try {
                // --- SMART DISCOVERY (BROADENED) ---
                // We use a multi-stage approach:
                // 1. Search by City/Area Name (Explicit match)
                // 2. Search by Radius (Spatial match)
                
                console.log(`Smart Discovery: Starting search for ${location.city} / ${location.area}...`);
                
                // Fetch by City (if available)
                let cityResults: any[] = [];
                if (location.city) {
                    cityResults = await getProducts({ city: location.city, limit: 24 });
                }

                // Fetch by Radius (10km)
                console.log(`Smart Discovery: Checking 10km spatial radius...`);
                let nearby = await getProducts({ 
                    lat: location.lat, 
                    lng: location.lon, 
                    radius: 10000 
                });
                
                // Combine and Deduplicate
                const combined = [...cityResults];
                nearby.forEach(p => {
                    if (!combined.find(cp => cp.id === p.id)) {
                        combined.push(p);
                    }
                });

                let results = combined;
                let activeRadius = 10;
                let activeLabel = locationDisplayName;

                // Stage 2: Fallback to 60km if still too few results (< 3)
                if (results.length < 3) {
                    console.log(`Smart Discovery: Fewer than 3 results. Expanding to 60km district-wide...`);
                    const broader = await getProducts({ 
                        lat: location.lat, 
                        lng: location.lon, 
                        radius: 60000 
                    });
                    
                    broader.forEach(p => {
                        if (!results.find(res => res.id === p.id)) {
                            results.push(p);
                        }
                    });
                    activeRadius = 60;
                }
                
                if (results && results.length > 0) {
                    const radiusLabel = activeRadius === 10 ? locationDisplayName : `Nearby in ${location.city || 'your area'} (District)`;
                    setFilteredProducts(results);
                    setNearbyLocationName(radiusLabel);
                    
                    const freshCache = {
                        products: results,
                        locationName: radiusLabel,
                        coords: { lat: location.lat, lon: location.lon },
                        timestamp: Date.now()
                    };
                    setLastFetchCoords(freshCache.coords);
                    localStorage.setItem(DISCOVERY_CACHE_KEY, JSON.stringify(freshCache));
                } else {
                    // Stage 3: Empty Search
                    setFilteredProducts([]);
                    setNearbyLocationName(`No properties found in ${location.city || 'your area'}`);
                    localStorage.removeItem(DISCOVERY_CACHE_KEY);
                }
                setIsSearchingNearby(false);
            } catch (error) {
                console.error('Smart Discovery Error:', error);
                setIsSearchingNearby(false);
            }
        };

        handleLocationDiscovery();
    }, [mounted, location, lastFetchCoords]);

    const handleSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setFilteredProducts(initialProducts);
            setNearbyLocationName(location?.city || null);
            return;
        }

        setIsSearchingNearby(true);
        // ... rest of handleSearch logic remains the same
        const lowerQuery = query.toLowerCase();

        // 1. CLIENT-SIDE Filter (Instant)
        const filtered = initialProducts.filter(product => {
            const titleMatch = product.title.toLowerCase().includes(lowerQuery);
            const cityMatch = product.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
            const addressMatch = product.description.toLowerCase().includes(lowerQuery);
            return titleMatch || cityMatch || addressMatch;
        });

        if (filtered.length > 0) {
            setFilteredProducts(filtered);
            setNearbyLocationName(query);
            setIsSearchingNearby(false);
            return;
        }

        // 2. SERVER-SIDE Query (Fallback)
        try {
            console.log(`No client-side matches for "${query}". Checking server...`);
            const serverResults = await getProducts({ query: lowerQuery });
            
            if (serverResults && serverResults.length > 0) {
                setFilteredProducts(serverResults);
                setNearbyLocationName(query);
            } else {
                // 3. NEARBY Fallback (Discovery)
                if (location?.lat && location?.lon) {
                    console.log(`Truly no results for "${query}". Showing nearby properties for user instead.`);
                    const nearby = await getProducts({ 
                        lat: location.lat, 
                        lng: location.lon, 
                        radius: 10000 
                    });
                    if (nearby && nearby.length > 0) {
                        setFilteredProducts(nearby);
                        setNearbyLocationName(`nearby area (Results for "${query}" not found)`);
                    } else {
                        setFilteredProducts([]); // truly empty
                        setNearbyLocationName(null);
                    }
                } else {
                    setFilteredProducts([]);
                    setNearbyLocationName(null);
                }
            }
        } catch (error) {
            console.error('Search fallback error:', error);
            setFilteredProducts([]);
        } finally {
            setIsSearchingNearby(false);
        }
    }, [initialProducts, location]);

    // Removed blocking isLoading check so that SSR HTML paints immediately!
    // Banned check will still gracefully take over once auth resolves in the background.

    if (profile?.status === 'banned') {
        return <BannedView />;
    }

    return (
        <div className="flex flex-col gap-10 md:gap-24 pb-20 md:pb-0 overflow-y-auto overflow-x-hidden w-full">
            {/* Hero Section */}
            <div className="relative top-0 z-40 bg-white/80 backdrop-blur-md md:sticky md:top-auto md:bg-transparent md:backdrop-blur-none transition-all">
                {/* Pass handleSearch to Hero -> HeroSearch */}
                <Hero onSearch={handleSearch} />
            </div>

            <AutoScroll />

            {/* Product Grid Section */}
            <section
                suppressHydrationWarning
                className="w-full max-w-[1920px] mx-auto px-6 md:px-12 relative z-20 mt-24 md:mt-28 bg-white rounded-t-3xl pt-8"
            >
                <div
                    suppressHydrationWarning
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12"
                >
                    <div className="mt-12 md:mt-0" suppressHydrationWarning>
                        {/* SEO H1 */}
                        <h1 className="sr-only">Best PGs and Rooms in {!mounted ? 'Mandsaur' : (location?.city || 'Mandsaur')}</h1>

                        {/* Suppress hydration warning for responsive classes */}
                        <div className="flex flex-col gap-1" suppressHydrationWarning>
                            <h3
                                suppressHydrationWarning
                                className="text-2xl md:text-4xl font-serif font-bold text-neutral-900 flex items-center gap-3"
                            >
                                {!mounted ? 'Featured Properties' : (
                                    locationLoading ? 'Locking GPS Satellite...' :
                                    isSearchingNearby ? 'Finding nearby...' : 
                                    nearbyLocationName ? `Properties in ${nearbyLocationName}` : 
                                    'Featured Properties'
                                )}
                                {mounted && nearbyLocationName && !isSearchingNearby && !locationLoading && (
                                    <div className="flex items-center gap-2" suppressHydrationWarning>
                                        <MapPin className="w-5 h-5 md:w-8 md:h-8 text-amber-500 animate-bounce" />
                                        <button 
                                            onClick={() => {
                                                localStorage.removeItem(DISCOVERY_CACHE_KEY);
                                                setLastFetchCoords(null);
                                                updateLocation();
                                            }}
                                            className="text-[10px] h-6 px-2 rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors uppercase tracking-widest font-sans font-bold text-neutral-400"
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                )}
                                {mounted && (isSearchingNearby || locationLoading) && (
                                    <Loader2 className="w-5 h-5 md:w-8 md:h-8 text-neutral-400 animate-spin" />
                                )}
                            </h3>
                            <div className="flex items-center gap-2 pt-2" suppressHydrationWarning>
                                <p className="text-gray-600" suppressHydrationWarning>
                                    {!mounted ? 'Handpicked PGs and flats for you.' : (
                                        locationLoading ? 'Wait a moment while we find your exact area...' :
                                        nearbyLocationName 
                                            ? `Showing the best properties in and around ${nearbyLocationName}` 
                                            : 'Handpicked PGs and flats for you.')
                                    }
                                </p>
                                {mounted && permissionState === 'prompt' && !location && (
                                    <button 
                                        onClick={() => {
                                            localStorage.removeItem(DISCOVERY_CACHE_KEY);
                                            // setCachedData is not available anymore, it was a derived state but we handle it elsewhere
                                            updateLocation();
                                        }}
                                        className="text-xs font-bold text-amber-600 hover:text-amber-700 underline flex items-center gap-1"
                                    >
                                        <Navigation className="w-3 h-3" /> Detect Location
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Premium View All Button */}
                    <Link
                        href="/properties"
                        className="hidden md:inline-flex bg-black text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
                    >
                        View All Properties
                    </Link>
                </div>

                <div suppressHydrationWarning className="w-full">
                    {filteredProducts.length > 0 ? (
                        <div className="flex flex-col gap-y-10 p-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-x-8 md:gap-y-12" suppressHydrationWarning>
                            {filteredProducts.map((product: any, index: number) => (
                                <LatestProductCard
                                    key={product.id}
                                    product={product}
                                    labelPosition={getLabelPosition(index)}
                                    className="w-full"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[30vh] gap-4" suppressHydrationWarning>
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-3xl">
                            🔍
                        </div>
                        <p className="text-xl font-medium text-neutral-900">No properties found</p>
                        <p className="text-neutral-500">Try searching for a different city or area.</p>
                        <button
                            onClick={() => {
                                setFilteredProducts(initialProducts);
                                // Optional: You might want to clear the search input here too, but that requires lifting state up further or using Context/EventBus. 
                                // For now, just resetting the list is good UX.
                            }}
                            className="text-black font-bold border-b border-black pb-0.5 hover:opacity-70"
                        >
                            View all properties
                        </button>
                    </div>
                )}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <Link
                        href="/properties"
                        className="inline-flex bg-black text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
                    >
                        View All Properties
                    </Link>
                </div>
            </section>

            {/* Conditional Display: Ad Section OR Trusted By Section */}
            {adSettings?.is_active ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <AdSection ad={adSettings} />
                </div>
            ) : (
                /* Social Proof / Trusted Partners - Only shown when no active ad */
                <div className="w-full border-y border-neutral-100 bg-neutral-50/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-10">
                        <p className="text-center text-sm font-medium text-neutral-400 uppercase tracking-widest mb-8">Trusted by Students & Professionals</p>
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            <span className="text-xl font-bold font-serif text-neutral-800">STUDENTS</span>
                            <span className="text-xl font-bold font-serif text-neutral-800">BACHELORS</span>
                            <span className="text-xl font-bold font-serif text-neutral-800">FAMILIES</span>
                            <span className="text-xl font-bold font-serif text-neutral-800">CORPORATES</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Newsletter / Enterprise CTA */}
            <section className="w-full bg-neutral-900 text-white overflow-hidden rounded-none md:rounded-3xl mx-auto max-w-[1920px]">
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
                    <div className="p-12 md:p-24 flex flex-col justify-center gap-8">
                        <h2 className="text-4xl md:text-5xl font-serif font-medium">Get Instant WhatsApp Alerts</h2>
                        <p className="text-neutral-400 text-lg max-w-md">
                            Join our WhatsApp community to get notified about new PGs and flats in Mandsaur before anyone else!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                            <Link
                                href="https://whatsapp.com/channel/0029Vb7ZqswLtOjF8AQiBL19"
                                target="_blank"
                                className="flex-1 bg-[#25D366] text-white px-8 py-4 rounded-full font-bold uppercase tracking-wide hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-3"
                            >
                                <MessageCircle className="w-6 h-6 fill-current" />
                                Join WhatsApp Channel
                            </Link>
                        </div>
                        <p className="text-xs text-neutral-600">
                            Join 500+ members receiving daily updates.
                        </p>
                    </div>
                    <div className="relative bg-neutral-800 hidden lg:block">
                        {/* Abstract Pattern or Image would go here */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-neutral-900 to-neutral-900" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-serif text-9xl opacity-5 font-black tracking-tighter">NBF</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
