'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateQRCodesAction, getQRCodesAction, markQRDownloadedAction, deleteQRCodeAction } from '@/app/actions';
import { getAdminUsers } from '@/lib/api';
import { Download, Plus, Loader2, QrCode, ScanLine, User, CheckCircle2, AlertCircle, Camera, Trash2, CheckSquare, Square, Printer } from 'lucide-react';
import { useLoader } from '@/context/loader-context';
import { toast } from 'sonner';
import { SmartQRModal } from './SmartQRModal';
import { Checkbox } from "@/components/ui/checkbox";
import jsPDF from 'jspdf';

interface QRInventoryItem {
    id: string;
    code: string;
    status: 'unused' | 'active' | 'disabled';
    is_downloaded: boolean;
    created_at: string;
    assigned_user_id?: string;
    assigned_user?: {
        name: string;
        email: string;
    } | null;
}

interface AdminUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    assigned_qr_id?: string;
}

// --- Helper: Canvas Generator ---
const generatePosterCanvas = async (code: string): Promise<HTMLCanvasElement | null> => {
    const canvas = document.createElement('canvas');
    // Poster Dimensions (A4-ish ratio, scaled for good resolution)
    const width = 800;
    const height = 1100;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- Header Section ---
    // Black Bar at bottom
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, height - 60, width, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('POWERED BY NBF', 100, height - 25);
    ctx.fillText('WWW.NBFHOMES.IN', width - 150, height - 25);

    // Top Branding
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('https://www.nbfhomes.in', 50, 60);

    // NBF HOMES Button-like Badge
    ctx.fillStyle = '#000000';
    ctx.fillRect(width - 200, 30, 150, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('NBF HOMES', width - 125, 57);

    // --- Main Text Content ---
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';

    // Hindi Text 1: "हमारे यहाँ कमरे, फ्लैट और रूम"
    ctx.font = 'bold 40px Arial';
    ctx.fillText('"हमारे यहाँ कमरे, फ्लैट और रूम', width / 2, 250);

    // Hindi Text 2: "किराये पर उपलब्ध हैं।""
    ctx.fillText('किराये पर उपलब्ध हैं।\"', width / 2, 300);

    // Instruction Text (Smaller)
    ctx.font = '22px Arial';
    ctx.fillStyle = '#555555';
    ctx.fillText('सम्पर्क करने, फोटो(room) देखने और पूरी जानकारी', width / 2, 360);
    ctx.fillText('(Details) के लिए नीचे दिए गए QR Code को स्कैन करें।', width / 2, 390);


    // --- QR Code ---
    // We use a Promise to wait for image loading
    return new Promise((resolve) => {
        const qrSize = 400; // Large QR
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(`https://nbff.in/qr/${code}`)}&margin=10`;
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = qrUrl;

        img.onload = () => {
            const qrY = 450;
            ctx.drawImage(img, (width - qrSize) / 2, qrY, qrSize, qrSize);

            // "SCAN FOR DETAILS" Text below QR
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('[ SCAN FOR DETAILS ]', width / 2, qrY + qrSize + 50);

            // Add ID in corner for reference
            ctx.fillStyle = '#aaaaaa';
            ctx.font = 'bold 14px Courier New';
            ctx.textAlign = 'right';
            ctx.fillText(`ID: ${code}`, width - 30, height - 70);

            resolve(canvas);
        };

        img.onerror = () => {
            resolve(null);
        };
    });
};


export function SmartQRSection({ adminId }: { adminId: string }) {
    const { showLoader, hideLoader } = useLoader();
    const [activeView, setActiveView] = useState<'users' | 'inventory'>('users');

    // Inventory State
    const [qrCodes, setQrCodes] = useState<QRInventoryItem[]>([]);
    const [inventoryLoading, setInventoryLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unused' | 'active'>('unused');
    const [page, setPage] = useState(1);

    // Bulk Selection State
    const [selectedQrIds, setSelectedQrIds] = useState<Set<string>>(new Set());
    const [isBulkDownloading, setIsBulkDownloading] = useState(false);

    // User State
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [userFilter, setUserFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

    // Modal State
    const [selectedUserForQR, setSelectedUserForQR] = useState<{ userId: string, name: string } | null>(null);

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [genCount, setGenCount] = useState(5);
    const [genPrefix, setGenPrefix] = useState('NBF');

    // --- Data Fetching ---

    const fetchInventory = useCallback(async () => {
        setInventoryLoading(true);
        // Clear selection when fetching new data to avoid stale selections
        setSelectedQrIds(new Set());
        try {
            // Fetch more to allow for better bulk selection experience, e.g. 100
            const res = await getQRCodesAction(page, 100, filter);
            if (res.success) {
                setQrCodes(res.codes || []);
            } else {
                toast.error("Failed to load QR codes");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setInventoryLoading(false);
        }
    }, [page, filter]);

    const fetchUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const data = await getAdminUsers(1, 100, '');
            const mapped = data.users.map((u: any) => ({
                id: u.userId,
                name: u.name || 'User',
                email: u.email,
                phone: u.contactNumber,
                role: u.role,
                assigned_qr_id: u.assignedQrId
            }));
            setUsers(mapped);
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to load users");
        } finally {
            setUsersLoading(false);
        }
    }, []);

    // Initial Load & Tab Switch
    useEffect(() => {
        if (activeView === 'inventory') fetchInventory();
        if (activeView === 'users') fetchUsers();
    }, [activeView, fetchInventory, fetchUsers]);

    // --- Handlers ---

    const handleGenerate = async () => {
        setIsGenerating(true);
        showLoader();
        try {
            const res = await generateQRCodesAction(genCount, genPrefix, adminId);
            if (res.success) {
                toast.success(`Generated ${res.count} QR codes!`);
                fetchInventory();
            } else {
                toast.error("Failed: " + res.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
            hideLoader();
        }
    };

    const handleDeleteQR = async (id: string) => {
        if (!confirm('Are you sure you want to delete this QR code?')) return;
        try {
            const res = await deleteQRCodeAction(id, adminId);
            if (res.success) {
                toast.success("QR Code Deleted");
                setQrCodes(prev => prev.filter(q => q.id !== id));
                // Remove from selection if exists
                if (selectedQrIds.has(id)) {
                    const next = new Set(selectedQrIds);
                    next.delete(id);
                    setSelectedQrIds(next);
                }
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting");
        }
    };

    const handleDownload = async (code: string, id: string | null) => {
        const canvas = await generatePosterCanvas(code);
        if (!canvas) {
            toast.error("Failed to generate Poster");
            return;
        }

        // Trigger Download
        const link = document.createElement('a');
        link.download = `Poster_${code}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        if (id) {
            await markQRDownloadedAction(id);
            setQrCodes(prev => prev.map(q => q.id === id ? { ...q, is_downloaded: true } : q));
        }
        toast.success("Poster Downloaded");
    };

    // --- Bulk Selection Handlers ---

    const toggleSelectAll = () => {
        if (selectedQrIds.size === qrCodes.length && qrCodes.length > 0) {
            setSelectedQrIds(new Set());
        } else {
            const allIds = new Set(qrCodes.map(q => q.id));
            setSelectedQrIds(allIds);
        }
    };

    const toggleSelectOne = (id: string) => {
        const next = new Set(selectedQrIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedQrIds(next);
    };

    const handleBulkDownload = async () => {
        if (selectedQrIds.size === 0) return;
        setIsBulkDownloading(true);
        showLoader();

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const selectedItems = qrCodes.filter(q => selectedQrIds.has(q.id));
            let processedCount = 0;

            for (let i = 0; i < selectedItems.length; i++) {
                const item = selectedItems[i];
                const canvas = await generatePosterCanvas(item.code);

                if (canvas) {
                    const imgData = canvas.toDataURL('image/png');

                    if (i > 0) pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
                    processedCount++;

                    // Optimistically mark as downloaded in local state (API call optional for bulk to save time/bandwidth, or minimal)
                    // We will fire and forget the mark downloaded action for better UX speed
                    markQRDownloadedAction(item.id).catch(e => console.error(e));
                }
            }

            // Save PDF
            pdf.save(`NBF_Bulk_QRs_${new Date().toISOString().slice(0, 10)}.pdf`);
            toast.success(`Downloaded ${processedCount} Posters as PDF!`);

            // Update local state to reflect downloaded
            setQrCodes(prev => prev.map(q => selectedQrIds.has(q.id) ? { ...q, is_downloaded: true } : q));
            // Clear selection? Maybe keep it in case user wants to re-download
            // setSelectedQrIds(new Set());

        } catch (error) {
            console.error("Bulk download failed", error);
            toast.error("Failed to generate PDF");
        } finally {
            setIsBulkDownloading(false);
            hideLoader();
        }
    };

    const filteredUsers = users.filter(u => {
        if (userFilter === 'all') return true;
        if (userFilter === 'assigned') return !!u.assigned_qr_id;
        if (userFilter === 'unassigned') return !u.assigned_qr_id;
        return true;
    });

    return (
        <div className="space-y-6 pt-2 animate-in fade-in duration-500">
            {/* Top Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-neutral-900">
                        <QrCode className="w-7 h-7 text-green-600" />
                        Smart QR Control Center
                    </h2>
                    <p className="text-neutral-500 text-sm mt-1">Manage Digital IDs & Physical Inventory</p>
                </div>

                <div className="flex bg-neutral-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveView('users')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeView === 'users' ? 'bg-white shadow text-black' : 'text-neutral-500 hover:text-black'}`}
                    >
                        <User className="w-4 h-4" />
                        Assign QR
                    </button>
                    <button
                        onClick={() => setActiveView('inventory')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeView === 'inventory' ? 'bg-white shadow text-black' : 'text-neutral-500 hover:text-black'}`}
                    >
                        <ScanLine className="w-4 h-4" />
                        QR Inventory
                    </button>
                </div>
            </div>

            {/* --- USER ASSIGNMENT VIEW (PRIORITY) --- */}
            {activeView === 'users' && (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <button onClick={() => setUserFilter('all')} className={`px-4 py-2 rounded-full text-xs font-bold border ${userFilter === 'all' ? 'bg-black text-white border-black' : 'bg-white text-neutral-500 border-neutral-200'}`}>All Users</button>
                        <button onClick={() => setUserFilter('unassigned')} className={`px-4 py-2 rounded-full text-xs font-bold border ${userFilter === 'unassigned' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-white text-neutral-500 border-neutral-200'}`}>Unassigned (Needs QR)</button>
                        <button onClick={() => setUserFilter('assigned')} className={`px-4 py-2 rounded-full text-xs font-bold border ${userFilter === 'assigned' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-neutral-500 border-neutral-200'}`}>Assigned</button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-50 border-b border-neutral-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase">Scanner</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase">User Identity</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-neutral-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {usersLoading ? (
                                        <tr key="loading"><td colSpan={4} className="p-8 text-center text-neutral-400">Loading users...</td></tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr key="empty"><td colSpan={4} className="p-8 text-center text-neutral-400">No users found.</td></tr>
                                    ) : filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-6 py-4 w-20">
                                                {/* BARCODE ICON IN FRONT OF NAME */}
                                                <button
                                                    onClick={() => setSelectedUserForQR({ userId: user.id, name: user.name })}
                                                    className="w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg hover:scale-105 active:scale-95"
                                                    title="Scan to Link QR"
                                                >
                                                    <Camera className="w-5 h-5" />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-lg text-neutral-900">{user.name}</p>
                                                <div className="flex flex-col gap-0.5 mt-1">
                                                    <span className="text-xs text-neutral-500 flex items-center gap-1">📧 {user.email}</span>
                                                    <span className="text-xs text-neutral-500 flex items-center gap-1">📱 {user.phone || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.assigned_qr_id ? (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-[10px] font-bold uppercase">
                                                            <CheckCircle2 className="w-3 h-3" /> Assigned
                                                        </span>
                                                        <span className="text-xs font-mono bg-neutral-100 px-1.5 rounded">{user.assigned_qr_id}</span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-[10px] font-bold uppercase">
                                                        <AlertCircle className="w-3 h-3" /> Needs QR
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedUserForQR({ userId: user.id, name: user.name })}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {user.assigned_qr_id ? 'Reassign' : 'Link Now'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* --- INVENTORY VIEW --- */}
            {activeView === 'inventory' && (
                <div className="space-y-6">
                    {/* Generator Panel */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                        <div className="flex flex-col md:flex-row gap-6 justify-between items-end">
                            <div>
                                <h3 className="font-bold text-neutral-900 mb-1 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-blue-600" />
                                    Generate New Codes
                                </h3>
                                <p className="text-sm text-neutral-500">Create blank codes to print.</p>
                            </div>

                            <div className="flex flex-wrap items-end gap-4 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase mb-1 block">Prefix</label>
                                    <input
                                        type="text"
                                        value={genPrefix}
                                        onChange={(e) => setGenPrefix(e.target.value.toUpperCase())}
                                        className="px-3 py-2 border rounded-lg w-24 font-mono text-center text-sm font-bold bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase mb-1 block">Count</label>
                                    <select
                                        value={genCount}
                                        onChange={(e) => setGenCount(Number(e.target.value))}
                                        className="px-3 py-2 border rounded-lg w-20 text-sm font-bold bg-white"
                                    >
                                        <option value={1}>1</option>
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="px-6 py-2 bg-neutral-900 text-white rounded-lg font-bold hover:bg-black disabled:opacity-50 flex items-center gap-2 text-sm"
                                >
                                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Inventory List Controls */}
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="flex gap-2 p-1 bg-neutral-100 rounded-lg w-fit">
                                <button onClick={() => setFilter('unused')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'unused' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'}`}>Unused</button>
                                <button onClick={() => setFilter('active')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'active' ? 'bg-white text-green-700 shadow-sm' : 'text-neutral-500 hover:text-black'}`}>Active</button>
                                <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'all' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'}`}>All</button>
                            </div>

                            {/* Bulk Actions Bar */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 mr-2">
                                    <Checkbox
                                        checked={selectedQrIds.size === qrCodes.length && qrCodes.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                        id="select-all"
                                    />
                                    <label htmlFor="select-all" className="text-sm font-medium text-neutral-600 cursor-pointer select-none">
                                        Select All
                                    </label>
                                </div>

                                {selectedQrIds.size > 0 && (
                                    <button
                                        onClick={handleBulkDownload}
                                        disabled={isBulkDownloading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 shadow-sm animate-in fade-in slide-in-from-right-4"
                                    >
                                        {isBulkDownloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Printer className="w-3 h-3" />}
                                        Download PDF ({selectedQrIds.size})
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden min-h-[400px]">
                            {inventoryLoading ? (
                                <div className="p-12 text-center text-neutral-400 flex flex-col items-center">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                    Loading inventory...
                                </div>
                            ) : qrCodes.length === 0 ? (
                                <div className="p-12 text-center text-neutral-400">No QR codes found for this filter.</div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                                    {qrCodes.map(qr => (
                                        <div
                                            key={qr.id}
                                            className={`border rounded-xl p-4 flex flex-col items-center gap-3 transition-all relative group cursor-pointer ${selectedQrIds.has(qr.id) ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500' : 'border-neutral-200 hover:shadow-md hover:border-neutral-300'}`}
                                            onClick={(e) => {
                                                // Toggle selection on card click (unless clicking button)
                                                if ((e.target as HTMLElement).closest('button')) return;
                                                toggleSelectOne(qr.id);
                                            }}
                                        >
                                            {/* Selection Checkbox */}
                                            <div className="absolute top-3 left-3 z-10">
                                                <Checkbox
                                                    checked={selectedQrIds.has(qr.id)}
                                                    onCheckedChange={() => toggleSelectOne(qr.id)}
                                                />
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${qr.status === 'active' ? 'bg-green-500' : 'bg-neutral-300'}`} />

                                            <div className="w-24 h-24 bg-neutral-50 rounded-lg flex items-center justify-center mt-2">
                                                <QrCode className={`w-12 h-12 ${qr.is_downloaded ? 'text-green-600/50' : 'text-neutral-300'}`} />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-mono font-bold text-lg">{qr.code}</p>
                                                <p className="text-[10px] text-neutral-400 capitalize">{qr.status}</p>
                                            </div>

                                            <div className="w-full flex gap-2 mt-auto pt-2">
                                                <button
                                                    onClick={() => handleDownload(qr.code, qr.id)}
                                                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${qr.is_downloaded ? 'bg-green-100 text-green-700' : 'bg-neutral-900 text-white'}`}
                                                    title="Download Single"
                                                >
                                                    <Download className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteQR(qr.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete QR"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Assigned User Info Block */}
                                            {qr.assigned_user && (
                                                <div className="w-full mt-2 pt-2 border-t border-dashed border-neutral-200">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <User className="w-3 h-3 text-blue-600" />
                                                        <span className="text-[10px] font-bold text-blue-800 uppercase">Assigned To</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-neutral-900 truncate" title={qr.assigned_user.name}>
                                                        {qr.assigned_user.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-500 truncate" title={qr.assigned_user.email}>
                                                        {qr.assigned_user.email}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Simple Pagination */}
                        <div className="flex justify-center gap-4 pt-4">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 text-sm font-medium">Prev</button>
                            <span className="py-2 text-neutral-500 text-sm">Page {page}</span>
                            <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white border rounded-lg text-sm font-medium">Next</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Smart QR Modal Handles Assignments */}
            <SmartQRModal
                isOpen={!!selectedUserForQR}
                onClose={() => { setSelectedUserForQR(null); fetchUsers(); }} // Refresh users on close to show updates
                user={selectedUserForQR}
                adminId={adminId}
            />
        </div>
    );
}
interface QRInventoryItem {
    id: string;
    code: string;
    status: 'unused' | 'active' | 'disabled';
    is_downloaded: boolean;
    created_at: string;
    assigned_user_id?: string;
}


