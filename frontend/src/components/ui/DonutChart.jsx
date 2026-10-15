import React from "react";
import { formatCurrency } from "../../utils/currency";

export default function DonutChart({ data = [], total = 0 }) {
  const colors = ["#ef4444", "#facc15", "#fb7185", "#14b8a6", "#3b82f6", "#a855f7", "#f97316"];
  let offset = 0;
  const distribution = data.map((item, index) => {
    const percentage = total ? (item.valuation / total) * 100 : 0;
    const result = { name: item.type, value: `${percentage.toFixed(1)}%`, colorClass: colors[index % colors.length], start: offset, end: offset + percentage };
    offset += percentage;
    return result;
  });

  // Conic gradient string
  // Red: 0 to 45%
  // Yellow: 45 to 75%
  // Rose: 75 to 100%
  const gradientStyle = { background: `conic-gradient(${distribution.map((item) => `${item.colorClass} ${item.start}% ${item.end}%`).join(", ")})` };

  return (
    <div className="editorial-card p-8 flex flex-col gap-6 select-none">
      <h3 className="font-sans text-headline-sm text-primary font-semibold">Expense Distribution</h3>
      
      <div className="flex flex-col items-center gap-8 py-4">
        {/* Conic donut wrapper */}
        <div
          className="relative w-48 h-48 rounded-full shadow-md flex items-center justify-center transition-transform hover:scale-[1.02] duration-300"
          style={gradientStyle}
        >
          {/* Inner cutout for donut shape */}
          <div className="absolute inset-0 m-auto w-32 h-32 bg-surface-container-lowest rounded-full flex flex-col items-center justify-center shadow-inner">
            <span className="font-display text-[22px] text-primary font-bold">{formatCurrency(total)}</span>
            <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full flex flex-col gap-3">
          {distribution.map((item) => (
            <div key={item.name} className="flex justify-between items-center font-sans text-label-md">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.colorClass }} />
                <span className="text-on-surface-variant font-medium">{item.name}</span>
              </div>
              <span className="text-primary font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
