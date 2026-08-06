import React from "react";

export default function MarketIndexCard({ name, value, change, changePct, icon, up = true }) {
  return (
    <div className="editorial-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant shrink-0">{icon}</span>
          <span className="font-sans text-label-sm text-on-surface-variant font-semibold truncate">{name}</span>
        </div>
        <span className={`material-symbols-outlined text-[20px] shrink-0 ${up ? "text-emerald-700" : "text-rose-700"}`}>
          {up ? "trending_up" : "trending_down"}
        </span>
      </div>
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <span className="font-display text-headline-md text-primary font-semibold">{value}</span>
        <span className={`font-sans text-label-sm font-bold ${up ? "text-emerald-700" : "text-rose-700"}`}>
          {up ? "+" : ""}{change} · {changePct}
        </span>
      </div>
    </div>
  );
}
