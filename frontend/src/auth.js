const USERS_KEY = "aura_users";
const SESSION_KEY = "aura_user";

export const DEMO_CREDENTIALS = {
  email: "ppriyansh790@gmail.com",
  password: "admin123"
};

const DEFAULT_AVATAR = "https://i.pravatar.cc/160?img=12";

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function setSession(user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      name: user.name,
      email: user.email,
      tier: user.tier || "Free Member",
      avatar: user.avatar || DEFAULT_AVATAR,
      currency: user.currency || "INR",
      isDemo: !!user.isDemo
    })
  );
}

export function loginUser(email, password) {
  const cleanEmail = (email || "").trim().toLowerCase();

  if (cleanEmail === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
    const user = {
      name: "Priyansh",
      email: DEMO_CREDENTIALS.email,
      tier: "Premium Member",
      avatar: DEFAULT_AVATAR,
      isDemo: true
    };
    setSession(user);
    return { ok: true, user };
  }

  const found = readUsers().find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === password
  );
  if (found) {
    const user = {
      name: found.name,
      email: found.email,
      tier: found.tier || "Free Member",
      avatar: found.avatar || DEFAULT_AVATAR,
      currency: found.currency || "INR"
    };
    setSession(user);
    return { ok: true, user };
  }

  return { ok: false, error: "Invalid email or password. Try the demo account below." };
}

export function registerUser({ name, email, password, currency = "INR" }) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const users = readUsers();

  if (cleanEmail === DEMO_CREDENTIALS.email) {
    return { ok: false, error: "That email is reserved for the demo account. Use a different one." };
  }
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { ok: false, error: "An account with this email already exists. Sign in instead." };
  }

  const user = { name: name.trim(), email: cleanEmail, password, currency, tier: "Free Member" };
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  setSession(user);
  return { ok: true, user };
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}
