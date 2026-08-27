import React, { useMemo, useRef, useState } from "react";
import { fmtCompact, fmtPct, fmtVolume, changeColor, changeSign } from "../../utils/marketFormat";

const W = 900;
const H = 340;
const PAD = { l: 60, r: 20, t: 16, b: 32 };

export default function StockChart({ data, symbol, name, currency = "INR" }) {
  const [active, setActive] = useState(null);
  const svgRef = useRef(null);

  const chart = useMemo(() => {
    if (!data || data.length === 0) return null;

    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const step = innerW / Math.max(1, data.length - 1);

    const closes = data.map((d) => d.close);
    let min = Math.min(...closes);
    let max = Math.max(...closes);
    const range = max - min || 1;
    min -= range * 0.06;
    max += range * 0.06;

    const x = (i) => PAD.l + i * step;
    const y = (v) => PAD.t + innerH - ((v - min) / (max - min)) * innerH;

    const pts = data.map((d, i) => [x(i), y(d.close)]);
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
    const area = `${line} L${pts[pts.length - 1][0]},${PAD.t + innerH} L${pts[0][0]},${PAD.t + innerH} Z`;

    const tickCount = 5;
    const ticks = Array.from({ length: tickCount }, (_, i) => min + ((max - min) / (tickCount - 1)) * i);

    const xLabels = data.map((d, i) => {
      const dt = new Date(d.date);
      const total = data.length;
      if (total <= 7) return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      if (total <= 31) return i % Math.ceil(total / 6) === 0 ? dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";
      if (total <= 100) return i % Math.ceil(total / 5) === 0 ? dt.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }) : "";
      return i % Math.ceil(total / 5) === 0 ? dt.toLocaleDateString("en-IN", { year: "2-digit" }) : "";
    });

    const isUp = closes[closes.length - 1] >= closes[0];
    const color = isUp ? "#059669" : "#e11d48";
    const colorLight = isUp ? "rgba(5,150,105,0.08)" : "rgba(225,29,72,0.08)";

    return { innerW, innerH, step, x, y, pts, line, area, ticks, xLabels, color, colorLight, isUp, min, max };
  }, [data]);

  if (!chart || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16" style={{ minHeight: 280 }}>
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30 mb-3">show_chart</span>
        <p className="font-sans text-body-md text-on-surface-variant/50">No chart data available</p>
      </div>
    );
  }

  const { innerH, x, y, pts, line, area, ticks, xLabels, color, colorLight, min, max } = chart;

  const handleMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round((px - PAD.l) / chart.step);
    setActive(Math.max(0, Math.min(data.length - 1, idx)));
  };

  const activePt = active != null ? pts[active] : null;
  const tooltipLeft = activePt ? Math.min(88, Math.max(12, (activePt[0] / W) * 100)) : null;
  const activeItem = active != null ? data[active] : null;

  const lastPrice = data[data.length - 1].close;
  const firstPrice = data[0].close;
  const totalChange = lastPrice - firstPrice;
  const totalChangePct = (totalChange / firstPrice) * 100;
  const isUp = totalChange >= 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-headline-md text-primary font-bold">{fmtCompact(lastPrice, currency)}</span>
          <span className={`font-mono text-body-md font-bold ${changeColor(isUp)}`}>
            {changeSign(totalChange)}{fmtCompact(totalChange, currency)} ({changeSign(totalChangePct)}{totalChangePct.toFixed(2)}%)
          </span>
        </div>
        <span className="font-sans text-label-sm text-on-surface-variant/50">
          {data.length} data points
        </span>
      </div>

      {/* SVG Chart */}
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block"
          onMouseMove={handleMove}
          onMouseLeave={() => setActive(null)}
        >
          {/* Horizontal grid lines */}
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--color-outline-variant)" strokeOpacity={0.3} strokeDasharray="3 3" />
              <text x={PAD.l - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" style={{ fill: "var(--color-outline)" }}>
                {fmtCompact(t, currency)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={area} fill={colorLight} />

          {/* Line */}
          <path d={line} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />

          {/* End dot */}
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={3} fill={color} />
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={6} fill={color} opacity={0.15} />

          {/* Crosshair */}
          {activePt && (
            <g>
              <line x1={activePt[0]} x2={activePt[0]} y1={PAD.t} y2={PAD.t + innerH} stroke="var(--color-outline)" strokeOpacity={0.4} strokeDasharray="3 3" />
              <line x1={PAD.l} x2={W - PAD.r} y1={activePt[1]} y2={activePt[1]} stroke="var(--color-outline)" strokeOpacity={0.3} strokeDasharray="3 3" />
              <circle cx={activePt[0]} cy={activePt[1]} r={4} fill="#ffffff" stroke={color} strokeWidth={2} />
              <rect x={2} y={activePt[1] - 10} width={PAD.l - 8} height={20} rx={4} fill={color} />
              <text x={PAD.l / 2} y={activePt[1] + 4} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fontWeight="600" fill="#ffffff">
                {fmtCompact(data[active].close, currency)}
              </text>
            </g>
          )}

          {/* X labels */}
          {data.map((_, i) =>
            xLabels[i] ? (
              <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" style={{ fill: "var(--color-outline)" }}>
                {xLabels[i]}
              </text>
            ) : null
          )}
        </svg>

        {/* Tooltip card */}
        {activePt && activeItem && (
          <div
            className="absolute -top-2 -translate-x-1/2 pointer-events-none bg-inverse-surface border border-outline-variant/20 shadow-xl rounded-lg px-3.5 py-2.5 z-10 w-max"
            style={{ left: `${tooltipLeft}%` }}
          >
            <p className="font-mono text-label-sm text-inverse-on-surface/60 mb-1.5">
              {new Date(activeItem.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 font-mono text-label-sm">
              <span className="text-inverse-on-surface/50">O</span>
              <span className="text-inverse-on-surface/50">H</span>
              <span className="text-inverse-on-surface/50">L</span>
              <span className="text-inverse-on-surface font-semibold">{fmtCompact(activeItem.open, currency)}</span>
              <span className="text-emerald-400 font-semibold">{fmtCompact(activeItem.high, currency)}</span>
              <span className="text-rose-400 font-semibold">{fmtCompact(activeItem.low, currency)}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 font-mono text-label-sm mt-1 pt-1.5 border-t border-inverse-on-surface/10">
              <span className="text-inverse-on-surface/50">Close</span>
              <span className="text-inverse-on-surface/50">Vol</span>
              <span className="text-inverse-on-surface font-semibold">{fmtCompact(activeItem.close, currency)}</span>
              <span className="text-inverse-on-surface font-semibold">{fmtVolume(activeItem.volume)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
