const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const { cache, QUOTE_TTL, INDEX_TTL, HISTORY_TTL, SEARCH_TTL } = require('../utils/cache');
const { toYahooSymbol, INDEX_SYMBOLS } = require('../utils/symbolMapper');

const PERIOD_MAP = {
  '1d': { range: '1d', interval: '5m' },
  '5d': { range: '5d', interval: '15m' },
  '1mo': { range: '1mo', interval: '1d' },
  '3mo': { range: '3mo', interval: '1d' },
  '6mo': { range: '6mo', interval: '1d' },
  '1y': { range: '1y', interval: '1d' },
  '5y': { range: '5y', interval: '1wk' },
};

function normalizeQuote(data) {
  if (!data) return null;
  return {
    symbol: data.symbol || '',
    name: data.shortName || data.longName || data.symbol || '',
    price: data.regularMarketPrice ?? 0,
    currency: data.currency || 'INR',
    change: data.regularMarketChange ?? 0,
    changePercent: data.regularMarketChangePercent ?? 0,
    open: data.regularMarketOpen ?? 0,
    previousClose: data.regularMarketPreviousClose ?? 0,
    dayHigh: data.regularMarketDayHigh ?? 0,
    dayLow: data.regularMarketDayLow ?? 0,
    fiftyTwoWeekHigh: data.fiftyTwoWeekHigh ?? 0,
    fiftyTwoWeekLow: data.fiftyTwoWeekLow ?? 0,
    volume: data.regularMarketVolume ?? 0,
    marketCap: data.marketCap ?? 0,
    timestamp: data.regularMarketTime
      ? new Date(data.regularMarketTime * 1000).toISOString()
      : new Date().toISOString(),
  };
}

async function getQuote(symbol) {
  const yahooSymbol = toYahooSymbol(symbol);
  const cacheKey = `quote:${yahooSymbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const data = await yahooFinance.quote(yahooSymbol);
    const normalized = normalizeQuote(data);
    if (normalized) cache.set(cacheKey, normalized, QUOTE_TTL);
    return normalized;
  } catch (err) {
    if (err.message?.includes('Not Found') || err.message?.includes('Invalid')) return null;
    throw err;
  }
}

async function getMultipleQuotes(symbols) {
  const yahooSymbols = symbols.map((s) => toYahooSymbol(s));
  const results = [];

  const uncached = [];
  const cachedResults = [];

  for (const sym of yahooSymbols) {
    const cacheKey = `quote:${sym}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      cachedResults.push(cached);
    } else {
      uncached.push(sym);
    }
  }

  if (uncached.length > 0) {
    try {
      const data = await yahooFinance.quote(uncached);
      const arr = Array.isArray(data) ? data : [data];
      for (const item of arr) {
        const normalized = normalizeQuote(item);
        if (normalized) {
          cache.set(`quote:${normalized.symbol}`, normalized, QUOTE_TTL);
          cachedResults.push(normalized);
        }
      }
    } catch (err) {
      // yahoo-finance2 may not support bulk quote reliably; fetch individually
      for (const sym of uncached) {
        try {
          const data = await yahooFinance.quote(sym);
          const normalized = normalizeQuote(data);
          if (normalized) {
            cache.set(`quote:${sym}`, normalized, QUOTE_TTL);
            cachedResults.push(normalized);
          }
        } catch {
          // skip failed symbols
        }
      }
    }
  }

  return cachedResults;
}

async function getHistoricalData(symbol, period = '1mo') {
  const yahooSymbol = toYahooSymbol(symbol);
  const cacheKey = `history:${yahooSymbol}:${period}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const periodConfig = PERIOD_MAP[period] || PERIOD_MAP['1mo'];

  try {
    const result = await yahooFinance.chart(yahooSymbol, {
      period1: getStartDate(period),
      interval: periodConfig.interval,
    });

    const quotes = result?.quotes || [];
    const history = quotes
      .filter((q) => q.close != null)
      .map((q) => ({
        date: q.date instanceof Date ? q.date.toISOString() : String(q.date),
        open: q.open ?? 0,
        high: q.high ?? 0,
        low: q.low ?? 0,
        close: q.close ?? 0,
        volume: q.volume ?? 0,
      }));

    cache.set(cacheKey, history, HISTORY_TTL);
    return history;
  } catch (err) {
    if (err.message?.includes('Not Found') || err.message?.includes('Invalid')) return [];
    throw err;
  }
}

function getStartDate(period) {
  const now = new Date();
  switch (period) {
    case '1d': return new Date(now - 1 * 24 * 60 * 60 * 1000);
    case '5d': return new Date(now - 5 * 24 * 60 * 60 * 1000);
    case '1mo': return new Date(now - 30 * 24 * 60 * 60 * 1000);
    case '3mo': return new Date(now - 90 * 24 * 60 * 60 * 1000);
    case '6mo': return new Date(now - 180 * 24 * 60 * 60 * 1000);
    case '1y': return new Date(now - 365 * 24 * 60 * 60 * 1000);
    case '5y': return new Date(now - 5 * 365 * 24 * 60 * 60 * 1000);
    default: return new Date(now - 30 * 24 * 60 * 60 * 1000);
  }
}

async function getMarketIndices() {
  const cacheKey = 'indices:all';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const indexList = Object.values(INDEX_SYMBOLS);
  const results = [];

  for (const idx of indexList) {
    try {
      const data = await yahooFinance.quote(idx.yahoo);
      const normalized = normalizeQuote(data);
      if (normalized) results.push(normalized);
    } catch {
      results.push({
        symbol: idx.yahoo,
        name: idx.name,
        price: 0,
        currency: 'INR',
        change: 0,
        changePercent: 0,
        open: 0,
        previousClose: 0,
        dayHigh: 0,
        dayLow: 0,
        fiftyTwoWeekHigh: 0,
        fiftyTwoWeekLow: 0,
        volume: 0,
        marketCap: 0,
        timestamp: new Date().toISOString(),
      });
    }
  }

  cache.set(cacheKey, results, INDEX_TTL);
  return results;
}

async function searchStocks(query) {
  if (!query || query.trim().length < 1) return [];

  const cacheKey = `search:${query.toLowerCase().trim()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const results = [];

  try {
    const searchResult = await yahooFinance.search(query, { quotesCount: 10 });
    const quotes = searchResult?.quotes || [];
    for (const q of quotes) {
      if (q.symbol && (q.exchange === 'NSI' || q.exchange === 'BSE' || q.exchange === 'NSE' || q.quoteType === 'EQUITY' || q.quoteType === 'INDEX')) {
        results.push({
          symbol: q.symbol,
          name: q.shortname || q.longname || q.symbol,
          exchange: q.exchange || '',
          type: q.quoteType || 'Equity',
        });
      }
    }
  } catch {
    // Yahoo search may fail; fall back to local search
  }

  if (results.length === 0) {
    const { resolveSearch } = require('../utils/symbolMapper');
    const local = resolveSearch(query);
    results.push(...local);
  }

  cache.set(cacheKey, results, SEARCH_TTL);
  return results;
}

module.exports = { getQuote, getMultipleQuotes, getHistoricalData, getMarketIndices, searchStocks };
