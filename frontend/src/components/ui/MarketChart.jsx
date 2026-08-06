import React, { useMemo, useRef, useState } from "react";

const W = 800;
const H = 320;
const PAD = { l: 48, r: 16, t: 20, b: 32 };

const fmt = (v) => "₹" + v.toLocaleString("en-IN");

export default function MarketChart({ data }) {
  const [active, setActive] = useState(null);
  const [hidden, setHidden] = useState(() => new Set());
  const svgRef = useRef(null);

  const { labels, series } = data;
  const visible = series.filter((s) => !hidden.has(s.id));

  const chart = useMemo(() => {
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const step = innerW / (labels.length - 1);

    const all = visible.length ? visible.flatMap((s) => s.points) : [0, 1];
    let min = Math.min(...all);
    let max = Math.max(...all);
    const range = max - min || 1;
    min -= range * 0.08;
    max += range * 0.08;

    const x = (i) => PAD.l + i * step;
    const y = (v) => PAD.t + innerH - ((v - min) / (max - min)) * innerH;

    const seriesPaths = visible.map((s) => {
      const pts = s.points.map((v, i) => [x(i), y(v)]);
      const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
      const area = `${line} L${pts[pts.length - 1][0]},${PAD.t + innerH} L${pts[0][0]},${PAD.t + innerH} Z`;
      return { id: s.id, label: s.label, color: s.color, pts, line, area };
    });

    const ticks = Array.from({ length: 5 }, (_, i) => min + ((max - min) / 4) * i);

    return { innerW, innerH, step, x, y, seriesPaths, ticks };
  }, [labels, visible]);

  const { innerW, innerH, step, x, y, seriesPaths, ticks } = chart;

  const handleMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round((px - PAD.l) / step);
    setActive(Math.max(0, Math.min(labels.length - 1, idx)));
  };

  const toggle = (id) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const changeFor = (s) => {
    const first = s.points[0];
    const last = s.points[s.points.length - 1];
    const pct = ((last - first) / first) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  };

  const activeX = active != null ? x(active) : null;
  const tooltipLeft = activeX != null ? Math.min(86, Math.max(14, (activeX / W) * 100)) : null;

  return (
    <div className="editorial-card p-6 lg:p-8 flex flex-col gap-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {series.map((s) => {
          const isOff = hidden.has(s.id);
          const up = changeFor(s).startsWith("+");
          return (
            <button key={s.id} onClick={() => toggle(s.id)} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0 transition-opacity"
                style={{ backgroundColor: s.color, opacity: isOff ? 0.3 : 1 }}
              />
              <span className={`font-sans text-label-md font-semibold ${isOff ? "text-on-surface-variant/50 line-through" : "text-on-surface-variant"}`}>
                {s.label}
              </span>
              <span className={`font-sans text-label-sm font-bold ${isOff ? "opacity-40" : ""} ${up ? "text-emerald-700" : "text-rose-700"}`}>
                {changeFor(s)}
              </span>
            </button>
          );
        })}
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
                {t >= 1000 ? `${Math.round(t / 1000)}k` : Math.round(t)}
              </text>
            </g>
          ))}

          {/* Area fills */}
          {seriesPaths.map((sp) => (
            <path key={sp.id + "-area"} d={sp.area} fill={sp.color} opacity={0.08} />
          ))}

          {/* Lines */}
          {seriesPaths.map((sp) => (
            <path
              key={sp.id}
              d={sp.line}
              fill="none"
              stroke={sp.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {/* Crosshair */}
          {activeX != null && (
            <g>
              <line
                x1={activeX}
                x2={activeX}
                y1={PAD.t}
                y2={PAD.t + innerH}
                stroke="var(--color-outline)"
                strokeOpacity={0.6}
                strokeDasharray="4 4"
              />
              {seriesPaths.map((sp) => {
                const pt = sp.pts[active];
                return (
                  <circle key={sp.id + "-dot"} cx={pt[0]} cy={pt[1]} r={4} fill="#ffffff" stroke={sp.color} strokeWidth={2.5} />
                );
              })}
            </g>
          )}

          {/* X labels */}
          {labels.map((m, i) => (
            <text key={m} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" style={{ fill: "var(--color-outline)" }}>
              {m}
            </text>
          ))}

          {/* Last point markers */}
          {seriesPaths.map((sp) => {
            const pt = sp.pts[sp.pts.length - 1];
            return <circle key={sp.id + "-end"} cx={pt[0]} cy={pt[1]} r={3.5} fill={sp.color} />;
          })}
        </svg>

        {/* Tooltip */}
        {activeX != null && (
          <div
            className="absolute top-2 -translate-x-1/2 pointer-events-none bg-surface-container-lowest border border-outline-variant/40 shadow-lg rounded-xl px-4 py-3 z-10 w-max"
            style={{ left: `${tooltipLeft}%` }}
          >
            <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">
              {labels[active]}
            </p>
            <ul className="flex flex-col gap-1.5">
              {seriesPaths.map((sp) => (
                <li key={sp.id} className="flex items-center gap-2 font-sans text-label-md">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sp.color }} />
                  <span className="text-on-surface-variant font-medium">{sp.label}</span>
                  <span className="text-primary font-bold ml-2">{fmt(sp.pts[active][1])}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
