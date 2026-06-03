const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    // Check if RLS is enabled
    const { data: rlsData, error: rlsError } = await supabaseAdmin.rpc('get_policies');
    console.log("RPC get_policies (might fail if not defined):", rlsError?.message || "Success");
    
    // We can just query pg_policies using postgres if we had direct access, but via REST we can't easily.
    // Let's just try to read using anon key with Vanessa's user_id if we can mock the JWT.
    // Actually, we can fetch all user_progress to verify it's there.
    const { data: allProgress } = await supabaseAdmin.from('user_progress').select('*');
    console.log(`Total user_progress rows: ${allProgress?.length}`);
    
    const { data: allStreaks } = await supabaseAdmin.from('user_streaks').select('*');
    console.log(`Total user_streaks rows: ${allStreaks?.length}`);
}

check();
