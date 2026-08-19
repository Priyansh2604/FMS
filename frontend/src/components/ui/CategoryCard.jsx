import React from "react";
import { formatCurrency } from "../../utils/currency";

export default function CategoryCard({
  type,
  valuation,
  percentage,
  trend,
  sectors,
  label,
  description,
  icon,
  bgImage,
  isDark = false,
  isLarge = false,
}) {
  const cardClasses = isDark
    ? "md:col-span-8 bg-tertiary text-on-tertiary rounded-xl p-6 md:p-8 flex flex-col justify-between h-[240px] relative overflow-hidden select-none"
    : isLarge
    ? "md:col-span-7 bg-surface border border-outline-variant/30 rounded-xl overflow-hidden group hover:border-outline-variant/50 transition-colors flex flex-col justify-between h-[320px] relative select-none"
    : type === "Equities"
    ? "md:col-span-5 bg-surface border border-outline-variant/30 rounded-xl p-6 md:p-8 flex flex-col justify-between h-[320px] hover:border-outline-variant/50 transition-colors relative overflow-hidden select-none"
    : "md:col-span-4 bg-surface border border-outline-variant/30 rounded-xl p-6 flex flex-col justify-between h-[240px] hover:border-outline-variant/50 transition-colors select-none";

  return (
    <div className={cardClasses}>
      {/* Background Image / Blur overlays */}
      {bgImage && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="w-full h-full bg-cover bg-center opacity-[0.03] grayscale group-hover:opacity-[0.07] transition-opacity duration-500"
            style={{ backgroundImage: `url('${bgImage}')` }}
            title="Real Estate Abstract"
          />
        </div>
      )}

      {isDark && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 100% 0%, #fed488 0%, transparent 50%)",
          }}
        />
      )}

      {type === "Equities" && (
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-secondary-container-accent/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Content wrapper */}
      <div className="z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start w-full">
          <h3 className={`font-sans text-headline-md font-semibold flex items-center gap-2 ${
            isDark ? "text-on-tertiary" : "text-primary"
          }`}>
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {icon}
            </span>
            {type}
          </h3>
          {percentage && (
            <span className={`font-sans text-label-sm px-2.5 py-1 rounded font-semibold ${
              isDark ? "bg-white/10 text-on-tertiary" : "bg-surface-container-high text-primary"
            }`}>
              {percentage}
            </span>
          )}
        </div>

        {/* Dynamic center layout */}
        <div className={sectors ? "my-auto" : ""}>
          {valuation && !sectors && (
            <div className="mt-4">
              {label && (
                <p className={`font-sans text-label-sm uppercase mb-1 ${
                  isDark ? "text-on-tertiary/70" : "text-on-surface-variant"
                }`}>
                  {label}
                </p>
              )}
              <p className={`font-display text-display text-primary ${
                isDark ? "text-on-tertiary" : "text-primary"
              }`}>
                {typeof valuation === 'number' ? formatCurrency(valuation) : valuation}
              </p>
            </div>
          )}

          {/* Equities list layout */}
          {sectors && (
            <div className="mt-3">
              <p className="font-display text-headline-lg text-primary mb-4">{valuation}</p>
              <div className="space-y-3.5">
                {sectors.map((sector) => (
                  <div
                    key={sector.name}
                    className="flex justify-between items-center pb-2 border-b border-outline-variant/20"
                  >
                    <span className="font-sans text-label-sm text-on-surface-variant font-medium">
                      {sector.name}
                    </span>
                    <span className="font-sans text-body-md text-primary font-semibold">
                      {sector.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bond description / simple labels */}
          {description && (
            <p className="font-sans text-label-sm text-on-surface-variant mt-2 font-medium">
              {description}
            </p>
          )}

          {/* YTD Growth badge */}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className={`material-symbols-outlined text-[18px] font-bold ${trend.startsWith("-") ? "text-rose-700" : "text-emerald-700"}`}>
                {trend.startsWith("-") ? "trending_down" : "trending_up"}
              </span>
              <span className="font-sans text-label-sm text-on-surface-variant font-semibold">
                {trend}
              </span>
            </div>
          )}
        </div>

        {/* Mutual fund specific CTA */}
        {isDark && (
          <div className="flex justify-end mt-4">
            <button className="btn btn-sm bg-secondary-container text-on-secondary-container hover:bg-secondary-container-accent hover:text-on-secondary-container-accent">
              View Holdings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
