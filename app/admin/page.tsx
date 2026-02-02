'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Trash2, Eye, Users, User, Building, TrendingUp, ChevronLeft, ChevronRight, Search, Filter, CheckCircle, XCircle, Download, Info, MessageSquare, MessageCircle, Ban, X } from 'lucide-react';
import { useLoader } from '@/context/loader-context';
import Image from 'next/image';
// ... imports
// ... imports
import { checkAdminStatus, updateProductStatusAction, approveProductAction, rejectProductAction, adminDeleteProductAction, updateUserRoleAction, toggleUserVerifiedAction, togglePropertyVerifiedAction, updateSiteSettingsAction } from '@/app/actions';
// ...



import { Product } from '@/lib/types';
import { QRPosterModal } from '@/components/unique/qr-poster-modal';
import { UserPropertiesModal } from '@/components/admin/UserPropertiesModal';
import UserInfoModal from '@/components/admin/UserInfoModal';
import { getAdminProducts, getAdminStats, getAdminUsers, getSiteSettings, getUserPropertiesForAdmin, banUser, unbanUser, getInquiries, getUnreadInquiriesCount, getAdminLeads, getAllInquiries, getSupportRequests, getDashboardStats, getRecentActivity } from '@/lib/api';
import { getOptimizedImageUrl } from '@/lib/cloudinary-utils';
import { AdManager } from '@/components/admin/ad-manager';
import { InquiryModal } from '@/components/admin/InquiryModal';

import { useRef } from 'react';
import { SmartQRSection } from '@/components/admin/SmartQRSection';
import { LeadActivityModal } from '@/components/admin/LeadActivityModal';
import { SmartQRModal } from '@/components/admin/SmartQRModal';
import { ActivityTimeline } from '@/components/admin/ActivityTimeline';
import { QrCode, ScanLine } from 'lucide-react';

// ... existing code ...

interface AdminUser {
    userId: string;
    name: string;
    email: string;
    contactNumber: string;
    role: string;
    isVerified: boolean;
    totalProperties: number;
    activeProperties: number;
    profession: string;
    status: string;
    createdAt: string;
}

function timeAgo(dateString?: string) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Handle future dates or tiny differences
    if (seconds < 5) return 'Just now';

    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
        }
    }
    return 'Just now';
}

