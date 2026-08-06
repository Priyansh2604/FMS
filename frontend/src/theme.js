const THEME_KEY = "aura_theme";

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || null;
  } catch {
    return null;
  }
}

export function isDarkTheme() {
  const stored = getStoredTheme();
  if (stored) return stored === "dark";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(dark) {
  document.documentElement.classList.toggle("dark", !!dark);
}

export function initTheme() {
  applyTheme(isDarkTheme());
}

export function toggleTheme() {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.add("theme-transition");
  applyTheme(next);
  try {
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
  } catch {}
  setTimeout(() => document.documentElement.classList.remove("theme-transition"), 350);
  return next;
}
