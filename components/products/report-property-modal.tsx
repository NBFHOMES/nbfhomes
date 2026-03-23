'use client';

import { useState } from 'react';
import { Flag, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Product } from '@/lib/types';
import { toast } from 'sonner';
import { submitPropertyReportAction } from '@/app/actions';

interface ReportPropertyModalProps {
    product: Product;
}

export function ReportPropertyModal({ product }: ReportPropertyModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [reason, setReason] = useState('Fake Listing');
    const [details, setDetails] = useState('');
    const [reporterName, setReporterName] = useState('');
    const [reporterPhone, setReporterPhone] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!reporterName || !reporterPhone || reporterPhone.length < 10) {
            toast.error('Please provide a valid name and 10-digit phone number.');
            return;
        }

        setIsLoading(true);
        try {
            const ownerName = product.contactNumber ? "Protected Owner" : "Unknown"; // In case phone is masked
            const id = product.id.toString();

            const res = await submitPropertyReportAction(
                id,
                product.title,
                ownerName,
                { name: reporterName, phone: reporterPhone },
                reason,
                details
            );

            if (res.success) {
                toast.success('Report submitted successfully. Our team will investigate within 24 hours.');
                setIsOpen(false);
                setDetails('');
            } else {
                toast.error(res.error || 'Failed to submit report. Please try again.');
            }
        } catch (err) {
            toast.error('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-red-100 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors rounded-full text-sm font-bold uppercase tracking-wider w-full md:w-auto justify-center"
            >
                <Flag size={16} />
                Report Property
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-red-600 p-6 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="animate-pulse" />
                        <h2 className="text-xl font-bold">Report Property</h2>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="text-white/80 hover:text-white text-2xl"
                    >
                        &times;
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex flex-col gap-6">
                    {/* Auto-filled Target Box */}
                    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex flex-col gap-2 relative">
                        <div className="absolute top-0 right-0 bg-neutral-200 text-neutral-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase">Auto-Filled</div>
                        <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Target Property</p>
                        <p className="font-bold text-neutral-900 line-clamp-1">{product.title}</p>
                        <p className="text-xs text-neutral-500">ID: {product.id}</p>
                        <div className="mt-2 text-sm bg-white p-2 border border-neutral-100 rounded-lg flex gap-2 items-center">
                            <ShieldCheck size={16} className="text-green-600" />
                            Report will be strictly confidential
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Your Name *</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" 
                                    placeholder="John Doe"
                                    value={reporterName}
                                    onChange={(e) => setReporterName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Your Phone *</label>
                                <input 
                                    type="tel" 
                                    required 
                                    maxLength={10}
                                    className="w-full border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" 
                                    placeholder="9876543210"
                                    value={reporterPhone}
                                    onChange={(e) => setReporterPhone(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Select Reason *</label>
                            <select 
                                value={reason} 
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none bg-white font-medium"
                            >
                                <option value="Fake / Scam Listing">Fake / Scam Listing</option>
                                <option value="Property Already Rented Out">Property Already Rented Out</option>
                                <option value="Broker Demanding Money">Broker Demanding Money</option>
                                <option value="Wrong Contact Number">Wrong Contact Number</option>
                                <option value="Fraudulent Owner Behavior">Fraudulent Owner Behavior</option>
                                <option value="Other">Other Issues</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Additional Details (Optional)</label>
                            <textarea 
                                className="w-full border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none min-h-[100px] resize-none" 
                                placeholder="Explain what happened..."
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="mt-2 w-full bg-red-600 text-white font-bold uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <span className="animate-spin border-2 border-white/30 border-t-white h-5 w-5 rounded-full" /> : <Flag size={18} />}
                            {isLoading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
