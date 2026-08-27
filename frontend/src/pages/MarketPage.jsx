import React, { useEffect, useState, useRef, useCallback } from "react";
import { getQuote, getQuotes, getHistory, getIndices } from "../services/marketApi";
import MarketIndexCard from "../components/ui/MarketIndexCard";
import StockSearchBar from "../components/ui/StockSearchBar";
import StockChart from "../components/ui/StockChart";
import CandleChart from "../components/ui/CandleChart";
import WatchlistPanel from "../components/ui/WatchlistPanel";
import { fmtINR, fmtCompact, fmtChange, fmtPct, fmtVolume, changeColor, changeSign } from "../utils/marketFormat";

const PERIODS = [
  { label: "1D", value: "1d" },
  { label: "5D", value: "5d" },
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
];

function getMarketStatus() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000);
  const day = ist.getDay();
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const timeNum = hours * 60 + minutes;

  if (day === 0 || day === 6)
    return { status: "closed", label: "Weekend — Closed", color: "text-on-surface-variant", dot: "bg-on-surface-variant" };
  if (timeNum >= 540 && timeNum < 555)
    return { status: "pre-open", label: "Pre-Open", color: "text-amber-600", dot: "bg-amber-500" };
  if (timeNum >= 555 && timeNum < 930)
    return { status: "open", label: "Market Open", color: "text-emerald-700", dot: "bg-emerald-500" };
  if (timeNum >= 930 && timeNum < 960)
    return { status: "post-close", label: "Post-Close", color: "text-amber-600", dot: "bg-amber-500" };
  if (timeNum >= 360 && timeNum < 540) {
    const opensIn = 540 - timeNum;
    return { status: "closed", label: `Opens in ${Math.floor(opensIn / 60)}h ${opensIn % 60}m`, color: "text-on-surface-variant", dot: "bg-amber-500" };
  }
  return { status: "closed", label: "Market Closed", color: "text-on-surface-variant", dot: "bg-on-surface-variant" };
}

function toCandleData(history) {
  if (!history || history.length === 0) return null;
  return {
    symbol: "",
    name: "",
    candles: history.map((d) => ({
      day: new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      o: d.open,
      h: d.high,
      l: d.low,
      c: d.close,
    })),
  };
}

