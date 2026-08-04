import React from "react";

export default function TransactionRow({ merchant, category, amount, icon, accentIcon = false, isExpense = true }) {
  return (
    <div className="grid grid-cols-12 gap-4 py-4 px-4 hover:bg-surface-container/60 rounded-xl transition-colors items-center group bg-surface-container-lowest shadow-sm border border-outline-variant/15">
      <div className="col-span-5 flex items-center gap-4 min-w-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          accentIcon ? "bg-tertiary-fixed/30 text-tertiary-container" : "bg-surface-variant text-on-surface-variant"
        }`}>
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <span className="font-sans text-body-md text-primary font-medium truncate">{merchant}</span>
      </div>
      <div className="col-span-4 flex items-center">
        <span className="bg-surface-variant/80 text-on-surface-variant px-3 py-1 rounded-full font-sans text-label-sm font-medium tracking-wide">
          {category}
        </span>
      </div>
      <div className={`col-span-3 text-right font-display text-[20px] font-medium leading-none ${
        isExpense ? "text-primary" : "text-emerald-700"
      }`}>
        {amount}
      </div>
    </div>
  );
}
