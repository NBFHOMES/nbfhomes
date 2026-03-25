'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, QrCode, Type, CheckCircle2, Loader2, RefreshCcw, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { assignUserQR } from '@/app/actions';

interface SmartQRModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: { userId: string; name: string } | null;
    adminId: string | undefined;
}

export function SmartQRModal({ isOpen, onClose, user, adminId }: SmartQRModalProps) {
    const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
    const [manualId, setManualId] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);

    // Scanner Refs
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerRegionId = 'html5qr-code-full-region';

    const startScanner = async () => {
        if (scannerRef.current) return;

        // Ensure we are in a secure context (HTTPS)
        if (!window.isSecureContext) {
            setScanError("Security Error: Camera access requires a secure (HTTPS) connection.");
            return;
        }

        const element = document.getElementById(scannerRegionId);
        if (!element) {
            setTimeout(startScanner, 200);
            return;
        }

        try {
            const scanner = new Html5Qrcode(scannerRegionId, {
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                verbose: false
            });
            scannerRef.current = scanner;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            // Attempt 1: Back Camera (Environment)
            try {
                await scanner.start(
                    { facingMode: "environment" },
                    config,
                    handleScanSuccess,
                    () => { } // Error on frame-by-frame is ignored
                );
            } catch (envError) {
                console.warn("Back camera failed, trying fallback...", envError);
                
                // Attempt 2: Try any available camera
                const cameras = await Html5Qrcode.getCameras();
                if (cameras && cameras.length > 0) {
                    // Filter for back cameras if possible, otherwise use the first one
                    const backCamera = cameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear'));
                    const cameraId = backCamera ? backCamera.id : cameras[0].id;
                    
                    await scanner.start(cameraId, config, handleScanSuccess, () => { });
                } else {
                    throw envError; // No cameras found or permission denied
                }
            }
        } catch (err: any) {
            console.error("Scanner error:", err);

            if (activeTab !== 'scan') return;

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission denied')) {
                setScanError("Permission Denied: Please enable camera access in your browser settings.");
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setScanError("Hardware Error: No camera detected on this device.");
            } else {
                setScanError("Camera Error: " + (err.message || "Unable to start camera"));
            }
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                await scannerRef.current.clear(); // Important: Clear the DOM element
            } catch (ignore) {
                console.warn("Failed to stop scanner cleanly:", ignore);
            }
            scannerRef.current = null;
        }
    };

    // Reset when opening for new user
    useEffect(() => {
        if (isOpen && user) {
            setActiveTab('scan');
            setManualId('');
            setScanError(null);
        }
    }, [isOpen, user]);

    // Handle Scanner Lifecycle
    useEffect(() => {
        if (!isOpen || activeTab !== 'scan') {
            stopScanner();
            return;
        }

        // Start Scanner with delay to ensure DOM is ready
        const timer = setTimeout(() => {
            startScanner();
        }, 300);

        return () => {
            clearTimeout(timer);
            stopScanner();
        };
    }, [isOpen, activeTab]);

    const handleScanSuccess = (qrCode: string) => {
        stopScanner();
        // Beep or Vibrate
        if (navigator.vibrate) navigator.vibrate(200);
        handleAssign(qrCode);
    };

    const handleAssign = async (qrCode: string) => {
        if (!user || !adminId) return;
        setIsAssigning(true);

        const res = await assignUserQR(adminId, user.userId, qrCode);

        if (res.success) {
            toast.success("Success! QR Linked to " + user.name, {
                description: `ID: ${qrCode}`,
                duration: 4000
            });
            onClose();
        } else {
            toast.error("Failed to Link QR", { description: res.error });
            // If failed, restart scanner if in scan mode? 
            // Better to let user retry manually or restart
        }
        setIsAssigning(false);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation handled in server action too, but let's be nice
        if (!manualId.trim().includes('_')) {
            toast.error("Invalid Format", { description: "Must contain an underscore (e.g. NBF_XYZ)" });
            return;
        }
        handleAssign(manualId.trim());
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-white">
                    <div>
                        <h3 className="font-bold text-lg text-neutral-900">Link Smart QR</h3>
                        <p className="text-xs text-neutral-500">Assign to: <span className="font-semibold text-black">{user.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full">
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-100">
                    <button
                        onClick={() => setActiveTab('scan')}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'scan' ? 'text-black border-b-2 border-black bg-neutral-50' : 'text-neutral-400 hover:text-neutral-600'}`}
                    >
                        <Camera className="w-4 h-4" /> Scan
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'manual' ? 'text-black border-b-2 border-black bg-neutral-50' : 'text-neutral-400 hover:text-neutral-600'}`}
                    >
                        <Type className="w-4 h-4" /> Manual Entry
                    </button>
                </div>

                <div className="p-6 min-h-[300px] flex flex-col items-center justify-center relative bg-neutral-50">

                    {/* Mode: SCAN */}
                    {activeTab === 'scan' && (
                        <div className="w-full h-full flex flex-col items-center">
                            {!isAssigning && !scanError && (
                                <div className="w-full aspect-square bg-black rounded-xl overflow-hidden relative shadow-inner">
                                    <div id={scannerRegionId} className="w-full h-full" />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none flex items-center justify-center">
                                        <div className="w-full h-[2px] bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
                                    </div>
                                </div>
                            )}

                            {scanError && (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Camera className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-red-600 mb-4">{scanError}</p>
                                    <button onClick={() => { setScanError(null); startScanner(); }} className="text-xs bg-white border border-neutral-200 px-3 py-1.5 rounded-md font-bold shadow-sm">
                                        Retry Camera
                                    </button>
                                </div>
                            )}

                            <p className="text-xs text-neutral-400 mt-4 text-center">Point camera at a blank NBF QR Code</p>
                        </div>
                    )}

                    {/* Mode: MANUAL */}
                    {activeTab === 'manual' && (
                        <div className="w-full flex-1 flex flex-col justify-center">
                            <form onSubmit={handleManualSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-neutral-500 mb-1.5 block">Enter QR ID</label>
                                    <input
                                        value={manualId}
                                        onChange={(e) => setManualId(e.target.value)}
                                        placeholder="nbf_Mandsaur_XYZ123"
                                        className="w-full p-4 text-center text-lg font-mono font-bold border-2 border-neutral-200 rounded-xl focus:border-black outline-none"
                                        autoFocus
                                    />
                                    <p className="text-[10px] text-neutral-400 mt-2 text-center">Must contain underscore (e.g. MDS_123)</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!manualId.trim() || isAssigning}
                                    className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-neutral-900 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Link User
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Loading Overlay */}
                    {isAssigning && activeTab === 'scan' && (
                        <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center text-center">
                            <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
                            <p className="font-bold text-lg">Linking QR...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
