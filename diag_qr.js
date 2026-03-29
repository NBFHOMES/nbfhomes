
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  console.log('Checking QR codes with ANON_KEY...');
  const { data, count, error } = await supabase
    .from('qr_codes')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Found ${data.length} codes (Total count: ${count})`);
    console.log('Sample codes:', data.map(d => ({ code: d.code, status: d.status })));
  }
}

check();
