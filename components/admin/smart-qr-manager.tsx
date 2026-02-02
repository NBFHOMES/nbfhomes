'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateQRCodesAction, getQRCodesAction, markQRDownloadedAction } from '@/app/actions';
import { Download, Plus, Filter, RefreshCw, Loader2, QrCode } from 'lucide-react';
import { useLoader } from '@/context/loader-context';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';

interface QRInventoryItem {
    id: string;
    code: string;
    status: 'unused' | 'active' | 'disabled';
    is_downloaded: boolean;
    created_at: string;
}

export function SmartQRManager({ adminId }: { adminId: string }) {
    const { showLoader, hideLoader } = useLoader();
    const [qrCodes, setQrCodes] = useState<QRInventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unused' | 'active'>('all');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [genCount, setGenCount] = useState(5);
    const [genPrefix, setGenPrefix] = useState('NBF');

    const fetchQRs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getQRCodesAction(page, 20, filter);
            if (res.success) {
                setQrCodes(res.codes || []);
                setTotal(res.total || 0);
            } else {
                toast.error("Failed to load QR codes");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error loading QR codes");
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => {
        fetchQRs();
    }, [fetchQRs]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        showLoader();
        try {
            const res = await generateQRCodesAction(genCount, genPrefix, adminId);
            if (res.success) {
                toast.success(`Successfully generated ${res.count} QR codes!`);
                fetchQRs();
            } else {
                toast.error("Generation failed: " + res.error);
            }
        } catch (err) {
            console.error(err);
            toast.error("Generation error");
        } finally {
            setIsGenerating(false);
            hideLoader();
        }
    };

    const handleDownload = async (qr: QRInventoryItem) => {
        // Create canvas to draw QR and text
        const canvas = document.createElement('canvas');
        const size = 300;
        const padding = 20;
        canvas.width = size;
        canvas.height = size + 50; // Extra space for text
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Fill background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Render QR
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size - 2 * padding}x${size - 2 * padding}&data=${encodeURIComponent(`https://www.nbfhomes.in/qr/${qr.code}`)}`;
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = qrUrl;

        img.onload = async () => {
            ctx.drawImage(img, padding, padding);

            // Add Text
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(qr.code, canvas.width / 2, size + 30);

            // Download
            const link = document.createElement('a');
            link.download = `QR_${qr.code}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            // Mark as downloaded
            await markQRDownloadedAction(qr.id);
            setQrCodes(prev => prev.map(q => q.id === qr.id ? { ...q, is_downloaded: true } : q));
            toast.success("QR Downloaded");
        };
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <QrCode className="w-6 h-6 text-blue-600" />
                        Smart QR Management
                    </h2>
                    <p className="text-sm text-neutral-500">Manage, Generate, and Print QR Inventory</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-lg">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-white shadow text-black' : 'text-neutral-500 hover:text-black'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unused')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'unused' ? 'bg-white shadow text-green-700' : 'text-neutral-500 hover:text-green-700'}`}
                        >
                            Unused
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'active' ? 'bg-white shadow text-blue-700' : 'text-neutral-500 hover:text-blue-700'}`}
                        >
                            Active
                        </button>
                    </div>
                </div>
            </div>

            {/* Generator Panel */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 flex flex-col md:flex-row items-end gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-blue-800">Prefix</label>
                    <input
                        type="text"
                        value={genPrefix}
                        onChange={(e) => setGenPrefix(e.target.value.toUpperCase())}
                        className="block w-32 px-3 py-2 rounded-lg border-blue-200 focus:ring-blue-500 font-mono"
                        placeholder="NBF"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-blue-800">Count</label>
                    <select
                        value={genCount}
                        onChange={(e) => setGenCount(Number(e.target.value))}
                        className="block w-24 px-3 py-2 rounded-lg border-blue-200 focus:ring-blue-500"
                    >
                        <option value={1}>1</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Generate QRs
                </button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            ) : qrCodes.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 bg-neutral-50 rounded-xl border border-dashed">
                    No QR codes found. Generate some above!
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {qrCodes.map((qr) => (
                        <div key={qr.id} className="bg-white p-4 rounded-xl border hover:border-blue-300 transition-all group relative">
                            <div className="absolute top-2 right-2">
                                <span className={`w-2 h-2 rounded-full block ${qr.status === 'active' ? 'bg-blue-500' : 'bg-green-500'}`} />
                            </div>

                            <div className="flex justify-center mb-3">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://nbf-x-39dd7c53.vercel.app/qr/${qr.code}`)}`}
                                    alt="QR"
                                    className="w-24 h-24 opacity-90 group-hover:opacity-100 transition-opacity mix-blend-multiply"
                                />
                            </div>

                            <div className="text-center space-y-2">
                                <p className="font-mono font-bold text-lg text-neutral-800">{qr.code}</p>
                                <div className="flex justify-center gap-1">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${qr.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {qr.status}
                                    </span>
                                    {qr.is_downloaded && (
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                                            Downloaded
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDownload(qr)}
                                    className="w-full mt-2 py-1.5 flex items-center justify-center gap-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition-colors"
                                >
                                    <Download className="w-3 h-3" />
                                    Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
