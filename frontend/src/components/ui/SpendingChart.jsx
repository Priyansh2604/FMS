import React from "react";

export default function SpendingChart({ data = [] }) {
  const maxValue = Math.max(...data.flatMap((item) => [item.invested, item.valuation]), 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end border-b border-surface-variant pb-4 select-none">
        <h2 className="font-display text-headline-lg text-primary font-light">Invested vs current value</h2>
        <div className="flex gap-4 font-sans text-label-sm font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <span className="text-on-surface-variant">Invested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span className="text-on-surface-variant">Current</span>
          </div>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between gap-4 pt-4 select-none">
        {data.map((item) => (
          <div key={item.type} className="flex flex-col items-center gap-3 flex-1 min-w-0">
            <div className="flex items-end gap-1.5 w-full h-48 justify-center group relative">
              {/* Earnings Bar */}
              <div
                className="w-full max-w-[24px] bg-amber-400 rounded-t-sm transition-all duration-300 group-hover:opacity-85 shadow-sm"
                style={{ height: `${(item.invested / maxValue) * 100}%` }}
                title={`Invested: ${item.invested.toLocaleString("en-IN")}`}
              />
              {/* Spending Bar */}
              <div
                className="w-full max-w-[24px] bg-rose-500 rounded-t-sm transition-all duration-300 group-hover:opacity-85 shadow-sm"
                style={{ height: `${(item.valuation / maxValue) * 100}%` }}
                title={`Current: ${item.valuation.toLocaleString("en-IN")}`}
              />
            </div>
            <span className={`font-sans text-label-sm ${
              item.isCurrent ? "text-primary font-bold" : "text-on-surface-variant"
            }`}>
              {item.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
