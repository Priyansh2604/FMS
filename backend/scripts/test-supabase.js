const { testSupabaseConnection } = require('../supabase');

testSupabaseConnection()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 1;
  })
  .catch((err) => {
    console.error('Supabase test failed:', err.message);
    process.exitCode = 1;
  });
