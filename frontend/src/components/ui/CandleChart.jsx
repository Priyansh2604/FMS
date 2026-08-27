import React, { useMemo, useRef, useState } from "react";
import { fmtCompact, fmtPct, changeColor, changeSign } from "../../utils/marketFormat";

const W = 900;
const H = 360;
const PAD = { l: 60, r: 20, t: 16, b: 36 };

const UP_COLOR = "#059669";
const DOWN_COLOR = "#e11d48";

export default function CandleChart({ data, currency = "INR" }) {
  const [active, setActive] = useState(null);
  const svgRef = useRef(null);

  const { symbol, name, candles } = data;

  const chart = useMemo(() => {
    if (!candles || candles.length === 0) return null;
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const step = innerW / candles.length;
    const half = Math.max(3, Math.min(step * 0.3, 10));

    const allPrices = candles.flatMap((c) => [c.h, c.l]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const range = max - min || 1;
    const lo = min - range * 0.05;
    const hi = max + range * 0.05;

    const x = (i) => PAD.l + step * i + step / 2;
    const y = (v) => PAD.t + innerH - ((v - lo) / (hi - lo)) * innerH;

    const boxes = candles.map((c, i) => ({
      ...c, i, up: c.c >= c.o,
      x: x(i),
      wickTop: y(c.h), wickBot: y(c.l),
      bodyTop: y(Math.max(c.o, c.c)),
      bodyBot: y(Math.min(c.o, c.c)),
    }));

    const tickCount = 5;
    const ticks = Array.from({ length: tickCount }, (_, i) => lo + ((hi - lo) / (tickCount - 1)) * i);

    return { innerH, step, half, x, y, boxes, ticks, lo, hi };
  }, [candles]);

  if (!chart || candles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16" style={{ minHeight: 280 }}>
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30 mb-3">candlestick_chart</span>
        <p className="font-sans text-body-md text-on-surface-variant/50">No candle data available</p>
      </div>
    );
  }

  const { innerH, step, half, x, y, boxes, ticks } = chart;

  const handleMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.floor((px - PAD.l) / step);
    setActive(Math.max(0, Math.min(candles.length - 1, idx)));
  };

  const last = candles[candles.length - 1];
  const prev = candles.length > 1 ? candles[candles.length - 2] : last;
  const dayChange = prev.c > 0 ? ((last.c - prev.c) / prev.c) * 100 : 0;
  const isUp = dayChange >= 0;

  const activeCandle = active != null ? boxes[active] : null;
  const tooltipLeft = activeCandle ? Math.min(88, Math.max(12, (activeCandle.x / W) * 100)) : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-headline-md text-primary font-bold">{fmtCompact(last.c, currency)}</span>
          <span className={`font-mono text-body-md font-bold ${changeColor(isUp)}`}>
            {changeSign(dayChange)}{dayChange.toFixed(2)}%
          </span>
          <span className="font-sans text-label-sm text-on-surface-variant/50">Today</span>
        </div>
        <span className="font-sans text-label-sm text-on-surface-variant/50">{candles.length} candles</span>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block"
          onMouseMove={handleMove} onMouseLeave={() => setActive(null)}
        >
          {/* Grid + Y labels */}
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--color-outline-variant)" strokeOpacity={0.3} strokeDasharray="3 3" />
              <text x={PAD.l - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" style={{ fill: "var(--color-outline)" }}>
                {fmtCompact(t, currency).replace(/^./, '')}
              </text>
            </g>
          ))}

          {/* Candles */}
          {boxes.map((b) => (
            <g key={b.i}>
              <line x1={b.x} x2={b.x} y1={b.wickTop} y2={b.wickBot} stroke={b.up ? UP_COLOR : DOWN_COLOR} strokeWidth={1.2} />
              <rect
                x={b.x - half} y={b.bodyTop}
                width={half * 2}
                height={Math.max(1, b.bodyBot - b.bodyTop)}
                rx={1}
                fill={b.up ? UP_COLOR : DOWN_COLOR}
              />
            </g>
          ))}

          {/* Crosshair */}
          {activeCandle && (
            <g>
              <line x1={activeCandle.x} x2={activeCandle.x} y1={PAD.t} y2={PAD.t + innerH} stroke="var(--color-outline)" strokeOpacity={0.4} strokeDasharray="3 3" />
              <line x1={PAD.l} x2={W - PAD.r} y1={activeCandle.bodyTop + (activeCandle.bodyBot - activeCandle.bodyTop) / 2} y2={activeCandle.bodyTop + (activeCandle.bodyBot - activeCandle.bodyTop) / 2} stroke="var(--color-outline)" strokeOpacity={0.3} strokeDasharray="3 3" />
            </g>
          )}

          {/* X labels */}
          {candles.map((c, i) =>
            i % Math.max(1, Math.ceil(candles.length / 8)) === 0 || i === candles.length - 1 ? (
              <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" style={{ fill: "var(--color-outline)" }}>
                {c.day}
              </text>
            ) : null
          )}
        </svg>

        {/* Tooltip */}
        {activeCandle && (
          <div className="absolute -top-2 -translate-x-1/2 pointer-events-none bg-inverse-surface shadow-xl rounded-lg px-3.5 py-2.5 z-10 w-max"
            style={{ left: `${tooltipLeft}%` }}
          >
            <p className="font-mono text-label-sm text-inverse-on-surface/60 mb-1.5">{activeCandle.day}</p>
            <div className="grid grid-cols-2 gap-x-5 gap-y-0.5 font-mono text-label-sm">
              <span className="text-inverse-on-surface/50">Open</span>
              <span className="text-inverse-on-surface font-semibold text-right">{fmtCompact(activeCandle.o, currency)}</span>
              <span className="text-inverse-on-surface/50">High</span>
              <span className="text-emerald-400 font-semibold text-right">{fmtCompact(activeCandle.h, currency)}</span>
              <span className="text-inverse-on-surface/50">Low</span>
              <span className="text-rose-400 font-semibold text-right">{fmtCompact(activeCandle.l, currency)}</span>
              <span className="text-inverse-on-surface/50">Close</span>
              <span className="text-inverse-on-surface font-semibold text-right">{fmtCompact(activeCandle.c, currency)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
