import React from "react";

export default function Header({ onMenuToggle }) {
  return (
    <header className="flex justify-between items-center w-full px-6 lg:px-10 py-3.5 sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/30 shrink-0">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-on-surface-variant hover:text-primary transition-colors p-1"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <h1 className="lg:hidden font-display text-xl font-semibold tracking-tight text-primary">
          Aura Finance
        </h1>

        {/* Search bar — desktop only */}
        <div className="hidden lg:flex items-center w-80 bg-surface-container-high/60 rounded-full px-4 py-2 border border-outline-variant/20 focus-within:border-primary/40 transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px]">search</span>
          <input
            type="text"
            className="bg-transparent border-none outline-none w-full text-sm placeholder:text-on-surface-variant/60 text-primary"
            placeholder="Search transactions, insights, assets..."
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 lg:gap-4">
        <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-high/50">
          <span className="material-symbols-outlined text-[22px]">calendar_month</span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors relative p-2 rounded-full hover:bg-surface-container-high/50">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-high/50">
          <span className="material-symbols-outlined text-[22px]">dark_mode</span>
        </button>
        <button className="bg-primary text-on-primary text-xs font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity hidden sm:inline-block shadow-sm">
          Upgrade to Pro
        </button>
      </div>
    </header>
  );
}
