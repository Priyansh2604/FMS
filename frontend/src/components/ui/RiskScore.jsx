import React from "react";

export default function RiskScore({ score }) {
  const isLow = score < 45;
  const isHigh = score > 70;
  const bar = isLow ? "bg-emerald-500" : isHigh ? "bg-rose-500" : "bg-amber-400";
  const label = isLow ? "Low Risk" : isHigh ? "High Risk" : "Moderate";
  const text = isLow ? "text-emerald-700" : isHigh ? "text-rose-700" : "text-amber-600";

  return (
    <div className="flex items-center gap-3">
      <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`font-sans text-label-sm font-bold ${text}`}>{label}</span>
    </div>
  );
}