export default function MarketPage() {
  const [indices, setIndices] = useState([]);
  const [indicesLoading, setIndicesLoading] = useState(true);
  const [indicesError, setIndicesError] = useState(null);
  const [currency, setCurrency] = useState("INR");

  const [selectedStock, setSelectedStock] = useState(null);
  const [stockQuote, setStockQuote] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("1mo");
  const [chartType, setChartType] = useState("line");

  const [marketStatus, setMarketStatus] = useState(getMarketStatus);
  const indicesIntervalRef = useRef(null);
  const quoteIntervalRef = useRef(null);
  const abortRef = useRef(0);

  useEffect(() => {
    const tick = () => setMarketStatus(getMarketStatus());
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchIndices = useCallback(async () => {
    try {
      const data = await getIndices();
      setIndices(data);
      setIndicesError(null);
    } catch (err) {
      setIndicesError(err.message);
    } finally {
      setIndicesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIndices();
    indicesIntervalRef.current = setInterval(fetchIndices, 25000);
    return () => { if (indicesIntervalRef.current) clearInterval(indicesIntervalRef.current); };
  }, [fetchIndices]);

  const fetchStock = useCallback(async (symbol, period, isPolling = false) => {
    if (!symbol) return;
    const reqId = ++abortRef.current;
    if (!isPolling) { setStockLoading(true); setStockError(null); }
    try {
      const [quote, history] = await Promise.all([getQuote(symbol), getHistory(symbol, period)]);
      if (reqId !== abortRef.current) return;
      setStockQuote(quote);
      setStockHistory(history);
      setStockError(null);
    } catch (err) {
      if (reqId !== abortRef.current) return;
      setStockError(err.message);
    } finally {
      if (reqId === abortRef.current) setStockLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedStock) return;
    fetchStock(selectedStock.symbol, selectedPeriod);
    quoteIntervalRef.current = setInterval(() => fetchStock(selectedStock.symbol, selectedPeriod, true), 20000);
    return () => { if (quoteIntervalRef.current) clearInterval(quoteIntervalRef.current); };
  }, [selectedStock, selectedPeriod, fetchStock]);

  const handleSearchSelect = (item) => {
    setSelectedStock(item);
    setSelectedPeriod("1mo");
    setStockHistory([]);
    setChartType("line");
  };

  const isUp = stockQuote ? stockQuote.change >= 0 : true;
  const fmt = (v) => fmtCompact(v, currency);
  const candleData = toCandleData(stockHistory);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Ticker strip */}
      <div className="border-b border-outline-variant/30 bg-surface-container-low/50">
        <div className="flex items-center gap-6 px-6 py-2.5 overflow-x-auto scrollbar-none">
          {indicesLoading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2 shrink-0 animate-pulse">
                <div className="h-3 w-16 bg-surface-variant rounded" />
                <div className="h-3 w-12 bg-surface-variant rounded" />
              </div>
            ))
          ) : (
            indices.map((idx) => {
              const up = idx.change >= 0;
              return (
                <div key={idx.symbol} className="flex items-center gap-2 shrink-0">
                  <span className="font-sans text-label-sm text-on-surface-variant font-medium">{idx.name}</span>
                  <span className="font-mono text-label-sm text-primary font-bold">{fmtCompact(idx.price, currency)}</span>
                  <span className={`font-mono text-label-sm font-bold ${changeColor(up)}`}>
                    {up ? "+" : ""}{fmtPct(idx.changePercent)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 lg:px-10 py-6 max-w-[1440px] w-full mx-auto flex flex-col gap-5">
          {/* Top row: Search + status + currency toggle */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[280px]">
              <StockSearchBar onSelect={handleSearchSelect} />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {/* Currency toggle */}
              <div className="flex items-center bg-surface-container-high rounded-lg p-0.5">
                <button
                  onClick={() => setCurrency("INR")}
                  className={`px-3 py-1.5 rounded-md font-mono text-label-sm font-bold transition-all ${currency === "INR" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant"}`}
                >₹ INR</button>
                <button
                  onClick={() => setCurrency("USD")}
                  className={`px-3 py-1.5 rounded-md font-mono text-label-sm font-bold transition-all ${currency === "USD" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant"}`}
                >$ USD</button>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${marketStatus.dot} ${marketStatus.status === "open" ? "animate-pulse" : ""}`} />
                <span className={`font-sans text-label-sm font-medium ${marketStatus.color}`}>{marketStatus.label}</span>
              </div>
            </div>
          </div>

          {/* Index cards */}
          {indicesError ? (
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 text-center">
              <span className="material-symbols-outlined text-[28px] text-rose-600 block mb-2">cloud_off</span>
              <p className="font-sans text-body-md text-on-surface-variant mb-3">Failed to load indices: {indicesError}</p>
              <button onClick={fetchIndices} className="btn btn-outline btn-sm">Retry</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {(indicesLoading ? [1, 2, 3, 4] : indices).map((idx, i) => (
                <MarketIndexCard key={idx.symbol || i} name={idx.name || ""} value={idx.price} change={idx.change} changePct={idx.changePercent} loading={indicesLoading} up={idx.change >= 0} currency={currency} />
              ))}
            </div>
          )}

          {/* Stock detail or watchlist */}
          {selectedStock ? (
            <div className="flex flex-col gap-4 animate-fade-in">
              {stockLoading && !stockQuote ? (
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 animate-pulse">
                  <div className="h-5 bg-surface-variant rounded w-32 mb-3" />
                  <div className="h-8 bg-surface-variant rounded w-48 mb-2" />
                  <div className="h-4 bg-surface-variant rounded w-24" />
                </div>
              ) : stockError ? (
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 text-center">
                  <span className="material-symbols-outlined text-[32px] text-rose-600 block mb-2">error</span>
                  <p className="font-sans text-body-md text-on-surface-variant">{stockError}</p>
                </div>
              ) : stockQuote ? (
                <>
                  {/* Price header */}
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-6 py-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="font-sans text-headline-lg text-primary font-bold tracking-tight truncate">{stockQuote.name}</h2>
                          <span className="font-mono text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md shrink-0">{stockQuote.symbol}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-label-sm text-on-surface-variant">{stockQuote.currency || "INR"}</span>
                          <span className="text-on-surface-variant/30">·</span>
                          <span className="font-sans text-label-sm text-on-surface-variant">{stockQuote.exchange || "NSE"}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-display text-primary font-bold leading-none">{fmt(stockQuote.price)}</p>
                        {currency === "USD" && (
                          <p className="font-mono text-label-sm text-on-surface-variant mt-0.5">≈ {fmtINR(stockQuote.price)}</p>
                        )}
                        <p className={`font-mono text-body-md font-bold mt-1 ${changeColor(isUp)}`}>
                          {changeSign(stockQuote.change)}{fmtCompact(stockQuote.change, currency)} ({changeSign(stockQuote.changePercent)}{stockQuote.changePercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="flex items-center gap-6 mt-5 pt-4 border-t border-outline-variant/20 overflow-x-auto scrollbar-none">
                      <QStat label="Open" value={fmt(stockQuote.open)} />
                      <QStat label="Prev Close" value={fmt(stockQuote.previousClose)} />
                      <QStat label="Volume" value={fmtVolume(stockQuote.volume)} />
                      <QStat label="Day Low" value={fmt(stockQuote.dayLow)} color="text-rose-700" />
                      <QStat label="Day High" value={fmt(stockQuote.dayHigh)} color="text-emerald-700" />
                      <QStat label="52W Low" value={fmt(stockQuote.fiftyTwoWeekLow)} color="text-rose-700" />
                      <QStat label="52W High" value={fmt(stockQuote.fiftyTwoWeekHigh)} color="text-emerald-700" />
                      {stockQuote.marketCap > 0 && <QStat label="Mkt Cap" value={fmtCompact(stockQuote.marketCap, currency)} />}
                    </div>

                    {/* 52-week range bar */}
                    {stockQuote.fiftyTwoWeekLow > 0 && stockQuote.fiftyTwoWeekHigh > 0 && (
                      <div className="mt-4 pt-3 border-t border-outline-variant/10">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-sans text-label-sm text-on-surface-variant">52 Week Range</span>
                          <span className="font-mono text-label-sm text-on-surface-variant">
                            {fmt(stockQuote.fiftyTwoWeekLow)} — {fmt(stockQuote.fiftyTwoWeekHigh)}
                          </span>
                        </div>
                        <div className="relative h-2 bg-surface-variant rounded-full">
                          <div className="absolute h-2 bg-primary/20 rounded-full" style={{
                            left: `${Math.max(0, ((stockQuote.price - stockQuote.fiftyTwoWeekLow) / (stockQuote.fiftyTwoWeekHigh - stockQuote.fiftyTwoWeekLow)) * 100 - 2)}%`,
                            width: "4%"
                          }} />
                          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-surface-container-lowest shadow-sm" style={{
                            left: `${((stockQuote.price - stockQuote.fiftyTwoWeekLow) / (stockQuote.fiftyTwoWeekHigh - stockQuote.fiftyTwoWeekLow)) * 100}%`,
                            transform: "translate(-50%, -50%)"
                          }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chart */}
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans text-label-md text-on-surface-variant font-medium uppercase tracking-wider">Chart</h3>
                        <div className="flex items-center bg-surface-container-high rounded-lg p-0.5">
                          <button onClick={() => setChartType("line")} className={`px-2.5 py-1 rounded-md font-sans text-label-sm font-semibold transition-all ${chartType === "line" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant"}`}>
                            <span className="material-symbols-outlined text-[16px]">show_chart</span>
                          </button>
                          <button onClick={() => setChartType("candle")} className={`px-2.5 py-1 rounded-md font-sans text-label-sm font-semibold transition-all ${chartType === "candle" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant"}`}>
                            <span className="material-symbols-outlined text-[16px]">candlestick_chart</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-surface-container-high rounded-lg p-0.5">
                        {PERIODS.map((p) => (
                          <button key={p.value} onClick={() => setSelectedPeriod(p.value)}
                            className={`px-3 py-1.5 rounded-md font-mono text-label-sm font-bold transition-all ${selectedPeriod === p.value ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary"}`}
                          >{p.label}</button>
                        ))}
                      </div>
                    </div>
                    {stockLoading && stockHistory.length === 0 ? (
                      <div className="h-72 bg-surface-variant/30 rounded-xl animate-pulse" />
                    ) : chartType === "candle" && candleData ? (
                      <CandleChart data={candleData} currency={currency} />
                    ) : (
                      <StockChart data={stockHistory} symbol={stockQuote.symbol} name={stockQuote.name} currency={currency} />
                    )}
                  </div>

                  {/* Key statistics */}
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 lg:p-6">
                    <h3 className="font-sans text-label-md text-on-surface-variant font-medium uppercase tracking-wider mb-4">Key Statistics</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4">
                      <StatItem label="Open" value={fmt(stockQuote.open)} />
                      <StatItem label="Previous Close" value={fmt(stockQuote.previousClose)} />
                      <StatItem label="Day High" value={fmt(stockQuote.dayHigh)} accent="up" />
                      <StatItem label="Day Low" value={fmt(stockQuote.dayLow)} accent="down" />
                      <StatItem label="52W High" value={fmt(stockQuote.fiftyTwoWeekHigh)} accent="up" />
                      <StatItem label="52W Low" value={fmt(stockQuote.fiftyTwoWeekLow)} accent="down" />
                      <StatItem label="Volume" value={fmtVolume(stockQuote.volume)} />
                      <StatItem label="Market Cap" value={stockQuote.marketCap ? fmtCompact(stockQuote.marketCap, currency) : "—"} />
                      <StatItem label="Day Change" value={`${changeSign(stockQuote.change)}${fmtCompact(stockQuote.change, currency)}`} accent={isUp ? "up" : "down"} />
                      <StatItem label="Day Change %" value={`${changeSign(stockQuote.changePercent)}${stockQuote.changePercent.toFixed(2)}%`} accent={isUp ? "up" : "down"} />
                      <StatItem label="Currency" value={stockQuote.currency || "INR"} />
                      <StatItem label="Last Updated" value={stockQuote.timestamp ? new Date(stockQuote.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Kolkata" }) : "—"} />
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <WatchlistPanel onSelectStock={handleSearchSelect} currency={currency} />
          )}
        </div>
      </div>
    </div>
  );
}

function QStat({ label, value, color }) {
  return (
    <div className="flex flex-col gap-0.5 shrink-0">
      <span className="font-sans text-label-sm text-on-surface-variant">{label}</span>
      <span className={`font-mono text-label-md font-bold whitespace-nowrap ${color || "text-primary"}`}>{value}</span>
    </div>
  );
}

function StatItem({ label, value, accent }) {
  const colorClass = accent === "up" ? "text-emerald-700" : accent === "down" ? "text-rose-700" : "text-primary";
  return (
    <div className="flex flex-col gap-1">
      <span className="font-sans text-label-sm text-on-surface-variant">{label}</span>
      <span className={`font-mono text-body-md font-semibold ${colorClass}`}>{value}</span>
    </div>
  );
}
