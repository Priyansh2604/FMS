import React from "react";

export default function InstrumentCard({ instrument }) {
  const riskColor = instrument.riskLabel === "Low" ? "text-emerald-700" : "text-amber-600";

  return (
    <div className="editorial-card p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0">
          <span className="material-symbols-outlined text-[20px]">{instrument.icon}</span>
        </div>
        <div className="min-w-0">
          <p className="font-sans text-body-md text-primary font-bold truncate">{instrument.name}</p>
          <p className={`font-sans text-label-sm font-semibold ${riskColor}`}>{instrument.riskLabel} risk</p>
        </div>
      </div>

      <p className="font-sans text-body-md text-on-surface-variant leading-relaxed flex-1">
        {instrument.description}
      </p>

      <div className="border-t border-outline-variant/20 pt-4 flex flex-col gap-2 font-sans text-label-sm">
        <div className="flex justify-between gap-4">
          <span className="text-on-surface-variant">Returns</span>
          <span className="text-primary font-semibold text-right">{instrument.returns}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-on-surface-variant">Min. Amount</span>
          <span className="text-primary font-semibold text-right">{instrument.minAmount}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-on-surface-variant">Lock-in</span>
          <span className="text-primary font-semibold text-right">{instrument.lockIn}</span>
        </div>
      </div>

      <button className="btn btn-outline btn-sm self-start mt-1">Explore</button>
    </div>
  );
}
