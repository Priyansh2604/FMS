import React from "react";
import RiskScore from "./RiskScore";
import { formatCurrency } from "../../utils/currency";

export default function MutualFundCard({ fund }) {
  return (
    <div className="editorial-card p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-11 h-11 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0">
            <span className="material-symbols-outlined text-[22px]">{fund.icon}</span>
          </div>
          <div className="min-w-0">
            <p className="font-sans text-body-md text-primary font-bold truncate">{fund.name}</p>
            <p className="font-sans text-label-sm text-on-surface-variant truncate">
              {fund.category} · NAV {typeof fund.nav === 'number' ? formatCurrency(fund.nav) : fund.nav}
            </p>
          </div>
        </div>
        <RiskScore score={fund.riskScore} />
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex flex-col gap-1">
          <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">SIP Amount</span>
          <span className="font-display text-headline-md text-primary font-semibold">{typeof fund.sipMonthly === 'number' ? formatCurrency(fund.sipMonthly) : fund.sipMonthly}/mo</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Expected Return</span>
          <span className="font-sans text-body-md text-emerald-700 font-semibold">{fund.expectedReturn}</span>
        </div>
      </div>

      <p className="font-sans text-body-md text-on-surface-variant leading-relaxed border-t border-outline-variant/20 pt-4 flex-1">
        {fund.rationale}
      </p>

      <button className="btn btn-primary btn-sm self-start">Start SIP</button>
    </div>
  );
}
