import React from "react";

export default function InsightCard({ title, description, ctaLabel, onCtaClick }) {
  return (
    <section className="editorial-card p-8 flex flex-col md:flex-row gap-8 items-center bg-tertiary-fixed/10 border-tertiary-fixed/30 relative overflow-hidden select-none">
      <div className="absolute right-0 top-0 w-64 h-64 bg-tertiary-fixed/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      
      <div className="bg-tertiary-fixed text-tertiary-container w-16 h-16 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm">
        <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          psychology
        </span>
      </div>
      
      <div className="flex flex-col gap-2 z-10 flex-1 min-w-0">
        <h3 className="font-display text-headline-sm text-primary font-semibold truncate md:normal-case">{title}</h3>
        <p className="font-sans text-body-md text-on-surface-variant max-w-lg leading-relaxed">{description}</p>
      </div>
      
      <button
        onClick={onCtaClick}
        className="z-10 bg-surface text-primary border border-outline-variant hover:border-primary/50 font-sans text-label-md px-6 py-3 rounded-full hover:bg-surface-container transition-all shadow-sm whitespace-nowrap active:scale-95 duration-150"
      >
        {ctaLabel}
      </button>
    </section>
  );
}
