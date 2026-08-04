import React from "react";

export default function SpendingChart() {
  const chartData = [
    { month: "May", earnings: "60%", spending: "45%" },
    { month: "Jun", earnings: "75%", spending: "50%" },
    { month: "Jul", earnings: "65%", spending: "80%" },
    { month: "Aug", earnings: "85%", spending: "60%" },
    { month: "Sep", earnings: "90%", spending: "70%" },
    { month: "Oct", earnings: "100%", spending: "40%", isCurrent: true }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end border-b border-surface-variant pb-4 select-none">
        <h2 className="font-display text-headline-lg text-primary font-light">Spending vs Earning</h2>
        <div className="flex gap-4 font-sans text-label-sm font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <span className="text-on-surface-variant">Earnings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span className="text-on-surface-variant">Spending</span>
          </div>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between gap-4 pt-4 select-none">
        {chartData.map((item) => (
          <div key={item.month} className="flex flex-col items-center gap-3 flex-1">
            <div className="flex items-end gap-1.5 w-full h-48 justify-center group relative">
              {/* Earnings Bar */}
              <div
                className="w-full max-w-[24px] bg-amber-400 rounded-t-sm transition-all duration-300 group-hover:opacity-85 shadow-sm"
                style={{ height: item.earnings }}
                title={`Earnings: ${item.earnings}`}
              />
              {/* Spending Bar */}
              <div
                className="w-full max-w-[24px] bg-rose-500 rounded-t-sm transition-all duration-300 group-hover:opacity-85 shadow-sm"
                style={{ height: item.spending }}
                title={`Spending: ${item.spending}`}
              />
            </div>
            <span className={`font-sans text-label-sm ${
              item.isCurrent ? "text-primary font-bold" : "text-on-surface-variant"
            }`}>
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
