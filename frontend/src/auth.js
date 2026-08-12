import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars not set. Auth will not work.');
}

const SESSION_KEY = 'aura_user';
const DEFAULT_AVATAR = 'https://i.pravatar.cc/160?img=12';

const PendingStore = {
  set: (email) => {
    try { sessionStorage.setItem('aura_pending_email', email); } catch {}
  },
  get: () => {
    try { return sessionStorage.getItem('aura_pending_email') || ''; } catch { return ''; }
  },
  clear: () => {
    try { sessionStorage.removeItem('aura_pending_email'); } catch {}
  }
};

// Try to sync session from another origin (usually backend at :5000)
export function syncSessionFromHost(host = "http://localhost:5000", timeoutMs = 2000) {
  return new Promise((resolve) => {
    try {
      if (localStorage.getItem(SESSION_KEY)) return resolve(true);

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = host + '/session-sync.html';

      const timer = setTimeout(() => {
        cleanup();
        resolve(false);
      }, timeoutMs);

      function cleanup() {
        clearTimeout(timer);
        window.removeEventListener('message', onMessage);
        try { document.body.removeChild(iframe); } catch {}
      }

      function onMessage(e) {
        if (e.origin !== host) return;
        const data = e.data || {};
        if (data && data.type === 'AURA_SESSION') {
          try {
            if (data.session) {
              localStorage.setItem(SESSION_KEY, JSON.stringify(data.session));
            }
          } catch (err) {}
          cleanup();
          resolve(!!data.session);
        }
      }

      window.addEventListener('message', onMessage, false);
      document.body.appendChild(iframe);
    } catch (err) {
      resolve(false);
    }
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function setSession(user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      email: user.email,
      tier: user.user_metadata?.tier || 'Free Member',
      avatar: user.user_metadata?.avatar_url || DEFAULT_AVATAR,
      currency: user.user_metadata?.currency || 'INR',
      isDemo: false,
      id: user.id
    })
  );
}

export async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password
  });

  if (error) {
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('not confirmed') || msg.includes('confirm your email')) {
      PendingStore.set(normalizedEmail);
      return { ok: false, needsVerification: true, email: normalizedEmail, error: error.message };
    }
    return { ok: false, error: error.message };
  }

  if (data.user) {
    setSession(data.user);
    return { ok: true, user: data.user };
  }

  return { ok: false, error: 'Login failed. Please try again.' };
}

export async function registerUser({ name, email, password, currency = 'INR' }) {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        full_name: name.trim(),
        tier: 'Free Member',
        currency,
        avatar_url: DEFAULT_AVATAR
      }
    }
  });

  if (error) {
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('already registered') || msg.includes('already been registered')) {
      return { ok: false, alreadyRegistered: true, error: error.message };
    }
    return { ok: false, error: error.message };
  }

  // No session returned => email confirmation (OTP) required before sign-in.
  if (data.user && !data.session) {
    PendingStore.set(normalizedEmail);
    return { ok: true, pending: true, email: normalizedEmail };
  }

  if (data.session) {
    setSession(data.user);
    return { ok: true, user: data.user };
  }

  return { ok: false, error: 'Registration failed. Please try again.' };
}

export async function verifySignupOtp(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'signup'
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (data.user) {
    setSession(data.user);
    PendingStore.clear();
    return { ok: true, user: data.user };
  }

  return { ok: false, error: 'Verification failed. Please try again.' };
}

export async function resendSignupOtp(email) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim().toLowerCase()
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function updateCurrentUserAvatar(avatar) {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const updatedUser = {
    ...currentUser,
    avatar
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));

  try {
    window.dispatchEvent(new CustomEvent('aura:session-changed', { detail: updatedUser }));
  } catch (e) {}

  return updatedUser;
}

export function updateCurrentUserCurrency(currency) {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const updatedUser = {
    ...currentUser,
    currency
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
  } catch {}

  try {
    window.dispatchEvent(new CustomEvent('aura:session-changed', { detail: updatedUser }));
  } catch (e) {}

  return updatedUser;
}

export async function signOut() {
  await supabase.auth.signOut();
  localStorage.removeItem(SESSION_KEY);
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/reset-password`
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function initializeAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    setSession(session.user);
  }
}
