import React, { useMemo, useRef, useState } from "react";

const W = 800;
const H = 360;
const PAD = { l: 48, r: 16, t: 20, b: 36 };

const UP = "#059669";
const DOWN = "#e11d48";

const fmt = (v) => "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function CandleChart({ data }) {
  const [active, setActive] = useState(null);
  const svgRef = useRef(null);

  const { symbol, name, candles } = data;

  const chart = useMemo(() => {
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const step = innerW / candles.length;
    const half = Math.max(4, step * 0.18);

    const min = Math.min(...candles.map((c) => c.l));
    const max = Math.max(...candles.map((c) => c.h));
    const range = max - min || 1;
    const lo = min - range * 0.05;
    const hi = max + range * 0.05;

    const x = (i) => PAD.l + step * i + step / 2;
    const y = (v) => PAD.t + innerH - ((v - lo) / (hi - lo)) * innerH;

    const boxes = candles.map((c, i) => ({
      ...c,
      i,
      up: c.c >= c.o,
      x: x(i),
      wickTop: y(c.h),
      wickBot: y(c.l),
      bodyTop: y(Math.max(c.o, c.c)),
      bodyBot: y(Math.min(c.o, c.c)),
    }));

    const ticks = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) / 4) * i);

    return { innerH, step, half, x, y, boxes, ticks };
  }, [candles]);

  const { innerH, step, half, x, y, boxes, ticks } = chart;

  const handleMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.floor((px - PAD.l) / step);
    setActive(Math.max(0, Math.min(candles.length - 1, idx)));
  };

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const dayChange = ((last.c - prev.c) / prev.c) * 100;

  const activeCandle = active != null ? boxes[active] : null;
  const tooltipLeft = activeCandle ? Math.min(86, Math.max(14, (activeCandle.x / W) * 100)) : null;

  return (
    <div className="editorial-card p-6 lg:p-8 flex flex-col gap-6">
      {/* Symbol header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-11 h-11 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0">
            <span className="material-symbols-outlined text-[22px]">candlestick_chart</span>
          </div>
          <div className="min-w-0">
            <p className="font-sans text-body-md text-primary font-bold truncate">
              {symbol} · {name}
            </p>
            <p className="font-sans text-label-sm text-on-surface-variant">Daily OHLC · {candles.length} sessions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display text-headline-md text-primary font-semibold">{fmt(last.c)}</span>
          <span className={`font-sans text-label-sm font-bold ${dayChange >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {dayChange >= 0 ? "+" : ""}
            {dayChange.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block"
          onMouseMove={handleMove}
          onMouseLeave={() => setActive(null)}
        >
          {/* Gridlines + Y labels */}
          {ticks.map((t, i) => (
            <g key={i}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--color-outline-variant)"
                strokeOpacity={0.5}
                strokeDasharray="4 4"
              />
              <text x={PAD.l - 10} y={y(t) + 4} textAnchor="end" fontSize="11" style={{ fill: "var(--color-outline)" }}>
                ₹{Math.round(t)}
              </text>
            </g>
          ))}

          {/* Candles */}
          {boxes.map((b) => (
            <g key={b.i}>
              <line x1={b.x} x2={b.x} y1={b.wickTop} y2={b.wickBot} stroke={b.up ? UP : DOWN} strokeWidth={1.5} />
              <rect
                x={b.x - half}
                y={b.bodyTop}
                width={half * 2}
                height={Math.max(1, b.bodyBot - b.bodyTop)}
                rx={1.5}
                fill={b.up ? UP : DOWN}
              />
            </g>
          ))}

          {/* Crosshair */}
          {activeCandle && (
            <line
              x1={activeCandle.x}
              x2={activeCandle.x}
              y1={PAD.t}
              y2={PAD.t + innerH}
              stroke="var(--color-outline)"
              strokeOpacity={0.6}
              strokeDasharray="4 4"
            />
          )}

          {/* X labels */}
          {candles.map((c, i) =>
            i % 2 === 0 || i === candles.length - 1 ? (
              <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fontSize="10" style={{ fill: "var(--color-outline)" }}>
                {c.day}
              </text>
            ) : null
          )}
        </svg>

        {/* Tooltip */}
        {activeCandle && (
          <div
            className="absolute top-2 -translate-x-1/2 pointer-events-none bg-surface-container-lowest border border-outline-variant/40 shadow-lg rounded-xl px-4 py-3 z-10 w-max"
            style={{ left: `${tooltipLeft}%` }}
          >
            <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">
              {activeCandle.day}
            </p>
            <ul className="flex flex-col gap-1 font-sans text-label-md">
              <li className="flex justify-between gap-6">
                <span className="text-on-surface-variant">Open</span>
                <span className="text-primary font-bold">{fmt(activeCandle.o)}</span>
              </li>
              <li className="flex justify-between gap-6">
                <span className="text-on-surface-variant">High</span>
                <span className="text-emerald-700 font-bold">{fmt(activeCandle.h)}</span>
              </li>
              <li className="flex justify-between gap-6">
                <span className="text-on-surface-variant">Low</span>
                <span className="text-rose-700 font-bold">{fmt(activeCandle.l)}</span>
              </li>
              <li className="flex justify-between gap-6">
                <span className="text-on-surface-variant">Close</span>
                <span className="text-primary font-bold">{fmt(activeCandle.c)}</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
