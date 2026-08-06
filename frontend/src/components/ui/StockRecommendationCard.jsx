import React from "react";
import RiskScore from "./RiskScore";

export default function StockRecommendationCard({ stock }) {
  const up = stock.changePct.startsWith("+");

  return (
    <div className="editorial-card p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-11 h-11 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0">
            <span className="material-symbols-outlined text-[22px]">{stock.icon}</span>
          </div>
          <div className="min-w-0">
            <p className="font-sans text-body-md text-primary font-bold truncate">{stock.name}</p>
            <p className="font-sans text-label-sm text-on-surface-variant truncate">
              {stock.symbol} · {stock.sector}
            </p>
          </div>
        </div>
        <span
          className={`font-sans text-label-sm font-bold px-2.5 py-1 rounded-full ${
            up ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-700"
          }`}
        >
          {stock.changePct}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex flex-col gap-1">
          <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Price</span>
          <span className="font-display text-headline-md text-primary font-semibold">{stock.price}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Expected Return</span>
          <span className="font-sans text-body-md text-emerald-700 font-semibold">{stock.expectedReturn}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Suggested Invest</span>
          <span className="font-display text-headline-md text-primary font-semibold">{stock.allocate}</span>
        </div>
        <div className="flex flex-col gap-1 lg:ml-auto">
          <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Risk Score</span>
          <RiskScore score={stock.riskScore} />
        </div>
      </div>

      <p className="font-sans text-body-md text-on-surface-variant leading-relaxed border-t border-outline-variant/20 pt-4 flex-1">
        {stock.rationale}
      </p>

      <div className="flex gap-3 mt-auto">
        <button className="btn btn-primary btn-sm flex-1">Invest Now</button>
        <button className="btn btn-outline btn-sm flex-1">Add to Watchlist</button>
      </div>
    </div>
  );
}
