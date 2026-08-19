import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, signOut } from "../../auth";

export default function Sidebar({ onCloseMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    function handler() {
      setUser(getCurrentUser());
    }
    window.addEventListener('aura:session-changed', handler);
    return () => window.removeEventListener('aura:session-changed', handler);
  }, []);

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
    { name: "Transactions", path: "/dashboard/transactions", icon: "receipt_long" },
    { name: "Investments", path: "/dashboard/invest", icon: "candlestick_chart" },
    { name: "AI Advisor", path: "/dashboard/advisor", icon: "smart_toy" },
    { name: "Reports", path: "/dashboard/reports", icon: "analytics" },
    { name: "Settings", path: "/dashboard/settings", icon: "settings" },
  ];

  return (
    <div className="flex flex-col h-full bg-surface py-6 px-4 justify-between select-none">
      <div>
        {/* Brand logo */}
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <span className="font-display font-bold text-headline-sm text-primary tracking-tight">Aura Finance</span>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3 bg-surface-container/40 p-3 rounded-xl mb-6 border border-outline-variant/10">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover border border-outline-variant/30 shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-sans text-label-md text-primary truncate">{user?.name}</span>
            <span className="font-sans text-label-sm text-on-surface-variant truncate">{user?.tier}</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onCloseMobile}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg font-sans text-label-md transition-all duration-200 ${
                  isActive
                    ? "bg-secondary-container text-on-secondary-container shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="pt-6 border-t border-outline-variant/30 flex flex-col gap-4">
        <button className="btn btn-primary btn-block">Upgrade to Pro</button>
        <div className="flex flex-col gap-1">
          <a href="#" className="btn btn-ghost btn-sm justify-start">
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
            <span>Help Center</span>
          </a>
          <button onClick={handleSignOut} className="btn btn-ghost btn-sm justify-start">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
