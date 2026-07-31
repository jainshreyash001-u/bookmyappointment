const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICEROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICEROLE_KEY in environment variables.");
}

const supabase = createClient(supabaseUrl || "", supabaseServiceKey || "", {
  auth: {
    persistSession: false,
  },
});

module.exports = supabase;
