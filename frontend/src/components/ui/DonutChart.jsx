import React from "react";

export default function DonutChart() {
  const distribution = [
    { name: "Housing", value: "45%", color: "bg-red-500", colorClass: "#ef4444" },
    { name: "Food & Dining", value: "30%", color: "bg-amber-400", colorClass: "#facc15" },
    { name: "Transport", value: "25%", color: "bg-rose-400", colorClass: "#fb7185" }
  ];

  // Conic gradient string
  // Red: 0 to 45%
  // Yellow: 45 to 75%
  // Rose: 75 to 100%
  const gradientStyle = {
    background: "conic-gradient(from 0deg, #ef4444 0% 45%, #facc15 45% 75%, #fb7185 75% 100%)"
  };

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
            <span className="font-display text-[26px] text-primary font-bold">₹42.5k</span>
            <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full flex flex-col gap-3">
          {distribution.map((item) => (
            <div key={item.name} className="flex justify-between items-center font-sans text-label-md">
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${item.color}`} />
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
