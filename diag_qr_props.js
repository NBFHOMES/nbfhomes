const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRecent() {
    console.log("--- Recent Active QR Codes ---");
    const { data: qrs } = await supabase
        .from('qr_codes')
        .select('code, assigned_user_id, last_scanned_at, status')
        .eq('status', 'active')
        .order('last_scanned_at', { ascending: false })
        .limit(5);
    
    console.log(JSON.stringify(qrs, null, 2));

    if (qrs && qrs.length > 0) {
        for (const qr of qrs) {
            if (qr.assigned_user_id) {
                console.log(`\n--- Properties for User ${qr.assigned_user_id} (Code: ${qr.code}) ---`);
                const { data: props } = await supabase
                    .from('properties')
                    .select('id, title, status, user_id')
                    .eq('user_id', qr.assigned_user_id);
                console.log(JSON.stringify(props, null, 2));
            }
        }
    }
}

checkRecent();
