const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is not set in backend/.env');
}

const key = serviceRoleKey || anonKey;
if (!key) {
  throw new Error('Neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_ANON_KEY is set in backend/.env');
}

const supabase = createClient(supabaseUrl, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

function usesServiceRole() {
  return Boolean(serviceRoleKey);
}

async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) throw error;

    return {
      ok: true,
      url: supabaseUrl,
      mode: usesServiceRole() ? 'service_role' : 'anon',
      totalUsers: data.total
    };
  } catch (err) {
    return {
      ok: false,
      url: supabaseUrl,
      mode: usesServiceRole() ? 'service_role' : 'anon',
      error: err.message
    };
  }
}

module.exports = { supabase, testSupabaseConnection, usesServiceRole };
