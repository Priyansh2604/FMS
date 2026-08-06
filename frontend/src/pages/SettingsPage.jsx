import React, { useState } from "react";
import { getCurrentUser } from "../auth";

export default function SettingsPage() {
  const user = getCurrentUser();
  const [darkTheme, setDarkTheme] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currency, setCurrency] = useState(user?.currency || "INR");

  return (
    <div className="px-6 lg:px-16 py-8 lg:py-12 max-w-[800px] w-full mx-auto">
      <div className="mb-12">
        <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">Preferences</p>
        <h2 className="font-display text-display text-primary tracking-tight">Settings</h2>
      </div>

      <div className="flex flex-col gap-8">
        {/* Profile Card settings */}
        <div className="editorial-card p-6 lg:p-8 flex flex-col gap-8">
          <h3 className="font-sans text-headline-sm text-primary">User Details</h3>
          <div className="flex items-center gap-6 flex-wrap border-b border-outline-variant/20 pb-8">
            <div className="w-20 h-20 rounded-full bg-primary overflow-hidden shadow-sm shrink-0">
              <img
                src={user?.avatar || "https://i.pravatar.cc/160?img=12"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-sans text-headline-md text-primary font-bold">{user?.name || "Julian Vane"}</p>
              <p className="font-sans text-body-md text-on-surface-variant mt-1">
                {user?.tier || "Premium Member"} · {user?.email || "julian@aura.finance"}
              </p>
            </div>
            <button className="btn btn-primary btn-sm sm:ml-auto mt-2 sm:mt-0">
              Change Image
            </button>
          </div>

          {/* Form Preferences */}
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-sans text-body-lg text-primary font-medium">Default Currency</p>
                <p className="font-sans text-body-md text-on-surface-variant mt-1">Select standard symbol presentation.</p>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-2.5 font-sans text-body-md text-primary outline-none focus:border-primary shadow-sm min-w-[120px]"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-sans text-body-lg text-primary font-medium">Notifications</p>
                <p className="font-sans text-body-md text-on-surface-variant mt-1">Get push alerts for unusual spending.</p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  notificationsEnabled ? "bg-primary" : "bg-outline-variant"
                }`}
              >
                <div className={`toggle-thumb ${notificationsEnabled ? "active" : ""}`} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-sans text-body-lg text-primary font-medium">Dark Theme</p>
                <p className="font-sans text-body-md text-on-surface-variant mt-1">Switch application color scheme.</p>
              </div>
              <button
                onClick={() => setDarkTheme(!darkTheme)}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  darkTheme ? "bg-primary" : "bg-outline-variant"
                }`}
              >
                <div className={`toggle-thumb ${darkTheme ? "active" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Upgrade Plan Widget */}
        <div className="editorial-card p-6 lg:p-8 bg-tertiary-fixed/10 border-tertiary-fixed/30 flex flex-col sm:flex-row sm:items-center gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-tertiary-fixed/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="z-10 flex-1 min-w-0">
            <h3 className="font-sans text-headline-sm text-primary">Security Settings</h3>
            <p className="font-sans text-body-md text-on-surface-variant mt-2">
              Configure multi-factor authentication and token security sessions.
            </p>
          </div>
          <button className="z-10 btn btn-outline shrink-0">
            Manage
          </button>
        </div>
      </div>
    </div>
  );
}
