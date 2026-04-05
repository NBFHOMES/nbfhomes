'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
    MessageCircle, Phone, ArrowLeft, Building, 
    Clock, ExternalLink, Hash, Search, User,
    Calendar, CheckCircle2, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getUserEnquiries } from '@/lib/api';
import { toast } from 'sonner';
import { supabase } from '@/lib/db';

export default function UserEnquiriesPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [propertiesCount, setPropertiesCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        const fetchEnquiries = async () => {
            if (user) {
                try {
                    const data = await getUserEnquiries(user.id);
                    setEnquiries(data.enquiries || []);
                    setPropertiesCount(data.propertiesCount || 0);
                } catch (error) {
                    console.error('Error fetching enquiries:', error);
                    toast.error('Failed to load enquiries');
                } finally {
                    setLoading(false);
                }
            }
        };

        if (user) {
            fetchEnquiries();

            // Real-time Subscription for new leads
            const channel = supabase
                .channel('leads-realtime')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'leads_activity'
                    },
                    (payload) => {
                        console.log('Real-time lead received:', payload);
                        // Refresh data when a new lead is inserted
                        fetchEnquiries();
                        toast.info('New enquiry received!', {
                            icon: '🔔',
                            description: 'Someone just contacted you about a property.'
                        });
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const filteredEnquiries = enquiries.filter(e => 
        e.lead_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.property_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.lead_phone.includes(searchTerm)
    );

    function timeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 30) return `${days}d ago`;
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }

    const handleShareProfile = async () => {
        const profileUrl = `${window.location.origin}/view-profile/${user?.id}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Check out my properties on NBF Homes',
                    text: 'Contact me for premium PGs and Flats in Mandsaur!',
                    url: profileUrl,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(profileUrl);
            toast.success('Profile link copied to clipboard!');
        }
    };

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-4">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-[3px] border-neutral-100 border-t-black animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Hash className="w-6 h-6 text-neutral-300" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-24">
            {/* Premium Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-neutral-200 sticky top-0 z-40 transition-all">
                <div className="max-w-3xl mx-auto px-4 h-18 flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-4 min-w-0">
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => router.back()}
                            className="p-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-2xl transition-all border border-neutral-200/50 shrink-0 shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5 text-neutral-900" />
                        </motion.button>
                        <div className="min-w-0">
                            <h1 className="text-xl font-black text-neutral-900 tracking-tight leading-none">Enquiries</h1>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-none">Real-time Dashboard</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex bg-black text-white px-3 py-1.5 rounded-full text-xs font-black items-center gap-2 shadow-lg shadow-black/10">
                           <CheckCircle2 className="w-3 h-3 text-green-400" />
                           {enquiries.length} Leads
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 pt-8">
                
                {/* Search & Stats Bar */}
                <div className="space-y-6 mb-8">
                    <div className="flex flex-col gap-4">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none transition-colors group-focus-within:text-black text-neutral-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search by name, phone or property title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-white border border-neutral-200 rounded-3xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-neutral-900 transition-all shadow-sm group-hover:shadow-md"
                            />
                        </div>
                        
                        {/* Summary Pill for Mobile */}
                        <div className="flex sm:hidden items-center justify-between px-1">
                            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                <MessageCircle className="w-3 h-3 text-blue-500" />
                                Recent Activity
                            </p>
                            <span className="text-xs font-black h-6 flex items-center px-2 bg-neutral-900 text-white rounded-lg">
                                {filteredEnquiries.length} Results
                            </span>
                        </div>
                    </div>
                </div>

                {/* Enquiries List */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {filteredEnquiries.length > 0 ? (
                            filteredEnquiries.map((enquiry, idx) => {
                                const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
                                const propertyUrl = `${siteUrl}/product/${enquiry.property_handle}`;
                                const waMessage = encodeURIComponent(
                                    `Hello ${enquiry.lead_name}, aapne NBF Homes par hamari property "${enquiry.property_title}" dekhi thi. Kya aap ismein interested hain?\n\nProperty Link: ${propertyUrl}`
                                );

                                const isWhatsApp = enquiry.action_type === 'whatsapp';

                                return (
                                    <motion.div 
                                        key={enquiry.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ 
                                            duration: 0.3,
                                            delay: idx * 0.05,
                                            ease: "easeOut"
                                        }}
                                        className="bg-white rounded-[2rem] p-5 sm:p-6 border border-neutral-200/80 shadow-sm hover:shadow-xl hover:shadow-neutral-900/5 transition-all group relative overflow-hidden"
                                    >
                                        {/* Activity Indicator Stripe */}
                                        <div className={`absolute top-0 left-0 w-1.5 h-full ${isWhatsApp ? 'bg-green-500' : 'bg-blue-500'} opacity-80`} />

                                        <div className="flex flex-col gap-6">
                                            
                                            {/* Top Section: Info */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner overflow-hidden border ${isWhatsApp ? 'bg-green-50 border-green-100 text-green-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                                                        {isWhatsApp ? (
                                                            <MessageCircle className="w-6 h-6 stroke-[2.5]" />
                                                        ) : (
                                                            <Phone className="w-6 h-6 stroke-[2.5]" />
                                                        )}
                                                    </div>
                                                    <div className="space-y-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="font-black text-lg text-neutral-900 truncate tracking-tight">{enquiry.lead_name}</h3>
                                                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isWhatsApp ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {isWhatsApp ? 'WhatsApp Interest' : 'Call Inquiry'}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm font-bold text-neutral-600">
                                                            <span className="p-1 bg-neutral-100 rounded-md">
                                                               <Phone className="w-3 h-3" />
                                                            </span>
                                                            <a href={`tel:+91${enquiry.lead_phone.replace(/\D/g, '')}`} className="hover:text-black transition-colors font-mono tracking-tight">
                                                                +91 {enquiry.lead_phone}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end shrink-0 py-1">
                                                    {/* Date and Time removed for cleaner UI as requested */}
                                                </div>
                                            </div>

                                            {/* Property Link Box */}
                                            <div className="bg-neutral-50/80 border border-neutral-100 p-3.5 rounded-2xl group/link hover:bg-neutral-100 transition-colors">
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Property Listing</p>
                                                <a 
                                                    href={propertyUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between gap-3"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0 shadow-sm">
                                                            <Building className="w-4 h-4 text-neutral-600" />
                                                        </div>
                                                        <span className="text-sm font-black text-neutral-900 truncate group-hover/link:text-blue-600 transition-colors">
                                                            {enquiry.property_title}
                                                        </span>
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-neutral-300 group-hover/link:text-neutral-900 transition-colors shrink-0" />
                                                </a>
                                            </div>

                                            {/* Action Buttons Section */}
                                            <div className="grid grid-cols-2 gap-3 pt-2">
                                                <motion.a 
                                                    whileTap={{ scale: 0.97 }}
                                                    href={`tel:+91${enquiry.lead_phone.replace(/\D/g, '')}`}
                                                    className="flex items-center justify-center gap-2.5 py-4 px-4 bg-white text-black border-2 border-neutral-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-50 hover:border-neutral-200 transition-all shadow-sm active:bg-neutral-100"
                                                >
                                                    <Phone className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                                                    Call User
                                                </motion.a>
                                                <motion.a 
                                                    whileTap={{ scale: 0.97 }}
                                                    href={`https://wa.me/91${enquiry.lead_phone.replace(/\D/g, '')}?text=${waMessage}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2.5 py-4 px-4 bg-green-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:translate-y-0.5"
                                                >
                                                    <MessageCircle className="w-4 h-4 fill-white/10" />
                                                    WhatsApp
                                                </motion.a>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-neutral-100 px-6 overflow-hidden relative"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 opacity-20" />
                                
                                <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative">
                                    <div className="absolute inset-0 bg-amber-500/5 rounded-full animate-ping" />
                                    <MessageCircle className="w-10 h-10 text-neutral-200 relative z-10" />
                                </div>

                                {propertiesCount === 0 ? (
                                    <>
                                        <h3 className="text-xl font-black text-neutral-900 tracking-tight">Post your first property</h3>
                                        <p className="text-sm font-medium text-neutral-400 mt-2 max-w-[240px] mx-auto leading-relaxed">
                                            List your PG or Flat to start receiving enquiries from students and professionals!
                                        </p>
                                        <motion.button 
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => router.push('/post-property')}
                                            className="mt-8 inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Post Property
                                        </motion.button>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                                            {searchTerm ? 'No results for search' : 'No enquiries yet'}
                                        </h3>
                                        <p className="text-sm font-medium text-neutral-400 mt-2 max-w-[240px] mx-auto leading-relaxed">
                                            {searchTerm 
                                                ? 'Try adjusting your search terms or clearing the filter.' 
                                                : 'Share your profile or listings on social media to get more enquiries!'}
                                        </p>
                                        
                                        <div className="flex flex-col gap-3 mt-8">
                                            {searchTerm ? (
                                                <button 
                                                    onClick={() => setSearchTerm('')}
                                                    className="text-sm font-black text-black border-b-2 border-black/10 hover:border-black transition-all pb-0.5 mx-auto"
                                                >
                                                    Clear Search Results
                                                </button>
                                            ) : (
                                                <motion.button 
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleShareProfile}
                                                    className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-green-500/20"
                                                >
                                                    <MessageCircle className="w-4 h-4 fill-white/10" />
                                                    Share Profile on WhatsApp
                                                </motion.button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
