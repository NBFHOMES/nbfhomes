import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Server Component for handling QR Scans
export default async function QRRedirectPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;

    // Use Admin/Service client to lookup QR regardless of RLS (Public Access)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Lookup QR Code
    // We use service key because public users (scanning) won't be logged in, 
    // but they need to "read" the QR status to be redirected.
    const { data: qr, error } = await supabase
        .from('qr_codes')
        .select('status, assigned_user_id, scan_count')
        .eq('code', code) // Case sensitive or insensitive? Ideally exact match from URL
        .single();

    if (error || !qr) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
                <h1 style={{ color: '#ef4444' }}>Invalid QR Code</h1>
                <p>This QR code is not recognized by our system.</p>
                <p style={{ fontSize: '12px', color: '#888', marginTop: '20px' }}>ID: {code}</p>
            </div>
        );
    }

    if (qr.status === 'unused') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
                <h1 style={{ color: '#f59e0b' }}>Setup Required</h1>
                <p>This Smart QR code is not yet linked to any user.</p>
                <p>Please contact NBF Homes support to activate this code.</p>
                <div style={{ marginTop: '20px', padding: '10px 20px', background: '#f3f4f6', borderRadius: '8px', fontWeight: 'bold' }}>
                    ID: {code}
                </div>
            </div>
        );
    }

    if (qr.status === 'disabled') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
                <h1 style={{ color: '#ef4444' }}>Deactivated</h1>
                <p>This QR code has been disabled.</p>
            </div>
        );
    }

    // 2. If Active, Redirect to User Profile
    if (qr.status === 'active' && qr.assigned_user_id) {
        // --- TRACKING LOGIC ---
        // Fire and forget (don't await to speed up redirect? Or await to ensure count?)
        // Better to await briefly or just let it happen. Next.js server actions / components are async.
        // We Use Service Role Client to update (Public users cannot update RLS)
        try {
            await supabase.from('qr_codes').update({
                scan_count: (qr.scan_count || 0) + 1,
                last_scanned_at: new Date().toISOString()
            }).eq('code', code);
        } catch (err) {
            console.error("Tracking Failed", err);
        }

        // Redirect to the user's public profile page
        redirect(`/view-profile/${qr.assigned_user_id}`);
    }

    // Fallback
    return <div>Redirecting...</div>;
}
