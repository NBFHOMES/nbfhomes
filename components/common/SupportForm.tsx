'use client';

import { Mail, Phone, Send, Loader2, User, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitSupportRequestAction } from '@/app/support-actions';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export function SupportForm() {
    const { user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        subject: 'Account Ban Appeal',
        message: ''
    });

    // Auto-fill user data when available
    useEffect(() => {
        if (user) {
            const nameParts = (user.user_metadata?.full_name || user.user_metadata?.name || '').split(' ');
            setFormData(prev => ({
                ...prev,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                email: user.email || '',
                phoneNumber: user.user_metadata?.phone_number || ''
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await submitSupportRequestAction({
                ...formData,
                userId: user?.id
            });

            if (!result.success) {
                console.error('Failed to submit support request:', result.error);
                toast.error('Failed to submit request. Please try again.');
            } else {
                toast.success('Request Sent! We will review your appeal shortly.');
                // Redirect to homepage after short delay
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            }
        } catch (error) {
            console.error('Error in support form:', error);
            toast.error('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-neutral-200 w-full max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-red-600">
                Support & Appeals
            </h2>

            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-800">
                    If you believe your account was banned by mistake, please submit an appeal below. Our team will review your request.
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium text-neutral-700">First Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                id="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                                placeholder="John"
                                required
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium text-neutral-700">Last Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                id="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                                placeholder="Doe"
                                required
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-neutral-700">Email (Read-only)</label>
                    <div className="relative">
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            readOnly
                            className="w-full pl-11 pr-4 py-3 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed focus:outline-none"
                            placeholder="john@example.com"
                            required
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="text-sm font-medium text-neutral-700">Phone Number</label>
                    <div className="relative">
                        <input
                            type="tel"
                            id="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                            placeholder="+91 99999 99999"
                            required
                        />
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-neutral-700">Subject/Reason</label>
                    <select
                        id="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                    >
                        <option>Account Ban Appeal</option>
                        <option>Technical Issue</option>
                        <option>Other Support</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-neutral-700">Additional Details</label>
                    <textarea
                        id="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                        placeholder="Please explain why you believe the ban is a mistake or provide any relevant details..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {isSubmitting ? 'Sending...' : 'Submit Appeal'}
                </button>
            </form>
        </div>
    );
}