export default function AdminPage() {
    // ... states ...
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { showLoader, hideLoader } = useLoader();
    const [properties, setProperties] = useState<Product[]>([]);
    const [usersList, setUsersList] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminChecked, setAdminChecked] = useState(false);
    const [stats, setStats] = useState({ total: 0, users: 0, active: 0 });
    const [unreadInquiries, setUnreadInquiries] = useState(0);
    const [qrPosterProperty, setQrPosterProperty] = useState<Product | null>(null);
    const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);
    const [dashboardStats, setDashboardStats] = useState({ totalLeads: 0, totalViews: 0, totalInquiries: 0 });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    // Hydration check
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);



    useEffect(() => {
        if ('serviceWorker' in navigator) {
            // Explicitly register SW to ensure it works in Dev/Production even if next-pwa varies
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW Registered:', registration);
                    return registration.pushManager.getSubscription();
                })
                .then(sub => {
                    setPushSubscription(sub);
                })
                .catch(err => console.error('SW Registration failing:', err));
        }
    }, []);

    // User Properties Modal State
    const [selectedUserForProperties, setSelectedUserForProperties] = useState<{ id: string, name: string } | null>(null);
    const [selectedUserForQR, setSelectedUserForQR] = useState<{ userId: string, name: string } | null>(null);
    const [userProperties, setUserProperties] = useState<Product[]>([]);
    const [userPropertiesLoading, setUserPropertiesLoading] = useState(false);

    // User Info Modal State
    const [selectedUserForInfo, setSelectedUserForInfo] = useState<AdminUser | null>(null);

    // Leads State
    const [leads, setLeads] = useState<any[]>([]);
    const [groupedLeads, setGroupedLeads] = useState<any[]>([]);
    const [selectedPropertyLeads, setSelectedPropertyLeads] = useState<any | null>(null);

    // Inquiries State
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

    // Support Requests State
    const [supportRequests, setSupportRequests] = useState<any[]>([]);
    const [selectedAppeal, setSelectedAppeal] = useState<any | null>(null);

    // New Filter States
    const [cityFilter, setCityFilter] = useState('');
    const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
    const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

    const handleUpdateInquiryStatus = async (id: string, status: string) => {
        // Implement status update logic here
        // For now, just close modal or refresh
        console.log('Update status:', id, status);
        // todo: call API to update status
        // await updateInquiryStatus(id, status);
        fetchInquiries(currentPage);
    };

    // Settings State
    const [settings, setSettings] = useState({
        homepage_title: '',
        homepage_description: '',
        whatsapp_number: ''
    });

    // Pagination & Filter state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'users' | 'approvals' | 'settings' | 'ads' | 'inquiries' | 'leads' | 'appeals' | 'smart-qr'>('overview');

    const ITEMS_PER_PAGE = 10;

    // Fetch Products with new filters
    const fetchProducts = useCallback(async (page: number) => {
        setLoading(true);
        showLoader();
        try {
            const data = await getAdminProducts(page, ITEMS_PER_PAGE, searchQuery, statusFilter, cityFilter, minPrice, maxPrice);
            setProperties(data.products);
            setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            hideLoader();
        }
    }, [searchQuery, statusFilter, cityFilter, minPrice, maxPrice, showLoader, hideLoader]);

    // Fetch Users with search
    const fetchUsers = useCallback(async (page: number) => {
        setLoading(true);
        showLoader();
        try {
            const data = await getAdminUsers(page, ITEMS_PER_PAGE, searchQuery); // Pass search query
            setUsersList(data.users);
            setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
            hideLoader();
        }
    }, [searchQuery, showLoader, hideLoader]);

    // Fetch Settings
    const fetchSettings = useCallback(async () => {
        setLoading(true);
        showLoader();
        try {
            const data = await getSiteSettings();
            setSettings({
                homepage_title: data.homepage_title || '',
                homepage_description: data.homepage_description || '',
                whatsapp_number: data.whatsapp_number || ''
            });
        } finally {
            setLoading(false);
            hideLoader();
        }
    }, [showLoader, hideLoader]);

    // Fetch Inquiries
    const fetchInquiries = useCallback(async (page: number) => {
        setLoading(true);
        showLoader();
        try {
            const data = await getInquiries(page, ITEMS_PER_PAGE);
            setInquiries(data.inquiries);
            setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
            setCurrentPage(page);
        } finally {
            setLoading(false);
            hideLoader();
        }
    }, [showLoader, hideLoader]);

    // Fetch Support Requests
    const fetchSupportRequests = useCallback(async (page: number) => {
        setLoading(true);
        showLoader();
        try {
            const data = await getSupportRequests(page, ITEMS_PER_PAGE);
            setSupportRequests(data.requests || []);
            setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
            setCurrentPage(page);
        } finally {
            setLoading(false);
            hideLoader();
        }
    }, [showLoader, hideLoader]);

    // Fetch Leads
    const fetchLeads = useCallback(async () => {
        setLoading(true);
        showLoader();
        try {
            const data = await getAdminLeads();
            setLeads(data || []);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
            hideLoader();
        }
    }, [showLoader, hideLoader]);

    // ... Check Admin Logic ...

    const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'vendor' | 'user') => {
        if (!user) return;
        if (!confirm(`Change user role to ${newRole}?`)) return;
        const res = await updateUserRoleAction(userId, newRole, user.id);
        if (res.success) fetchUsers(currentPage);
        else alert('Failed to update role');
    };

    const handleUserVerify = async (userId: string, status: boolean) => {
        if (!user) return;
        const res = await toggleUserVerifiedAction(userId, status, user.id);
        if (res.success) fetchUsers(currentPage);
        else alert('Failed to verify user');
    };

    const handlePropertyVerify = async (propertyId: string, status: boolean) => {
        if (!user) return;
        const res = await togglePropertyVerifiedAction(propertyId, status, user.id);
        if (res.success) fetchProducts(currentPage);
        else alert('Failed to verify property');
    };

    const handleSettingsSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        const res = await updateSiteSettingsAction(settings, user.id);
        if (res.success) alert('Settings saved successfully');
        else alert('Failed to save settings');
    };

    const handleUserPropertiesClick = async (userId: string, userName: string) => {
        setSelectedUserForProperties({ id: userId, name: userName });
        setUserPropertiesLoading(true);
        try {
            const props = await getUserPropertiesForAdmin(userId);
            setUserProperties(props);
        } catch (err) {
            console.error(err);
            alert('Failed to load user properties');
        } finally {
            setUserPropertiesLoading(false);
        }
    };



    const handleBanUser = async (userId: string) => {
        if (!confirm('Are you sure you want to BLOCK this user? They will not be able to login.')) return;

        showLoader();
        try {
            const res = await banUser(userId);
            if (res.success) {
                // Update local state
                setUsersList(usersList.map(u => u.userId === userId ? { ...u, status: 'banned' } : u));
                alert('User blocked successfully');
            } else {
                alert('Failed to block user');
            }
        } catch (error) {
            console.error(error);
            alert('Error blocking user');
        } finally {
            hideLoader();
        }
    };

    const handleUnbanUser = async (userId: string) => {
        if (!confirm('Are you sure you want to UNBLOCK this user? They will be able to login again.')) return;

        showLoader();
        try {
            const res = await unbanUser(userId);
            if (res.success) {
                setUsersList(usersList.map(u => u.userId === userId ? { ...u, status: 'active' } : u));
                alert('User unblocked successfully');
            } else {
                alert('Failed to unblock user');
            }
        } catch (error) {
            console.error(error);
            alert('Error unblocking user');
        } finally {
            hideLoader();
        }
    };


    // ... Render ...

    // (I will output the Full Render Logic in the next chunks, focusing on Tabs first)


    const initAdmin = useCallback(async () => {
        setLoading(true);
        showLoader();
        try {
            // Data-Ready Sync: Fetch all initial dashboard data in parallel
            const [statsData, unreadCount, settingsData, dashStats, activityData] = await Promise.all([
                getAdminStats(),
                getUnreadInquiriesCount(),
                getSiteSettings(),
                getDashboardStats(),
                getRecentActivity(10)
            ]);

            setStats(statsData);
            setUnreadInquiries(unreadCount);
            setSettings({
                homepage_title: settingsData.homepage_title || '',
                homepage_description: settingsData.homepage_description || '',
                whatsapp_number: settingsData.whatsapp_number || ''
            });
            setDashboardStats(dashStats);
            setRecentActivity(activityData);

        } catch (error) {
            console.error('Failed to init admin:', error);
        } finally {
            setLoading(false);
            hideLoader(); // Double Check: Only remove after ALL data is ready
        }
    }, [showLoader, hideLoader]);

    // Use ref to prevent infinite loops if dependencies change unexpectadly
    const checkAdminRef = useCallback(async () => {
        if (!user) return;

        console.log("Checking admin status for User ID:", user.id);
        const adminStatus = await checkAdminStatus(user.id);
        console.log("Admin Status Result:", adminStatus);

        setIsAdmin(adminStatus);
        setAdminChecked(true);

        if (adminStatus) {
            await initAdmin();
        } else {
            console.error("Access Denied: User is not in admin_users table.");
        }
    }, [user, initAdmin]); // Removed router from deps as it's stable

    // Alias for compatibility with older handlers
    const fetchStats = initAdmin;

    // Trigger Admin Check (Once per user)
    const processedUserId = useRef<string | null>(null);

    useEffect(() => {
        if (user && user.id !== processedUserId.current) {
            processedUserId.current = user.id;
            checkAdminRef();
        }
    }, [user, checkAdminRef]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            if (activeTab === 'properties') fetchProducts(newPage);
            if (activeTab === 'users') fetchUsers(newPage);
            if (activeTab === 'approvals') fetchApprovals(newPage);
            if (activeTab === 'inquiries') fetchInquiries(newPage);
            if (activeTab === 'leads') fetchLeads();
            if (activeTab === 'appeals') fetchSupportRequests(newPage);
        }
    };

    const fetchApprovals = useCallback(async (page: number) => {
        setLoading(true);
        showLoader();
        try {
            const data = await getAdminProducts(page, ITEMS_PER_PAGE, searchQuery, 'pending');
            setProperties(data.products);
            setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching approvals:', error);
        } finally {
            setLoading(false);
            hideLoader();
        }
    }, [searchQuery, showLoader, hideLoader]);

    const handleApprove = async (id: string) => {
        if (!user) return;
        try {
            const result = await approveProductAction(id, user.id);
            if (result.success) {
                setProperties(properties.filter(p => p.id !== id));
                fetchStats();
                alert('Property approved successfully');
            } else {
                alert(`Failed to approve property: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error approving:', error);
            alert('Failed to approve property');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Reject this property? It will be marked as rejected.')) return;
        if (!user) return;
        try {
            const result = await rejectProductAction(id, user.id);
            if (result.success) {
                setProperties(properties.filter(p => p.id !== id));
                fetchStats();
                alert('Property rejected successfully');
            } else {
                alert(`Failed to reject property: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error rejecting:', error);
            alert('Failed to reject property');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this property? This cannot be undone.')) return;
        if (!user) return;

        try {
            setProperties(properties.filter(p => p.id !== id));
            const result = await adminDeleteProductAction(id, user.id);
            if (result.success) {
                router.refresh();
                fetchStats();
                alert('Property deleted successfully');
            } else {
                alert(`Failed to delete property: ${result.error || 'Unknown error'}`);
                fetchProducts(currentPage);
            }
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Failed to delete property');
        }
    };

    const handleStatusToggle = async (id: string, currentStatus: boolean) => {
        if (!user) return;
        try {
            const result = await updateProductStatusAction(id, !currentStatus, user.id);
            if (result.success) {
                setProperties(properties.map(p =>
                    p.id === id ? { ...p, availableForSale: !currentStatus } : p
                ));
                initAdmin(); // Refresh stats
            } else {
                alert(`Failed to update status: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleExport = () => {
        if (activeTab === 'properties') {
            const headers = ['ID', 'Title', 'Price', 'Status', 'Contact', 'User ID'];
            const csvContent = [
                headers.join(','),
                ...properties.map(p => [
                    p.id,
                    `"${p.title.replace(/"/g, '""')}"`,
                    p.priceRange?.minVariantPrice?.amount || '0',
                    p.availableForSale ? 'Active' : 'Inactive',
                    p.contactNumber || '',
                    p.userId || ''
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `properties-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
        }
    };

    const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleExportInquiries = async () => {
        try {
            const allInquiries = await getAllInquiries();
            const headers = ['Date', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Property ID'];
            const csvContent = [
                headers.join(','),
                ...allInquiries.map((inq: any) => [
                    `"${new Date(inq.created_at).toLocaleString()}"`,
                    `"${inq.first_name} ${inq.last_name}"`,
                    `"${inq.email}"`,
                    `"${inq.phone_number || ''}"`,
                    `"${inq.subject?.replace(/"/g, '""') || ''}"`,
                    `"${inq.message?.replace(/"/g, '""') || ''}"`,
                    inq.status,
                    `"${inq.property_id || ''}"`
                ].join(','))
            ].join('\n');

            downloadCSV(csvContent, `inquiries-export-${new Date().toISOString().split('T')[0]}.csv`);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export inquiries');
        }
    };

    const handleExportLeads = () => {
        const leadsToExport = leads.length > 0 ? leads : groupedLeads.flatMap(g => g.leads);

        if (!leadsToExport || leadsToExport.length === 0) {
            alert('No leads to export');
            return;
        }

        const headers = ['Date', 'User Name', 'User Email', 'User Phone', 'Action Type', 'Property Title', 'Property Location', 'Property ID'];
        const csvContent = [
            headers.join(','),
            ...leadsToExport.map((lead: any) => [
                `"${new Date(lead.created_at).toLocaleString()}"`,
                `"${lead.user_name || ''}"`,
                `"${lead.user_email || ''}"`,
                `"${lead.user_phone || ''}"`,
                `"${lead.action_type || ''}"`,
                `"${lead.property_title?.replace(/"/g, '""') || ''}"`,
                `"${lead.property_location?.replace(/"/g, '""') || ''}"`,
                `"${lead.property_id || ''}"`
            ].join(','))
        ].join('\n');

        downloadCSV(csvContent, `leads-export-${new Date().toISOString().split('T')[0]}.csv`);
    };

    if (!mounted || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <Ban className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
                    <p className="text-gray-500 mb-6">Your account does not have administrator privileges.</p>

                    <div className="bg-gray-100 p-4 rounded-lg text-left text-xs font-mono text-gray-600 mb-6 overflow-x-auto">
                        <p><strong>User ID:</strong> {user?.id || 'Not Logged In'}</p>
                        <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                        <p><strong>Status:</strong> {isAdmin ? 'Admin' : 'Restricted'}</p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-2.5 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                        >
                            Return Home
                        </button>
                        <button
                            onClick={() => { window.location.reload(); }}
                            className="w-full py-2.5 text-black bg-white border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Retry Connection
                        </button>
                    </div>
                </div>
            </div>
        );
    }



    const subscribeToPush = async () => {
        if (!('serviceWorker' in navigator)) return;
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            });
            setPushSubscription(sub);

            // Save to DB via API to avoid client-side import issues or server actions conflicts immediately
            const { saveAdminSubscription } = await import('@/app/actions');
            await saveAdminSubscription(JSON.stringify(sub));
            alert('Admin Alerts Enabled!');
        } catch (err) {
            console.error('Push subscription failed:', err);
            // alert('Failed to enable alerts. Check console.');
            console.log(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
        }
    };

    const unsubscribeFromPush = async () => {
        if (!('serviceWorker' in navigator)) return;
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();
            if (sub) await sub.unsubscribe();
            setPushSubscription(null);
            alert('Admin Alerts Disabled.');
            // Ideally remove from DB too, but unsubscribing locally stops messages
        } catch (err) {
            console.error('Unsubscribe failed:', err);
        }
    };

    const handleLeadDelete = async (leadId: string) => {
        if (!confirm('Delete this lead?')) return;
        // todo: implement delete lead server action
        alert("Lead deleted (Simulation). Server action pending.");
        setLeads(leads.filter(l => l.id !== leadId));
    };

    const handlePropertyLeadsClick = async (property: Product) => {
        setSelectedPropertyLeads({
            property_title: property.title,
            property_handle: property.handle,
            leads: [] // Show/Load empty initially while fetching? Or loader.
        });

        showLoader();
        try {
            // Re-using getAdminLeads for now. Optimization: Create specific API for property leads
            const allLeads = await getAdminLeads();
            const filtered = allLeads.filter((l: any) => l.property_id === property.id);

            setSelectedPropertyLeads({
                property_title: property.title,
                property_handle: property.handle,
                leads: filtered
            });
        } catch (err) {
            console.error(err);
            alert('Failed to load leads details');
        } finally {
            hideLoader();
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:block fixed h-full z-10 overflow-y-auto">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-serif font-bold text-neutral-900">NBF Admin</h1>

                </div>
            </aside>
            <main className="flex-1 ml-0 md:ml-64 p-8 overflow-y-auto w-full">
                {qrPosterProperty && (
                    <QRPosterModal
                        isOpen={!!qrPosterProperty}
                        onClose={() => setQrPosterProperty(null)}
                        property={qrPosterProperty}
                        user={user}
                    />
                )}

                <UserPropertiesModal
                    isOpen={!!selectedUserForProperties}
                    onClose={() => { setSelectedUserForProperties(null); setUserProperties([]); }}
                    userName={selectedUserForProperties?.name || 'User'}
                    properties={userProperties}
                    loading={userPropertiesLoading}
                />
                {selectedUserForInfo && (
                    <UserInfoModal
                        isOpen={!!selectedUserForInfo}
                        onClose={() => setSelectedUserForInfo(null)}
                        user={selectedUserForInfo}
                    />
                )}
                <LeadActivityModal
                    isOpen={!!selectedPropertyLeads}
                    onClose={() => setSelectedPropertyLeads(null)}
                    propertyTitle={selectedPropertyLeads?.property_title || ''}
                    propertyHandle={selectedPropertyLeads?.property_handle}
                    leads={selectedPropertyLeads?.leads || []}
                    onDeleteLead={handleLeadDelete}
                />
                <InquiryModal
                    isOpen={!!selectedInquiry}
                    onClose={() => setSelectedInquiry(null)}
                    inquiry={selectedInquiry}
                />
                <InquiryModal
                    isOpen={!!selectedAppeal}
                    onClose={() => setSelectedAppeal(null)}
                    inquiry={selectedAppeal}
                />

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
                        <p className="text-neutral-600 mt-1">Manage platform activity</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                        <button onClick={() => { setActiveTab('overview'); fetchStats(); }} className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}>Overview</button>
                        <button onClick={() => { setActiveTab('properties'); fetchProducts(1); }} className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'properties' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}>Properties</button>
                        <button onClick={() => { setActiveTab('users'); fetchUsers(1); }} className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}>Users</button>
                        <button onClick={() => { setActiveTab('approvals'); fetchApprovals(1); }} className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'approvals' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}>Approvals</button>
                        <button onClick={() => { setActiveTab('inquiries'); fetchInquiries(1); }} className={`relative px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inquiries' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}>
                            Inquiries
                            {unreadInquiries > 0 && (
                                <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white`}>
                                    {unreadInquiries}
                                </span>
                            )}
                        </button>
                        <button onClick={() => { setActiveTab('appeals'); fetchSupportRequests(1); }} className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'appeals' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}>Appeals</button>
                        <button onClick={() => { setActiveTab('ads'); }} className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ads' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}>Manage Ads</button>
                        <button onClick={() => { setActiveTab('settings'); fetchSettings(); }} className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}>Settings</button>
                        <button onClick={() => { setActiveTab('smart-qr'); }} className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'smart-qr' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}>Smart QR Management</button>
                    </div>
                </div>


                {
                    activeTab === 'overview' && (
                        /* Stats View */
                        <div className="space-y-8">
                            {/* Analytics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-600">Total Properties</p>
                                            <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.total}</p>
                                        </div>
                                        <Building className="w-10 h-10 text-neutral-200" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-600">Total Views</p>
                                            <p className="text-3xl font-bold text-neutral-900 mt-2">{dashboardStats.totalViews}</p>
                                        </div>
                                        <Eye className="w-10 h-10 text-blue-100 text-blue-500" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-600">Leads Generated</p>
                                            <p className="text-3xl font-bold text-neutral-900 mt-2">{dashboardStats.totalLeads}</p>
                                        </div>
                                        <TrendingUp className="w-10 h-10 text-green-100 text-green-500" />
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-2">Conversion: {dashboardStats.totalViews > 0 ? ((dashboardStats.totalLeads / dashboardStats.totalViews) * 100).toFixed(1) : 0}%</p>
                                </div>
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-600">Total Users</p>
                                            <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.users}</p>
                                        </div>
                                        <Users className="w-10 h-10 text-neutral-200" />
                                    </div>
                                </div>
                            </div>

                            {/* Activity Timeline */}
                            <ActivityTimeline activities={recentActivity} />
                        </div>
                    )
                }

                {
                    activeTab === 'properties' && (
                        /* Properties View */
                        <div className="space-y-6">
                            {/* Filters */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row gap-4 justify-between">
                                <div className="flex flex-1 gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search properties..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Filter className="text-neutral-400 w-5 h-5" />
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="border border-neutral-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    onClick={handleExport}
                                    className="flex items-center px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export CSV
                                </button>
                            </div>

                            {/* Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-neutral-900">Property Listings</h2>
                                    <span className="text-sm text-neutral-500">Page {currentPage} of {totalPages}</span>
                                </div>

                                {loading ? (
                                    <div className="p-12 flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-neutral-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Property</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Posted</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Views</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Leads</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Price</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Contact</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-neutral-200">
                                                    {properties.map((property) => (
                                                        <tr key={property.id} className="hover:bg-neutral-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="relative h-10 w-10 flex-shrink-0">
                                                                        {property.featuredImage && property.featuredImage.url ? (
                                                                            <Image
                                                                                className="rounded object-cover"
                                                                                src={getOptimizedImageUrl(property.featuredImage.url, 160, 160, 'fill')}
                                                                                alt=""
                                                                                fill
                                                                                sizes="40px"
                                                                            />
                                                                        ) : (<div className="h-10 w-10 rounded bg-neutral-200" />
                                                                        )}
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium text-neutral-900 max-w-[200px] truncate">{property.title}</div>
                                                                        <div className="text-xs text-neutral-500">{property.tags?.[0]}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-500">
                                                                {timeAgo(property.createdAt)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-medium">
                                                                <div className="flex items-center gap-1">
                                                                    <Eye className="w-3 h-3 text-neutral-400" />
                                                                    {property.viewCount || 0}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-medium">
                                                                <button
                                                                    onClick={() => handlePropertyLeadsClick(property)}
                                                                    className="flex items-center gap-1.5 hover:text-blue-600 transition-colors group"
                                                                    title="View Leads"
                                                                >
                                                                    <div className={`p-1 rounded-full ${(property.leadsCount || 0) > 0 ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 'bg-neutral-100 text-neutral-400'}`}>
                                                                        <User className="w-3 h-3" />
                                                                    </div>
                                                                    <span className={(property.leadsCount || 0) > 0 ? 'underline decoration-dotted' : ''}>
                                                                        {property.leadsCount || 0}
                                                                    </span>
                                                                </button>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <button
                                                                    onClick={() => handleStatusToggle(property.id, property.availableForSale)}
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${property.availableForSale
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                        }`}
                                                                >
                                                                    {property.availableForSale ? 'Active' : 'Inactive'}
                                                                </button>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-medium">
                                                                ₹{Number(property.priceRange?.minVariantPrice?.amount || property.price || 0).toLocaleString('en-IN')}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                                {property.contactNumber || 'N/A'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <button
                                                                    onClick={() => router.push(`/product/${property.handle}`)}
                                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                                    title="View"
                                                                >
                                                                    <Eye className="w-4 h-4 inline" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setQrPosterProperty(property)}
                                                                    className="text-purple-600 hover:text-purple-900 mr-4"
                                                                    title="Generate QR Poster"
                                                                >
                                                                    <Download className="w-4 h-4 inline" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusToggle(property.id, property.availableForSale)}
                                                                    className={`mr-4 ${property.availableForSale ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                                                                    title={property.availableForSale ? "Deactivate" : "Activate"}
                                                                >
                                                                    {property.availableForSale ? <XCircle className="w-4 h-4 inline" /> : <CheckCircle className="w-4 h-4 inline" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(property.id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4 inline" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination Controls */}
                                        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPage === 1
                                                    ? 'text-neutral-400 bg-neutral-100 cursor-not-allowed'
                                                    : 'text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50'
                                                    }`}
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-2" />
                                                Previous
                                            </button>
                                            <div className="hidden sm:flex">
                                                <p className="text-sm text-neutral-700">
                                                    Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPage === totalPages
                                                    ? 'text-neutral-400 bg-neutral-100 cursor-not-allowed'
                                                    : 'text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50'
                                                    }`}
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4 ml-2" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'users' && (
                        /* Users View */
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-neutral-900">Registered Users</h2>
                                    <span className="text-sm text-neutral-500">Page {currentPage} of {totalPages}</span>
                                </div>

                                {loading ? (
                                    <div className="p-12 flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-neutral-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">User</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Phone</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Joined</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-neutral-200">
                                                {usersList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                                                            No users found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    usersList.map((u) => (
                                                        <tr key={u.userId} className={`${u.status === 'banned' ? 'bg-red-50' : ''} hover:bg-neutral-50 transition-colors`}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="flex-shrink-0 h-10 w-10">
                                                                        <div className="h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-lg">
                                                                            {u.name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => setSelectedUserForInfo(u)}
                                                                                className="text-sm font-medium text-neutral-900 hover:text-blue-600 hover:underline text-left"
                                                                            >
                                                                                {u.name}
                                                                            </button>
                                                                            {/* Smart QR Button */}
                                                                            <button
                                                                                onClick={() => setSelectedUserForQR({ userId: u.userId, name: u.name })}
                                                                                className="p-1 hover:bg-neutral-100 rounded-md text-neutral-500 hover:text-black transition-colors"
                                                                                title="Link Smart QR"
                                                                            >
                                                                                <ScanLine className="w-3 h-3" />
                                                                            </button>
                                                                            {/* Verification Status */}
                                                                            {u.isVerified && (
                                                                                <span title="Verified User">
                                                                                    <CheckCircle className="w-3 h-3 text-blue-500" />
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">{u.role}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                                {u.email !== 'N/A' && (
                                                                    <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded border border-neutral-100 w-fit">
                                                                        <span className="text-xs">{u.email}</span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                                {u.contactNumber && u.contactNumber !== 'N/A' ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded border border-neutral-100">
                                                                            <span className="text-xs font-mono">{u.contactNumber}</span>
                                                                        </div>
                                                                        <a
                                                                            href={`https://wa.me/${u.contactNumber.replace(/\D/g, '')}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-green-600 hover:text-green-700 bg-green-50 p-1 rounded hover:bg-green-100 transition-colors"
                                                                            title="Chat on WhatsApp"
                                                                        >
                                                                            <MessageCircle className="w-3 h-3" />
                                                                        </a>
                                                                    </div>
                                                                ) : <span className="text-neutral-300">-</span>}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                                <div className="flex flex-col">
                                                                    <span className="text-neutral-900 font-medium">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                                    <span className="text-xs text-neutral-400">{timeAgo(u.createdAt)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.status === 'banned'
                                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                                    : 'bg-green-50 text-green-700 border-green-200'
                                                                    }`}>
                                                                    {u.status === 'banned' ? (
                                                                        <><Ban className="w-3 h-3 mr-1" /> Banned</>
                                                                    ) : (
                                                                        <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                                                                    )}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => setSelectedUserForInfo(u)}
                                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        title="View Details"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>

                                                                    {u.status !== 'banned' ? (
                                                                        <button
                                                                            onClick={() => handleBanUser(u.userId)}
                                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                            title="Block User"
                                                                        >
                                                                            <Ban className="w-4 h-4" />
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleUnbanUser(u.userId)}
                                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                            title="Unblock User"
                                                                        >
                                                                            <CheckCircle className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPage === 1
                                            ? 'text-neutral-400 bg-neutral-100 cursor-not-allowed'
                                            : 'text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50'
                                            }`}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Previous
                                    </button>
                                    <span className="text-sm text-neutral-700">Page {currentPage} of {totalPages}</span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPage === totalPages
                                            ? 'text-neutral-400 bg-neutral-100 cursor-not-allowed'
                                            : 'text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50'
                                            }`}
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
                {/* Removed Duplicate Users Table Block */}
                {
                    activeTab === 'approvals' && (
                        /* Approvals View */
                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
                                <h2 className="text-lg font-semibold text-neutral-900 mb-2">Pending Approvals</h2>
                                <p className="text-sm text-neutral-500">Review and approve new property listings.</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-neutral-900">Pending Listings</h2>
                                    <span className="text-sm text-neutral-500">Page {currentPage} of {totalPages}</span>
                                </div>

                                {loading ? (
                                    <div className="p-12 flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-neutral-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Property</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Price</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Contact</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-neutral-200">
                                                    {properties.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                                                                No pending approvals found.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        properties.map((property) => (
                                                            <tr key={property.id} className="hover:bg-neutral-50">
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <div className="h-10 w-10 flex-shrink-0">
                                                                            {property.featuredImage && property.featuredImage.url ? (
                                                                                <img
                                                                                    className="h-10 w-10 rounded object-cover"
                                                                                    src={getOptimizedImageUrl(property.featuredImage.url, 160, 160, 'fill')}
                                                                                    alt=""
                                                                                    loading="lazy"
                                                                                />
                                                                            ) : (<div className="h-10 w-10 rounded bg-neutral-200" />
                                                                            )}
                                                                        </div>
                                                                        <div className="ml-4">
                                                                            <div className="text-sm font-medium text-neutral-900 max-w-[200px] truncate">{property.title}</div>
                                                                            <div className="text-xs text-neutral-500">{property.tags?.[0]}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-medium">
                                                                    ₹{Number(property.priceRange?.minVariantPrice?.amount || property.price || 0).toLocaleString('en-IN')}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                                    {property.contactNumber || 'N/A'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                    <button
                                                                        onClick={() => router.push(`/product/${property.handle}`)}
                                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                                        title="View"
                                                                    >
                                                                        <Eye className="w-4 h-4 inline" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleApprove(property.id)}
                                                                        className="text-green-600 hover:text-green-900 mr-4"
                                                                        title="Approve"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4 inline" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(property.id)}
                                                                        className="text-red-600 hover:text-red-900"
                                                                        title="Reject"
                                                                    >
                                                                        <XCircle className="w-4 h-4 inline" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination Controls */}
                                        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPage === 1
                                                    ? 'text-neutral-400 bg-neutral-100 cursor-not-allowed'
                                                    : 'text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50'
                                                    }`}
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-2" />
                                                Previous
                                            </button>
                                            <div className="hidden sm:flex">
                                                <p className="text-sm text-neutral-700">
                                                    Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPage === totalPages
                                                    ? 'text-neutral-400 bg-neutral-100 cursor-not-allowed'
                                                    : 'text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50'
                                                    }`}
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4 ml-2" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                }
                {
                    activeTab === 'ads' && (
                        <div className="max-w-4xl mx-auto">
                            <AdManager />
                        </div>
                    )
                }
                {
                    activeTab === 'settings' && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Website Settings</h2>
                                <form onSubmit={handleSettingsSave} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Homepage Title (SEO)</label>
                                        <input
                                            type="text"
                                            value={settings.homepage_title}
                                            onChange={(e) => setSettings({ ...settings, homepage_title: e.target.value })}
                                            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                            placeholder="e.g. Find Your Perfect Home"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Homepage Description (SEO)</label>
                                        <textarea
                                            value={settings.homepage_description}
                                            onChange={(e) => setSettings({ ...settings, homepage_description: e.target.value })}
                                            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 h-24"
                                            placeholder="e.g. Discover verified rooms and flats..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Global WhatsApp Number</label>
                                        <input
                                            type="text"
                                            value={settings.whatsapp_number}
                                            onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                                            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                            placeholder="e.g. 917470724553"
                                        />
                                        <p className="text-xs text-neutral-500 mt-1">Used for 'Contact Us' and Application buttons. Format: CountryCode+Number (no symbols).</p>
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Notification Settings */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Device Notifications</h2>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-neutral-900">Admin Push Alerts</p>
                                        <p className="text-sm text-neutral-500">Receive system-level notifications for new properties.</p>
                                    </div>
                                    <div>
                                        {pushSubscription ? (
                                            <button onClick={unsubscribeFromPush} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm">
                                                Disable
                                            </button>
                                        ) : (
                                            <button onClick={subscribeToPush} className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm">
                                                Enable This Device
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                {
                    activeTab === 'appeals' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-neutral-900">Support Requests (Appeals)</h2>
                                    <span className="text-sm text-neutral-500">Page {currentPage} of {totalPages}</span>
                                </div>
                                {loading ? (
                                    <div className="p-12 flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-neutral-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email/Phone</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Subject</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Message</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-neutral-200">
                                                {supportRequests.length > 0 ? supportRequests.map((req) => (
                                                    <tr key={req.id} className="hover:bg-neutral-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                            {new Date(req.created_at).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                                            {req.first_name} {req.last_name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                            <div className="flex flex-col">
                                                                <span>{req.email}</span>
                                                                <span className="text-xs text-neutral-400">{req.phone_number || 'N/A'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-medium">
                                                            {req.subject}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <p className="line-clamp-2 max-w-xs" title={req.message}>{req.message}</p>
                                                                <button
                                                                    onClick={() => setSelectedAppeal(req)}
                                                                    className="text-blue-600 hover:text-blue-900 flex-shrink-0 font-medium text-xs bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                                                                >
                                                                    View Full
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                                                            No support requests found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPage === 1
                                                    ? 'text-neutral-400 bg-neutral-100 cursor-not-allowed'
                                                    : 'text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50'
                                                    }`}
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-2" />
                                                Previous
                                            </button>
                                            <span className="text-sm text-neutral-700">Page {currentPage} of {totalPages}</span>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPage === totalPages
                                                    ? 'text-neutral-400 bg-neutral-100 cursor-not-allowed'
                                                    : 'text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50'
                                                    }`}
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4 ml-2" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                {activeTab === 'ads' && (
                    <AdManager />
                )}

                {activeTab === 'smart-qr' && (
                    <SmartQRSection adminId={user?.id || ''} />
                )}

                {/* Modals */}
                <SmartQRModal
                    isOpen={!!selectedUserForQR}
                    onClose={() => setSelectedUserForQR(null)}
                    user={selectedUserForQR}
                    adminId={user?.id}
                />

                {selectedUserForProperties && (
                    <UserPropertiesModal
                        isOpen={!!selectedUserForProperties}
                        onClose={() => setSelectedUserForProperties(null)}
                        userName={selectedUserForProperties.name}
                        properties={userProperties}
                        loading={userPropertiesLoading}
                    />
                )}

                {selectedInquiry && (
                    <InquiryModal
                        isOpen={!!selectedInquiry}
                        onClose={() => setSelectedInquiry(null)}
                        inquiry={selectedInquiry}
                        onUpdateStatus={handleUpdateInquiryStatus}
                    />
                )}

                {selectedAppeal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg">Support Appeal Details</h3>
                                <button onClick={() => setSelectedAppeal(null)} className="p-1 hover:bg-neutral-100 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase">User</label>
                                    <p className="font-medium">{selectedAppeal.userName}</p>
                                    <p className="text-sm text-neutral-500">{selectedAppeal.userEmail}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase">Message</label>
                                    <p className="p-3 bg-neutral-50 rounded-lg text-sm">{selectedAppeal.message}</p>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={() => window.location.href = `mailto:${selectedAppeal.userEmail}`}
                                        className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold"
                                    >
                                        Reply via Email
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
