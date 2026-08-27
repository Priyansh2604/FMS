import React, { useEffect, useState, useCallback } from "react";
import { getQuotes } from "../../services/marketApi";
import { fmtCompact, fmtChange, fmtPct, changeColor, changeArrow, changeSign } from "../../utils/marketFormat";

const WATCHLIST_SYMBOLS = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", sector: "Energy" },
  { symbol: "TCS.NS", name: "Tata Consultancy", sector: "IT" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", sector: "Banking" },
  { symbol: "INFY.NS", name: "Infosys", sector: "IT" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", sector: "Banking" },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel", sector: "Telecom" },
  { symbol: "SBIN.NS", name: "State Bank of India", sector: "Banking" },
  { symbol: "ITC.NS", name: "ITC Limited", sector: "FMCG" },
  { symbol: "LT.NS", name: "Larsen & Toubro", sector: "Infra" },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance", sector: "Finance" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors", sector: "Auto" },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharma", sector: "Pharma" },
];

const sectorColors = {
  IT: "bg-blue-500/10 text-blue-700",
  Banking: "bg-violet-500/10 text-violet-700",
  Energy: "bg-amber-500/10 text-amber-700",
  Telecom: "bg-cyan-500/10 text-cyan-700",
  FMCG: "bg-pink-500/10 text-pink-700",
  Finance: "bg-emerald-500/10 text-emerald-700",
  Auto: "bg-orange-500/10 text-orange-700",
  Pharma: "bg-teal-500/10 text-teal-700",
  Infra: "bg-slate-500/10 text-slate-700",
};

export default function WatchlistPanel({ onSelectStock, currency = "INR" }) {
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchQuotes = useCallback(async () => {
    try {
      const symbols = WATCHLIST_SYMBOLS.map((s) => s.symbol);
      const data = await getQuotes(symbols);
      const map = {};
      (Array.isArray(data) ? data : [data]).forEach((q) => {
        if (q && q.symbol) map[q.symbol] = q;
      });
      setQuotes(map);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 25000);
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px] text-primary">visibility</span>
          <h3 className="font-sans text-headline-sm text-primary font-semibold">Watchlist</h3>
          <span className="font-mono text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md">
            {WATCHLIST_SYMBOLS.length} stocks
          </span>
        </div>
        <button onClick={fetchQuotes} className="btn btn-ghost btn-sm" title="Refresh">
          <span className="material-symbols-outlined text-[18px]">refresh</span>
        </button>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-12 gap-4 px-5 py-2.5 bg-surface-container-low/50 border-b border-outline-variant/10">
        <div className="col-span-4 font-sans text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">Stock</div>
        <div className="col-span-2 font-sans text-label-sm text-on-surface-variant font-medium uppercase tracking-wider text-right">Price</div>
        <div className="col-span-2 font-sans text-label-sm text-on-surface-variant font-medium uppercase tracking-wider text-right">Change</div>
        <div className="col-span-2 font-sans text-label-sm text-on-surface-variant font-medium uppercase tracking-wider text-right">%</div>
        <div className="col-span-2 font-sans text-label-sm text-on-surface-variant font-medium uppercase tracking-wider text-right">Vol</div>
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {loading ? (
          WATCHLIST_SYMBOLS.map((s, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-outline-variant/10 animate-pulse">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-variant" />
                <div className="flex flex-col gap-1">
                  <div className="h-3 bg-surface-variant rounded w-24" />
                  <div className="h-2.5 bg-surface-variant rounded w-16" />
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-end"><div className="h-3 bg-surface-variant rounded w-16" /></div>
              <div className="col-span-2 flex items-center justify-end"><div className="h-3 bg-surface-variant rounded w-12" /></div>
              <div className="col-span-2 flex items-center justify-end"><div className="h-3 bg-surface-variant rounded w-14" /></div>
              <div className="col-span-2 flex items-center justify-end"><div className="h-3 bg-surface-variant rounded w-10" /></div>
            </div>
          ))
        ) : (
          WATCHLIST_SYMBOLS.map((stock) => {
            const q = quotes[stock.symbol];
            const isUp = q ? q.change >= 0 : true;
            const color = changeColor(isUp);
            const initials = stock.name.slice(0, 2).toUpperCase();

            return (
              <button
                key={stock.symbol}
                onClick={() => onSelectStock({ symbol: stock.symbol, name: stock.name, exchange: "NSE" })}
                className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-outline-variant/10 hover:bg-surface-container-high/50 transition-colors text-left w-full group"
              >
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                    <span className="font-mono text-label-sm text-on-surface-variant font-bold">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-sans text-body-md text-primary font-semibold truncate">{stock.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-label-sm text-on-surface-variant">{stock.symbol.replace(".NS", "")}</span>
                      <span className={`font-sans text-label-sm font-medium px-1.5 py-0 rounded ${sectorColors[stock.sector] || "bg-surface-container-high text-on-surface-variant"}`}>
                        {stock.sector}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  <span className="font-mono text-body-md text-primary font-bold">
                    {q ? fmtCompact(q.price, currency) : "—"}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  <span className={`font-mono text-body-md font-bold ${color}`}>
                    {q ? `${changeSign(q.change)}${fmtCompact(q.change, currency)}` : "—"}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  {q ? (
                    <span className={`inline-flex items-center gap-1 font-mono text-label-sm font-bold ${color} ${isUp ? "bg-emerald-500/10" : "bg-rose-500/10"} px-2 py-1 rounded-lg`}>
                      <span className="text-[10px]">{changeArrow(isUp)}</span>
                      {fmtPct(q.changePercent)}
                    </span>
                  ) : "—"}
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  <span className="font-mono text-label-sm text-on-surface-variant">
                    {q ? (q.volume >= 10000000 ? (q.volume / 10000000).toFixed(1) + "Cr" : q.volume >= 100000 ? (q.volume / 100000).toFixed(1) + "L" : q.volume >= 1000 ? (q.volume / 1000).toFixed(0) + "K" : q.volume?.toLocaleString("en-IN") || "—") : "—"}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-surface-container-low/30 flex items-center justify-between">
        <span className="font-sans text-label-sm text-on-surface-variant/50">Auto-refreshes every 25s</span>
        <span className="font-sans text-label-sm text-on-surface-variant/50">Data by Yahoo Finance</span>
      </div>
    </div>
  );
}
