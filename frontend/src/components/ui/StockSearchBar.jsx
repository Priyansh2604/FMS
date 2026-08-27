import React, { useState, useRef, useEffect, useCallback } from "react";
import { searchStocks } from "../../services/marketApi";

export default function StockSearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 1) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await searchStocks(q);
      setResults(data);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setFocusIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && focusIdx >= 0) {
      e.preventDefault();
      handleSelect(results[focusIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (item) => {
    setQuery(item.name || item.symbol);
    setOpen(false);
    setResults([]);
    setFocusIdx(-1);
    onSelect?.(item);
  };

  const displayResults = results.slice(0, 10);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex items-center gap-3 bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant shrink-0">search</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => displayResults.length > 0 && setOpen(true)}
          placeholder="Search stocks, indices, ETFs..."
          className="flex-1 bg-transparent font-sans text-body-md text-primary outline-none placeholder:text-on-surface-variant/40 min-w-0"
        />
        {loading && (
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant animate-spin">progress_activity</span>
        )}
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setOpen(false); inputRef.current?.focus(); }}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {open && displayResults.length > 0 && (
        <ul className="absolute z-50 mt-2 w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl max-h-80 overflow-y-auto">
          {displayResults.map((item, i) => (
            <li key={`${item.symbol}-${i}`}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  i === focusIdx ? "bg-surface-container-high" : "hover:bg-surface-container-high/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-label-sm font-bold ${
                  item.type === "Index" ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-700"
                }`}>
                  {item.symbol?.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-sans text-body-md text-primary font-semibold truncate">{item.name}</p>
                  </div>
                  <p className="font-mono text-label-sm text-on-surface-variant">{item.symbol} · {item.exchange}</p>
                </div>
                <span className={`font-sans text-label-sm font-medium px-2 py-0.5 rounded-md shrink-0 ${
                  item.type === "Index" ? "bg-primary/10 text-primary" : "bg-surface-container-high text-on-surface-variant"
                }`}>
                  {item.type}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim().length >= 1 && displayResults.length === 0 && !loading && (
        <div className="absolute z-50 mt-2 w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl px-4 py-8 text-center">
          <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40 block mb-2">search_off</span>
          <p className="font-sans text-body-md text-on-surface-variant">No results for "{query}"</p>
          <p className="font-sans text-label-sm text-on-surface-variant/60 mt-1">Try a different ticker or company name</p>
        </div>
      )}
    </div>
  );
}
