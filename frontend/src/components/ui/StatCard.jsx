import React from "react";

export default function StatCard({ label, value, trend, isBordered = false, showTrendUp = false }) {
  return (
    <div className={`flex flex-col gap-2 ${isBordered ? "border-l border-outline-variant/40 pl-8" : ""}`}>
      <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest font-semibold">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <span className="font-display text-headline-lg text-primary font-medium">
          {value}
        </span>
        {trend && (
          <div className="flex items-center gap-1">
            {showTrendUp && (
              <span className="material-symbols-outlined text-tertiary text-[28px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                trending_up
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
