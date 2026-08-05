import React from "react";

export default function BudgetRing({ category, spent, total, percentage, strokeOffset, accentRing = false }) {
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 select-none">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-surface-variant stroke-current"
            cx="50"
            cy="50"
            fill="transparent"
            r="40"
            strokeWidth="8"
          />
          <circle
            className={`${
              accentRing ? "text-tertiary-fixed" : "text-primary"
            } stroke-current progress-ring__circle`}
            cx="50"
            cy="50"
            fill="transparent"
            r="40"
            strokeWidth="8"
            strokeDasharray="251.2"
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-sans text-label-md font-semibold text-primary">{percentage}%</span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-sans text-body-md text-primary font-medium">{category}</span>
        <span className="font-sans text-label-sm text-on-surface-variant">
          {spent} / {total}
        </span>
      </div>
    </div>
  );
}
