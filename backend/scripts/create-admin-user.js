const { supabase } = require('../supabase');

const ADMIN_EMAIL = 'ppriyansh790@gmail.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin';

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: ADMIN_NAME,
      tier: 'Admin',
      currency: 'INR',
      avatar_url: 'https://i.pravatar.cc/160?img=12'
    }
  });

  if (error) {
    if (error.message && error.message.toLowerCase().includes('already')) {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = (list?.users || []).find((u) => u.email === ADMIN_EMAIL);
      if (existing) {
        const update = await supabase.auth.admin.updateUserById(existing.id, {
          email_confirm: true,
          user_metadata: { ...existing.user_metadata, tier: 'Admin', full_name: ADMIN_NAME }
        });
        console.log(update.error ? `Update failed: ${update.error.message}` : `Admin user updated: ${existing.id}`);
      }
      return;
    }
    console.error('Failed to create admin user:', error.message);
    process.exitCode = 1;
    return;
  }

  console.log(`Admin user created: ${data.user.email} (${data.user.id})`);
}

main();
