import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars not set. Auth will not work.');
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