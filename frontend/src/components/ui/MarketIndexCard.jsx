import React from "react";
import { fmtCompact, fmtChange, fmtPct, changeColor, changeArrow, changeSign } from "../../utils/marketFormat";

export default function MarketIndexCard({ name, value, change, changePct, up = true, loading = false, currency = "INR" }) {
  if (loading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 animate-pulse">
        <div className="h-3 bg-surface-variant rounded w-20 mb-3" />
        <div className="h-6 bg-surface-variant rounded w-28 mb-2" />
        <div className="h-3 bg-surface-variant rounded w-16" />
      </div>
    );
  }

  const color = changeColor(up);
  const borderColor = up ? "border-emerald-500/20" : "border-rose-500/20";
  const bgGlow = up ? "bg-emerald-500/8" : "bg-rose-500/8";

  return (
    <div className={`bg-surface-container-lowest border rounded-xl p-4 transition-all hover:shadow-md cursor-default ${borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-sans text-label-sm text-on-surface-variant font-medium truncate">{name}</span>
        <span className={`material-symbols-outlined text-[16px] ${color}`}>
          {up ? "trending_up" : "trending_down"}
        </span>
      </div>
      <p className="font-mono text-headline-sm text-primary font-bold leading-tight">
        {fmtCompact(value, currency)}
      </p>
      <div className="flex items-center gap-2 mt-1.5">
        <span className={`inline-flex items-center gap-1 font-mono text-label-sm font-bold ${color} ${bgGlow} px-2 py-0.5 rounded-md`}>
          <span className="text-[10px]">{changeArrow(up)}</span>
          {changeSign(change)}{fmtCompact(change, currency)}
        </span>
        <span className={`font-mono text-label-sm font-bold ${color}`}>
          {fmtPct(changePct)}
        </span>
      </div>
    </div>
  );
}
