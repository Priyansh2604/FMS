import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notifications as seedNotifications } from "../../data/mockData";
import { toggleTheme } from "../../theme";
import NotificationPanel from "./NotificationPanel";
import CalendarPanel from "./CalendarPanel";

export default function Header({ onMenuToggle }) {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState(null);
  const [query, setQuery] = useState("");
  const [notifications, setNotifications] = useState(seedNotifications);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));

  const unreadCount = notifications.filter((n) => n.unread).length;

  const togglePanel = (panel) => {
    setActivePanel((cur) => (cur === panel ? null : panel));
  };

  const handleThemeToggle = () => {
    setIsDark(toggleTheme());
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setActivePanel(null);
    navigate(`/transactions?q=${encodeURIComponent(q)}`);
  };

  const handleNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleNotificationReadAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <>
      <header className="flex justify-between items-center w-full px-6 lg:px-10 py-3.5 sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/30 shrink-0">
        {/* Left: Mobile menu + Search */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={onMenuToggle}
            className="btn btn-icon btn-ghost lg:hidden !h-9 !w-9"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          <h1 className="lg:hidden font-display text-xl font-semibold tracking-tight text-primary">
            Aura Finance
          </h1>

          {/* Search bar — desktop only */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center w-80 bg-surface-container-high/60 rounded-full px-4 py-2 border border-outline-variant/20 focus-within:border-primary/40 transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px]">search</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm placeholder:text-on-surface-variant/60 text-primary"
              placeholder="Search transactions, insights, assets..."
            />
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 lg:gap-2 relative">
          {/* Calendar */}
          <button
            onClick={() => togglePanel("calendar")}
            className={`btn btn-icon btn-ghost relative ${activePanel === "calendar" ? "!bg-surface-container-high !text-primary" : ""}`}
            aria-label="Calendar"
          >
            <span className="material-symbols-outlined text-[22px]">calendar_month</span>
          </button>

          {/* Notifications */}
          <button
            onClick={() => togglePanel("notifications")}
            className={`btn btn-icon btn-ghost relative ${activePanel === "notifications" ? "!bg-surface-container-high !text-primary" : ""}`}
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={handleThemeToggle}
            className="btn btn-icon btn-ghost"
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>

          {/* Panels */}
          {activePanel && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setActivePanel(null)}
              />
              <div
                className="absolute right-0 top-full mt-2 z-50 origin-top-right animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                {activePanel === "notifications" && (
                  <NotificationPanel
                    notifications={notifications}
                    onRead={handleNotificationRead}
                    onReadAll={handleNotificationReadAll}
                  />
                )}
                {activePanel === "calendar" && <CalendarPanel />}
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
}
