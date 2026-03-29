
const supabaseUrl = "https://tivozbibkihbputcfxox.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpdm96Ymlia2loYnB1dGNmeG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMTQzOTksImV4cCI6MjA4MzY5MDM5OX0.PZKCirncrSrnM0cVc8ObMwUzSvocrrf7rq97Vcap9Ho";

async function test() {
    console.log("Testing QR Table Visibility (Public/Anon)...");
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/qr_codes?select=*&limit=5`, {
            headers: {
                "apikey": supabaseAnonKey,
                "Authorization": `Bearer ${supabaseAnonKey}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            console.log(`Success! Found ${data.length} codes visible to public.`);
            data.forEach(q => console.log(` - ${q.code} (${q.status})`));
            
            const unused = data.filter(q => q.status === 'unused');
            if (unused.length === 0) {
                console.log("NOTE: No 'unused' codes found. Run the SQL script to see them.");
            } else {
                console.log("GOOD: 'unused' codes ARE visible! (RLS Fix confirmed)");
            }
        } else {
            const err = await res.text();
            console.error("Failed to fetch QR codes (Check RLS):", err);
        }
    } catch (e) {
        console.error("Fetch Error:", e.message);
    }
}

test();
