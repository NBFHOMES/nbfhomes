import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Server Component for handling QR Scans
export default async function QRRedirectPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;

    // Prefer service role key (bypasses RLS entirely).
    // Falls back to anon key — requires "Public can scan qr codes" policy in Supabase.
    try {
        console.log(`[QR Scan] Starting scan for code: ${code}`);
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('[QR Scan] Missing Supabase config');
            throw new Error('Supabase configuration missing');
        }

        const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

        console.log(`[QR Scan] Searching for code: ${code}`);

        // Lookup QR Code — try exact match first
        let { data: qr, error } = await supabase
            .from('qr_codes')
            .select('id, status, assigned_user_id, scan_count')
            .eq('code', code)
            .maybeSingle();

        console.log(`[QR Scan] Direct lookup result:`, qr, error);

    // Fallback: case-insensitive match (handles URL case variations)
    if (!qr && !error) {
        const { data: fallback } = await supabase
            .from('qr_codes')
            .select('id, status, assigned_user_id, scan_count')
            .ilike('code', code)
            .maybeSingle();
        qr = fallback;
    }

    // RLS blocked or not found
    if (error || !qr) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px', background: '#f9fafb' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>
                <h1 style={{ color: '#ef4444', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Invalid QR Code</h1>
                <p style={{ color: '#6b7280' }}>This QR code is not recognized by our system.</p>
                <p style={{ fontSize: '12px', color: '#d1d5db', marginTop: '24px', fontFamily: 'monospace' }}>ID: {code}</p>
                <a href="/" style={{ marginTop: '24px', padding: '12px 24px', background: '#000', color: '#fff', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}>Go to NBF Homes</a>
            </div>
        );
    }

    if (qr.status === 'unused') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px', background: '#fffbeb' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
                <h1 style={{ color: '#d97706', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Not Yet Activated</h1>
                <p style={{ color: '#6b7280' }}>This Smart QR code has not been linked to any property owner yet.</p>
                <p style={{ color: '#9ca3af', marginTop: '8px' }}>Please contact NBF Homes support to activate this code.</p>
                <a href="/" style={{ marginTop: '24px', padding: '12px 24px', background: '#000', color: '#fff', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}>Go to NBF Homes</a>
            </div>
        );
    }

    if (qr.status === 'disabled') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚫</div>
                <h1 style={{ color: '#ef4444', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Deactivated</h1>
                <p style={{ color: '#6b7280' }}>This QR code has been disabled by the administrator.</p>
                <a href="/" style={{ marginTop: '24px', padding: '12px 24px', background: '#000', color: '#fff', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}>Go to NBF Homes</a>
            </div>
        );
    }

        // Active — track scan count (best effort, don't block redirect)
        if (qr.status === 'active' && qr.assigned_user_id) {
            try {
                await supabase.from('qr_codes').update({
                    scan_count: (qr.scan_count || 0) + 1,
                    last_scanned_at: new Date().toISOString()
                }).eq('id', qr.id);
            } catch (err) {
                // Non-fatal
            }

            // Redirect to user's public profile with all their properties
            redirect(`/view-profile/${qr.assigned_user_id}`);
        }

        // Fallback (should never reach here)
        redirect('/');
    } catch (err: any) {
        console.error(`[QR Scan] Global Error:`, err);
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px', background: '#fff' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>❗</div>
                <h1 style={{ color: '#000', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>System Error</h1>
                <p style={{ color: '#666' }}>Something went wrong while processing the scan.</p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '24px' }}>{err.message}</p>
                <a href="/" style={{ marginTop: '24px', padding: '12px 24px', background: '#000', color: '#fff', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}>Back to Home</a>
            </div>
        );
    }
}
