'use client';

import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export function BannedView() {
    return (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-2 border-red-100">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-10 h-10 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Aapka Account Ban Kar Diya Gaya Hai
                </h1>

                <p className="text-gray-600 mb-8">
                    Security reasons ki wajah se aapka account temporary disabled kar diya gaya hai.
                </p>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/help"
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                        Contact Support Team
                    </Link>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                    >
                        Go Back Home
                    </button>
                </div>
            </div>

            <p className="text-xs text-center text-red-400 mt-8 max-w-xs">
                If you believe this is a mistake, please contact our support team immediately.
            </p>
        </div>
    );
}
