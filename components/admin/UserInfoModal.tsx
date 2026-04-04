'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { User, Mail, Phone, Briefcase, MessageCircle, Calendar, Home, ExternalLink, Eye, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminUser {
    userId: string;
    name: string;
    email: string;
    contactNumber: string;
    whatsappNumber?: string;
    role: string;
    isVerified: boolean;
    totalProperties: number;
    activeProperties: number;
    profession: string;
    status: string;
    createdAt: string;
}

interface UserInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: AdminUser;
}

const CATEGORY_MAP: Record<string, { label: string; emoji: string; color: string }> = {
    student:        { label: 'Student',        emoji: '🎓', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    job:            { label: 'Working Pro',    emoji: '💼', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    property_owner: { label: 'Property Owner', emoji: '🏠', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function UserInfoModal({ isOpen, onClose, user }: UserInfoModalProps) {
    if (!user) return null;

    const catInfo = CATEGORY_MAP[user.profession] || null;
    const joinedDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'N/A';

    const contactClean = user.contactNumber?.replace(/\D/g, '');
    const whatsappClean = user.whatsappNumber?.replace(/\D/g, '');

    const handleViewHistory = () => {
        // Open in same tab — reliable without router unmount race condition
        window.location.href = `/admin/users/${user.userId}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white text-neutral-900 border-neutral-200 p-0 overflow-hidden">
                <DialogHeader className="sr-only">
                    <DialogTitle>User Details</DialogTitle>
                    <DialogDescription>Detailed information about the selected user</DialogDescription>
                </DialogHeader>

                {/* Top gradient bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />

                <div className="p-6 space-y-4">
                    {/* Avatar + Name + Status */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-neutral-900 text-white flex items-center justify-center text-2xl font-bold shrink-0 shadow-lg">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-neutral-900 truncate">{user.name}</h3>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                    user.status === 'banned'
                                        ? 'bg-red-100 text-red-700 border-red-200'
                                        : 'bg-green-100 text-green-700 border-green-200'
                                }`}>
                                    {user.status === 'banned' ? '🚫 Banned' : '✅ Active'}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200 uppercase">
                                    {user.role}
                                </span>
                                {catInfo && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${catInfo.color}`}>
                                        {catInfo.emoji} {catInfo.label}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    {/* Info rows */}
                    <div className="space-y-2.5">

                        {/* Email */}
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4 text-neutral-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Email</p>
                                <p className="text-sm font-medium text-neutral-900 truncate">{user.email || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Contact Number + Call Button */}
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Contact Number</p>
                                {contactClean && contactClean !== 'N/A' && contactClean.length >= 6 ? (
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-mono font-semibold text-blue-700">+91 {user.contactNumber}</p>
                                        <a
                                            href={`tel:+91${contactClean}`}
                                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors font-medium"
                                        >
                                            <Phone className="w-3 h-3" />
                                            Call
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-sm text-neutral-300 italic">Not filled</p>
                                )}
                            </div>
                        </div>

                        {/* WhatsApp Number + Chat Button */}
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                                <MessageCircle className="w-4 h-4 text-green-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">WhatsApp</p>
                                {whatsappClean ? (
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-mono font-semibold text-green-700">+91 {user.whatsappNumber}</p>
                                        <a
                                            href={`https://wa.me/91${whatsappClean}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[11px] text-green-600 hover:text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full hover:bg-green-100 transition-colors font-medium"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            Chat
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-sm text-neutral-300 italic">Not filled</p>
                                )}
                            </div>
                        </div>

                        {/* Properties */}
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                                <Home className="w-4 h-4 text-purple-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Listed Properties</p>
                                <p className="text-sm font-semibold text-neutral-900">
                                    {user.totalProperties} total · {user.activeProperties} active
                                </p>
                            </div>
                        </div>

                        {/* Joined Date */}
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0">
                                <Calendar className="w-4 h-4 text-neutral-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Joined</p>
                                <p className="text-sm font-medium text-neutral-900">{joinedDate}</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    {/* View Full History CTA */}
                    <button
                        onClick={handleViewHistory}
                        className="w-full flex items-center justify-between px-4 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <Eye className="w-4 h-4 text-blue-400" />
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                <MessageCircle className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold">View Full History</p>
                                <p className="text-[11px] text-neutral-400">Properties viewed · Contacts · Inquiries</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full font-medium text-neutral-600"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
