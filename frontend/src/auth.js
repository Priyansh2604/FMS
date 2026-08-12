import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

<<<<<<< HEAD
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars not set. Auth will not work.');
=======
const DEFAULT_AVATAR = "https://i.pravatar.cc/160?img=12";

// Try to sync session from another origin (usually backend at :5000)
export function syncSessionFromHost(host = "http://localhost:5000", timeoutMs = 2000) {
  return new Promise((resolve) => {
    try {
      // If we already have a session, nothing to do
      if (localStorage.getItem(SESSION_KEY)) return resolve(true);

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
  }

  const DEFAULT_AVATAR = "https://i.pravatar.cc/160?img=12";
  const SESSION_KEY = 'aura_user';
  const USERS_KEY = 'aura_users';
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

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
>>>>>>> 63073b35be42bfe1b275aad2e266b051838ecd12
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SESSION_KEY = 'aura_user';
const DEFAULT_AVATAR = 'https://i.pravatar.cc/160?img=12';

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
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (data.user) {
    setSession(data.user);
    return { ok: true, user: data.user };
  }

  return { ok: false, error: 'Login failed. Please try again.' };
}

export async function registerUser({ name, email, password, currency = 'INR' }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
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
    return { ok: false, error: error.message };
  }

  if (data.user) {
    setSession(data.user);
    return { ok: true, user: data.user };
  }

  return { ok: false, error: 'Registration failed. Please try again.' };
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

<<<<<<< HEAD
export async function signOut() {
  await supabase.auth.signOut();
=======
export function updateCurrentUserAvatar(avatar) {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const updatedUser = {
    ...currentUser,
    avatar
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));

  const users = readUsers();
  const index = users.findIndex(
    (u) => u.email.toLowerCase() === (currentUser.email || "").toLowerCase()
  );

  if (index >= 0) {
    users[index] = { ...users[index], avatar };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // notify listeners that session changed
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

  const users = readUsers();
  const index = users.findIndex(
    (u) => u.email.toLowerCase() === (currentUser.email || "").toLowerCase()
  );

  if (index >= 0) {
    users[index] = { ...users[index], currency };
    try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {}
  }

  try {
    window.dispatchEvent(new CustomEvent('aura:session-changed', { detail: updatedUser }));
  } catch (e) {}

  return updatedUser;
}

export function signOut() {
>>>>>>> 63073b35be42bfe1b275aad2e266b051838ecd12
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