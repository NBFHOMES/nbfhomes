import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Server-only Check
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function SmartRedirectionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!id) return <div>Invalid ID</div>;

    // 1. Lookup User
    const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('assigned_qr_id', id)
        .single();

    if (user && user.id) {
        // 2. Redirect to Portfolio
        redirect(`/catalog/${user.id}`);
    }

    // 3. Fallback: QR Not Assigned
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-neutral-900 mb-2">QR Not Activated</h1>
            <p className="text-neutral-500 max-w-xs mx-auto mb-8">
                This QR Code ({id}) has not been linked to any user yet.
            </p>
            <Link
                href="/"
                className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-md"
            >
                Go Home
            </Link>
        </div>
    );
}
