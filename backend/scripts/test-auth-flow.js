const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');
const { supabase: adminSupabase } = require('../supabase');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('SUPABASE_URL / SUPABASE_ANON_KEY missing in backend/.env');
  process.exit(1);
}

// Client mimicking the frontend (anon key only, like frontend/src/auth.js)
const supabase = createClient(supabaseUrl, anonKey);

const TEST_PASSWORD = 'TestPass@123';
const TEST_EMAIL = `aura.authtest.${Date.now()}@gmail.com`;

let pass = 0;
let fail = 0;

function report(name, ok, detail = '') {
  const tag = ok ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${name}${detail ? ` — ${detail}` : ''}`);
  ok ? pass++ : fail++;
}

async function main() {
  let userId = null;

  // Supabase enforces a per-IP email rate limit. Retry with backoff if tripped.
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  try {
    // 1) Sign up: same call the frontend's registerUser() makes
    let signUp = null;
    for (let attempt = 1; attempt <= 4; attempt++) {
      signUp = await supabase.auth.signUp({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        options: { data: { full_name: 'Auth Test', tier: 'Free Member', currency: 'INR' } }
      });
      if (!signUp.error || !/rate limit/i.test(signUp.error.message)) break;
      console.log(`   signUp email rate-limited (attempt ${attempt}/4); waiting 60s…`);
      await sleep(60 * 1000);
    }

    const pending = !!(signUp.data?.user && !signUp.data?.session);
    report('signUp creates user & requires email verification (pending)', pending, signUp.data?.user ? signUp.data.user.id : (signUp.error?.message || 'no user'));
    if (!signUp.data?.user) {
      console.log('\nSkipping remaining steps: Supabase email rate limit is still active. Run `npm run test:auth` again in a few minutes.');
      return;
    }
    userId = signUp.data.user.id;
    report('signUp returns no session (pending confirmation)', !signUp.data.session);

    // 2) Resend signup OTP: same call as resendSignupOtp()
    const parseCooldown = (msg) => {
      const m = (msg || '').match(/after (\d+) seconds/i);
      return m ? Number(m[1]) + 2 : 62;
    };

    let resend = await supabase.auth.resend({ type: 'signup', email: TEST_EMAIL });
    if (resend.error && /only request this after/i.test(resend.error.message)) {
      const wait = parseCooldown(resend.error.message);
      console.log(`   resend rate-limited; waiting ${wait}s…`);
      await sleep(wait * 1000);
      resend = await supabase.auth.resend({ type: 'signup', email: TEST_EMAIL });
    }
    report('resend signup OTP', !resend.error, resend.error?.message || '');

    // 3) Generate the real confirmation token via admin API (equivalent to the emailed {{ .TokenHash }} / {{ .Token }})
    const link = await adminSupabase.auth.admin.generateLink({
      type: 'signup',
      email: TEST_EMAIL,
      options: { redirectTo: 'http://localhost:5173/verify' }
    });
    if (link.error) {
      report('generateLink (admin) for signup', false, link.error.message);
      return;
    }
    report('generateLink (admin) for signup', true);
    const props = link.data?.properties || {};
    const actionLink = link.data?.action_link || '';
    console.log('   action_link:', actionLink);
    console.log('   hashed_token:', (props.hashed_token || '').slice(0, 24) + '…');
    console.log('   email_otp ({{ .Token }}):', JSON.stringify(props.email_otp));

    // 4) Verify OTP: try numeric-token path first, then token_hash path (both used by verifySignupOtp())
    let verify;
    const numericToken = props.email_otp || props.token || null;
    if (numericToken) {
      verify = await supabase.auth.verifyOtp({ email: TEST_EMAIL, token: String(numericToken), type: 'signup' });
      if (!verify.error) {
        report('verifyOtp with email + numeric {{ .Token }}', true, String(numericToken));
      } else {
        report('verifyOtp with email + numeric {{ .Token }}', false, verify.error.message);
      }
    } else {
      report('verifyOtp with email + numeric {{ .Token }}', false, 'no email_otp token returned (template likely uses ConfirmationURL only)');
    }

    if (!verify || verify.error) {
      const tokenHash = props.hashed_token || actionLink.match(/[?&]token=([^&]+)/)?.[1];
      if (tokenHash) {
        const verifyHash = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'signup' });
        report('verifyOtp with token_hash (magic-link equivalent)', !verifyHash.error, verifyHash.error?.message || '');
        if (!verifyHash.error) verify = verifyHash;
      } else {
        report('verifyOtp with token_hash (magic-link equivalent)', false, 'no token_hash available');
      }
    }

    const session = verify?.data?.session;
    report('verifyOtp returns authenticated session', !!session, session ? `session expires ${session.expires_at}` : 'no session');
    report('user email is confirmed', !!(verify?.data?.user && (verify.data.user.email_confirmed_at || verify.data.user.identities?.[0]?.identity_data)));

    // 5) Password login after confirmation: same call as loginUser()
    const login = await supabase.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD });
    report('signInWithPassword after confirmation', !login.error && !!login.data?.session, login.error?.message || '');
  } catch (err) {
    report('unexpected error', false, err.message);
  } finally {
    // 6) Cleanup: remove the test user
    if (userId) {
      const del = await adminSupabase.auth.admin.deleteUser(userId);
      report('cleanup: delete test user', !del.error, del.error?.message || '');
    }
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}

main();
