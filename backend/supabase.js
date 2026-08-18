const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

function isValidUrl(url) {
  return url && url.startsWith('http');
}

let supabase = null;

if (isValidUrl(supabaseUrl) && (serviceRoleKey || anonKey)) {
  const key = serviceRoleKey || anonKey;
  supabase = createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function usesServiceRole() {
  return Boolean(serviceRoleKey);
}

async function testSupabaseConnection() {
  if (!supabase) {
    return {
      ok: false,
      url: supabaseUrl,
      mode: usesServiceRole() ? 'service_role' : 'anon',
      error: 'Supabase not configured'
    };
  }
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
