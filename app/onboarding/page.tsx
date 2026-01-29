'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { updateUserProfile } from '@/lib/api';
import { supabase } from '@/lib/db';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
    "Lakshadweep", "Puducherry"
];

export default function OnboardingPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // NEW: Explicit state for 'Other' mode
    const [isOther, setIsOther] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        profession: '',
        state: '',
        city: '',
        phoneNumber: ''
    });

    useEffect(() => {
        setIsMounted(true);
        if (user?.user_metadata?.full_name) {
            setFormData(prev => ({ ...prev, fullName: user.user_metadata.full_name }));
        }
    }, [user?.id, user?.user_metadata?.full_name]); // Only re-run when user ID or name changes, not entire user object

    // Handle initial profession load (if editing or retrying)
    useEffect(() => {
        if (formData.profession &&
            !['Student', 'Job Worker', 'Property Owner'].includes(formData.profession)) {
            setIsOther(true);
        }
    }, [formData.profession]);

    useEffect(() => {
        if (isMounted && !isLoading && !user) {
            router.replace('/');
        }
    }, [user?.id, isLoading, router, isMounted]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName || !formData.profession || !formData.state || !formData.city || !formData.phoneNumber) {
            toast.error("Please fill in all details");
            return;
        }

        if (formData.phoneNumber.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setSubmitting(true);

        try {
            // Direct Save - No OTP
            // Ensure profession is saved exactly as typed
            const result: any = await updateUserProfile(user!.id, {
                full_name: formData.fullName,
                profession: formData.profession.trim(),
                state: formData.state,
                city: formData.city,
                contactNumber: formData.phoneNumber,
                is_onboarded: true
            });

            if (result.success) {
                toast.success("Profile setup complete!");
                setIsSuccess(true);

                // Refresh session to ensure latest claims
                await supabase.auth.refreshSession();

                // Hard Redirect to Home Page (/)
                setTimeout(() => {
                    window.location.href = '/';
                }, 500);

                // Fallback Safety: If redirection hangs (e.g. connectivity), allow retry after 5s
                setTimeout(() => {
                    setSubmitting(false);
                    setIsSuccess(false);
                    toast.error("Redirection taking too long. Please refresh.");
                }, 5000);
            } else {
                throw new Error(result.error?.message || "Failed to update profile.");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to save profile");
        } finally {
            // Stop spinner after POST request completes (200 response)
            setSubmitting(false);
        }
    };

    if (isLoading || !user || !isMounted || isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50/50 backdrop-blur-sm p-4">
            {/* Full Page Form Container */}
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-neutral-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-neutral-900">Complete Your Profile</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Please provide your details to continue.
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-5">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="Enter your full name"
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>

                    {/* Phone Section (No Verification) */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number (Mandatory)</label>
                        <input
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            maxLength={10}
                        />
                    </div>

                    {/* Profession & State */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Profession</label>
                            <select
                                required
                                className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white text-sm"
                                value={isOther ? 'Other' : formData.profession}
                                onChange={(e) => {
                                    if (e.target.value === 'Other') {
                                        setIsOther(true);
                                        setFormData({ ...formData, profession: '' });
                                    } else {
                                        setIsOther(false);
                                        setFormData({ ...formData, profession: e.target.value });
                                    }
                                }}
                            >
                                <option value="">Select</option>
                                <option value="Student">Student</option>
                                <option value="Job Worker">Job Worker</option>
                                <option value="Property Owner">Property Owner</option>
                                <option value="Other">Other</option>
                            </select>

                            {/* Custom Profession Input */}
                            {isOther && (
                                <input
                                    type="text"
                                    placeholder="Enter your profession"
                                    className="mt-2 w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm animate-in fade-in slide-in-from-top-1"
                                    value={formData.profession}
                                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                                    required
                                    autoFocus
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">State</label>
                            <select
                                required
                                className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white text-sm"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            >
                                <option value="">Select</option>
                                {INDIAN_STATES.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
                        <input
                            type="text"
                            required
                            placeholder="Enter your city"
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-neutral-900 text-white font-medium py-3 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save & Continue'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
