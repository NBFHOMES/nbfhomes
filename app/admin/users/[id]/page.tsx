'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserDetailsForAdmin } from '@/lib/api';
import {
    User, Phone, Mail, Calendar, Eye, MessageCircle,
    ArrowLeft, Download, ExternalLink, TrendingUp, Building,
    Hash, Clock, CheckCircle, AlertCircle, FileText, Home,
    Briefcase, ShieldCheck
} from 'lucide-react';

const CATEGORY_MAP: Record<string, { label: string; emoji: string }> = {
    student:        { label: 'Student',        emoji: '🎓' },
    job:            { label: 'Working Pro',    emoji: '💼' },
    property_owner: { label: 'Property Owner', emoji: '🏠' },
    business:       { label: 'Business',       emoji: '🏢' },
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

type TabType = 'timeline' | 'contacts' | 'views' | 'inquiries' | 'received';

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<TabType>('timeline');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await getUserDetailsForAdmin(userId);
            if (data) {
                setUserData(data);
            } else {
                alert('User not found');
                router.back();
            }
            setLoading(false);
        };
        load();
    }, [userId, router]);

    const handleExport = () => {
        if (!userData) return;
        const rows = [
            ['Type', 'Date', 'Property', 'Action/Details', 'Status'],
            ...(userData.leads || []).map((l: any) => ['Lead', new Date(l.created_at).toLocaleString(), l.property?.title, l.action_type, l.status]),
            ...(userData.views || []).map((v: any) => ['View', new Date(v.created_at).toLocaleString(), v.property?.title, 'Viewed', '-']),
            ...(userData.inquiries || []).map((i: any) => ['Inquiry', new Date(i.created_at).toLocaleString(), '-', i.message, i.status]),
        ];
        const csv = rows.map((r: any[]) => r.map((c: any) => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user_history_${userData.user?.full_name || userId}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-neutral-200 border-t-neutral-900 animate-spin" />
                    <p className="text-sm text-neutral-500 font-medium">Loading user history...</p>
                </div>
            </div>
        );
    }
    if (!userData) return null;

    const { user, leads, views, inquiries, leadsReceived } = userData;
    const totalContacts = leads?.length || 0;
    const totalViews = views?.length || 0;
    const totalInquiries = inquiries?.length || 0;
    const totalReceived = leadsReceived?.length || 0;
    const conversionRate = totalViews > 0 ? ((totalContacts / totalViews) * 100).toFixed(1) : '0';

    const catInfo = CATEGORY_MAP[user?.profession] || null;
    const contactNum = user?.contact_number || user?.phone_number || '';
    const whatsappNum = user?.whatsapp_number || '';
    const displayName = user?.full_name || user?.first_name
        ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
        : (user?.full_name || user?.email?.split('@')[0] || 'Unknown User');

    // Unified timeline: leads + views sorted by date
    const timeline = [
        ...(leads || []).map((l: any) => ({
            ...l,
            _type: 'contact',
            _date: new Date(l.created_at),
            _label: l.action_type === 'whatsapp' ? 'WhatsApp Click' : 'Contact Click',
        })),
        ...(views || []).map((v: any) => ({
            ...v,
            _type: 'view',
            _date: new Date(v.created_at),
            _label: 'Property Viewed',
        })),
    ].sort((a, b) => b._date.getTime() - a._date.getTime());

    const tabs: { id: TabType; label: string; count: number; icon: any; color: string }[] = [
        { id: 'timeline', label: 'All Activity',  count: timeline.length, icon: Clock,         color: 'text-neutral-700' },
        { id: 'contacts', label: 'Contacts Made', count: totalContacts,   icon: MessageCircle, color: 'text-purple-600' },
        { id: 'received', label: 'Received Enquiries', count: totalReceived, icon: Hash,        color: 'text-green-600' },
        { id: 'views',    label: 'Properties Viewed', count: totalViews,  icon: Eye,           color: 'text-blue-600' },
        { id: 'inquiries',label: 'Inquiries',     count: totalInquiries,  icon: FileText,      color: 'text-orange-600' },
    ];

    return (
        <div className="min-h-screen bg-neutral-50 pb-16">

            {/* ── Sticky Header ── */}
            <header className="bg-white border-b border-neutral-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5 text-neutral-600" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-base md:text-lg font-bold text-neutral-900 truncate">{displayName}</h1>
                            <p className="text-xs text-neutral-400 hidden md:block">Complete Activity History</p>
                        </div>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors shrink-0"
                    >
                        <Download className="w-4 h-4 text-neutral-500" />
                        <span className="hidden md:inline">Export CSV</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

                {/* ── Profile Card ── */}
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                    {/* gradient top strip */}
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />
                    <div className="p-5 md:p-6">
                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white flex items-center justify-center text-2xl font-bold shrink-0 shadow-lg">
                                {displayName.charAt(0).toUpperCase()}
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h2 className="text-xl font-bold text-neutral-900">{displayName}</h2>
                                    {user?.status === 'banned' && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[11px] font-bold rounded-full border border-red-200">🚫 Banned</span>
                                    )}
                                    {catInfo && (
                                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[11px] font-bold rounded-full border border-neutral-200">
                                            {catInfo.emoji} {catInfo.label}
                                        </span>
                                    )}
                                    {user?.is_verified && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-200">
                                            <ShieldCheck className="w-3 h-3" /> Verified
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-neutral-500 mb-3">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Joined {new Date(user?.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>

                                {/* Contact Info Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {/* Email */}
                                    <div className="flex items-center gap-2.5 p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                                        <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                                        <span className="text-sm text-neutral-700 truncate font-medium">{user?.email || 'N/A'}</span>
                                    </div>

                                    {/* Contact Number */}
                                    <div className="flex items-center gap-2.5 p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                                        <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                                        {contactNum ? (
                                            <div className="flex items-center justify-between flex-1 min-w-0">
                                                <span className="text-sm font-mono font-bold text-blue-800 truncate">+91 {contactNum}</span>
                                                <a
                                                    href={`tel:+91${contactNum.replace(/\D/g, '')}`}
                                                    className="text-[11px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-lg hover:bg-blue-200 transition-colors shrink-0 ml-2"
                                                >
                                                    Call
                                                </a>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-neutral-400 italic">No contact number</span>
                                        )}
                                    </div>

                                    {/* WhatsApp Number */}
                                    <div className="flex items-center gap-2.5 p-2.5 bg-green-50 rounded-xl border border-green-100">
                                        <MessageCircle className="w-4 h-4 text-green-500 shrink-0" />
                                        {whatsappNum ? (
                                            <div className="flex items-center justify-between flex-1 min-w-0">
                                                <span className="text-sm font-mono font-bold text-green-800 truncate">+91 {whatsappNum}</span>
                                                <a
                                                    href={`https://wa.me/91${whatsappNum.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[11px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-lg hover:bg-green-200 transition-colors shrink-0 ml-2"
                                                >
                                                    Chat
                                                </a>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-neutral-400 italic">No WhatsApp number</span>
                                        )}
                                    </div>

                                    {/* Properties Listed */}
                                    <div className="flex items-center gap-2.5 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                                        <Home className="w-4 h-4 text-amber-500 shrink-0" />
                                        <span className="text-sm font-bold text-amber-800">Listed {user?.totalProperties || 0} properties</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                        { label: 'Properties Viewed',  value: totalViews,     icon: Eye,           bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100'   },
                        { label: 'Contacts Made',       value: totalContacts,  icon: MessageCircle, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
                        { label: 'Enquiries Received',  value: totalReceived,  icon: Hash,          bg: 'bg-green-50',  text: 'text-green-700', border: 'border-green-100' },
                        { label: 'Inquiries Sent',      value: totalInquiries, icon: FileText,      bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
                        { label: 'Conversion Rate',     value: `${conversionRate}%`, icon: TrendingUp, bg: 'bg-neutral-50', text: 'text-neutral-700', border: 'border-neutral-100' },
                    ].map(({ label, value, icon: Icon, bg, text, border }) => (
                        <div key={label} className={`${bg} border ${border} rounded-xl p-4`}>
                            <div className={`${text} text-2xl font-bold`}>{value}</div>
                            <div className="flex items-center gap-1 mt-1">
                                <Icon className={`w-3 h-3 ${text}`} />
                                <span className={`text-[11px] font-semibold ${text}`}>{label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Tabs ── */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                    {/* Tab bar */}
                    <div className="flex overflow-x-auto border-b border-neutral-200 scrollbar-hide">
                        {tabs.map(({ id, label, count, icon: Icon, color }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                                    activeTab === id
                                        ? 'border-neutral-900 text-neutral-900'
                                        : 'border-transparent text-neutral-400 hover:text-neutral-700'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${activeTab === id ? color : ''}`} />
                                {label}
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    activeTab === id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'
                                }`}>{count}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Timeline Tab ── */}
                    {activeTab === 'timeline' && (
                        <div className="divide-y divide-neutral-100">
                            {timeline.length === 0 ? (
                                <EmptyState icon={Clock} text="No activity recorded yet" />
                            ) : (
                                timeline.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 hover:bg-neutral-50/50 transition-colors">
                                        {/* Icon */}
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                            item._type === 'contact'
                                                ? item.action_type === 'whatsapp' ? 'bg-green-50' : 'bg-purple-50'
                                                : 'bg-blue-50'
                                        }`}>
                                            {item._type === 'contact'
                                                ? item.action_type === 'whatsapp'
                                                    ? <MessageCircle className="w-4 h-4 text-green-600" />
                                                    : <Phone className="w-4 h-4 text-purple-600" />
                                                : <Eye className="w-4 h-4 text-blue-600" />
                                            }
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-1 ${
                                                        item._type === 'contact'
                                                            ? item.action_type === 'whatsapp' ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'
                                                            : 'bg-blue-50 text-blue-700'
                                                    }`}>
                                                        {item._label}
                                                    </span>
                                                    <p className="text-sm font-semibold text-neutral-900 truncate">
                                                        {item.property?.title || item.property_title || 'Unknown Property'}
                                                    </p>
                                                    {(item.property?.location || item.property_location) && (
                                                        <p className="text-xs text-neutral-400">{item.property?.location || item.property_location}</p>
                                                    )}
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs text-neutral-500 font-medium">{timeAgo(item.created_at)}</p>
                                                    <p className="text-[10px] text-neutral-300">{new Date(item.created_at).toLocaleDateString('en-IN')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ── Contacts Tab ── */}
                    {activeTab === 'contacts' && (
                        <div className="divide-y divide-neutral-100">
                            {leads.length === 0 ? (
                                <EmptyState icon={MessageCircle} text="No contacts made yet" />
                            ) : (
                                leads.map((lead: any) => (
                                    <div key={lead.id} className="p-4 hover:bg-neutral-50/50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold uppercase shrink-0 ${
                                                lead.action_type === 'whatsapp'
                                                    ? 'bg-green-50 text-green-700 border border-green-100'
                                                    : 'bg-purple-50 text-purple-700 border border-purple-100'
                                            }`}>
                                                {lead.action_type === 'whatsapp'
                                                    ? <MessageCircle className="w-3 h-3" />
                                                    : <Phone className="w-3 h-3" />
                                                }
                                                {lead.action_type === 'whatsapp' ? 'WhatsApp' : 'Call'}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-neutral-900 truncate">
                                                    {lead.property?.title || 'Unknown Property'}
                                                </p>
                                                <p className="text-xs text-neutral-400">{lead.property?.location || ''}</p>
                                                {lead.property?.id && (
                                                    <a
                                                        href={`/product/${lead.property.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 mt-1"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        View Property
                                                    </a>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-neutral-500 font-medium">{timeAgo(lead.created_at)}</p>
                                                <p className="text-[10px] text-neutral-300">{new Date(lead.created_at).toLocaleDateString('en-IN')}</p>
                                                <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                                    lead.status === 'closed' ? 'bg-neutral-100 text-neutral-500' :
                                                    lead.status === 'interested' ? 'bg-purple-50 text-purple-700' :
                                                    lead.status === 'contacted' ? 'bg-orange-50 text-orange-700' :
                                                    'bg-yellow-50 text-yellow-700'
                                                }`}>
                                                    {lead.status || 'new'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ── Received Enquiries Tab ── */}
                    {activeTab === 'received' && (
                        <div className="divide-y divide-neutral-100">
                            {leadsReceived.length === 0 ? (
                                <EmptyState icon={Hash} text="No enquiries received yet" />
                            ) : (
                                leadsReceived.map((lead: any) => {
                                    const siteUrl = window.location.origin;
                                    const propertyUrl = `${siteUrl}/product/${lead.property_handle}`;
                                    const waMessage = encodeURIComponent(
                                        `Hello ${lead.lead_name}, you visited the property "${lead.property_title}" on NBF Homes. Are you interested in this property?\n\nProperty Link: ${propertyUrl}`
                                    );
                                    
                                    return (
                                        <div key={lead.id} className="p-4 hover:bg-neutral-50/50 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold">
                                                        {lead.lead_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-neutral-900">{lead.lead_name}</h4>
                                                        <p className="text-xs text-neutral-500 font-mono">+91 {lead.lead_phone}</p>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <span className="text-[10px] text-neutral-400 font-medium">Interested in:</span>
                                                            <a 
                                                                href={propertyUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-[10px] text-blue-600 font-bold hover:underline truncate max-w-[150px]"
                                                            >
                                                                {lead.property_title}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row items-center gap-2">
                                                    {lead.lead_phone && (
                                                        <a 
                                                            href={`tel:+91${lead.lead_phone.replace(/\D/g, '')}`}
                                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Phone className="w-3.5 h-3.5" />
                                                            Call
                                                        </a>
                                                    )}
                                                    {lead.lead_phone && (
                                                        <a 
                                                            href={`https://wa.me/91${lead.lead_phone.replace(/\D/g, '')}?text=${waMessage}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100 hover:bg-green-100 transition-colors"
                                                        >
                                                            <MessageCircle className="w-3.5 h-3.5" />
                                                            WhatsApp
                                                        </a>
                                                    )}
                                                    <div className="text-right ml-2 min-w-[70px]">
                                                        <p className="text-[10px] text-neutral-400 font-medium">{timeAgo(lead.created_at)}</p>
                                                        <span className="inline-block px-1 py-0.5 bg-neutral-100 text-neutral-500 text-[9px] rounded uppercase font-bold">
                                                            {lead.action_type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* ── Views Tab ── */}
                    {activeTab === 'views' && (
                        <div className="divide-y divide-neutral-100">
                            {views.length === 0 ? (
                                <EmptyState icon={Eye} text="No properties viewed yet" />
                            ) : (() => {
                                // Group views by property
                                const grouped: Record<string, any> = {};
                                for (const v of views) {
                                    const pid = v.property_id;
                                    if (!grouped[pid]) {
                                        grouped[pid] = { ...v, count: 0, last: v.created_at };
                                    }
                                    grouped[pid].count++;
                                    if (new Date(v.created_at) > new Date(grouped[pid].last)) {
                                        grouped[pid].last = v.created_at;
                                    }
                                }
                                return Object.values(grouped)
                                    .sort((a: any, b: any) => new Date(b.last).getTime() - new Date(a.last).getTime())
                                    .map((view: any) => (
                                        <div key={view.property_id} className="flex items-center gap-4 p-4 hover:bg-neutral-50/50 transition-colors">
                                            {/* Property thumb placeholder */}
                                            <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 overflow-hidden">
                                                {view.property?.images?.[0] ? (
                                                    <img src={view.property.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building className="w-5 h-5 text-neutral-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-neutral-900 truncate">
                                                    {view.property?.title || 'Unknown Property'}
                                                </p>
                                                <p className="text-xs text-neutral-400">{view.property?.location || ''}</p>
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                                                    <Eye className="w-3 h-3" />
                                                    Visited {view.count} time{view.count !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-neutral-500 font-medium">{timeAgo(view.last)}</p>
                                                <p className="text-[10px] text-neutral-300">{new Date(view.last).toLocaleDateString('en-IN')}</p>
                                                {view.property?.id && (
                                                    <a
                                                        href={`/product/${view.property.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-700 mt-1"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        Open
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ));
                            })()}
                        </div>
                    )}

                    {/* ── Inquiries Tab ── */}
                    {activeTab === 'inquiries' && (
                        <div className="divide-y divide-neutral-100">
                            {inquiries.length === 0 ? (
                                <EmptyState icon={FileText} text="No inquiries or reports sent" />
                            ) : (
                                inquiries.map((inq: any) => (
                                    <div key={inq.id} className="p-4 hover:bg-neutral-50/50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                                                <FileText className="w-4 h-4 text-orange-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <p className="text-sm font-bold text-neutral-900 truncate">
                                                        {inq.subject || 'No Subject'}
                                                    </p>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                                        inq.status === 'resolved' ? 'bg-green-50 text-green-700' :
                                                        inq.status === 'spam' ? 'bg-red-50 text-red-700' :
                                                        'bg-yellow-50 text-yellow-700'
                                                    }`}>
                                                        {inq.status || 'unread'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2">
                                                    {inq.message}
                                                </p>
                                                <p className="text-[10px] text-neutral-400 mt-1.5 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {timeAgo(inq.created_at)} · {new Date(inq.created_at).toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// Helper: Empty State
function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
                <Icon className="w-7 h-7 text-neutral-300" />
            </div>
            <p className="text-neutral-500 font-medium">{text}</p>
            <p className="text-sm text-neutral-400 mt-1">This section will populate as the user interacts with the platform.</p>
        </div>
    );
}
