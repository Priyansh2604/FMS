import { CURRENCIES } from "./currencyOptions";

const CACHE_KEY = "aura_currency_rates_v1";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const RATE_URL = `https://api.frankfurter.dev/v2/rates?base=INR&quotes=${CURRENCIES
  .filter(({ code }) => code !== "INR")
  .map(({ code }) => code)
  .join(",")}`;
const FALLBACK_RATES = {
  INR: 1,
  USD: 0.01051,
  EUR: 0.00939,
  GBP: 0.00793,
  JPY: 1.6657,
  CAD: 0.01495,
  AUD: 0.01506,
  CHF: 0.00876,
  CNY: 0.07031,
  AED: 0.03862,
  SGD: 0.01348,
};

let rates = { ...FALLBACK_RATES };
let rateDate = null;
let cachedAt = 0;
let refreshRequest = null;

function readCachedRates() {
  if (typeof localStorage === "undefined") return null;

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (!cached || !Number.isFinite(cached.cachedAt) || typeof cached.date !== "string") return null;
    if (!CURRENCIES.every(({ code }) => Number.isFinite(cached.rates?.[code]) && cached.rates[code] > 0)) return null;
    return cached;
  } catch (error) {
    console.warn("Could not read cached currency rates:", error);
    return null;
  }
}

function applyRates(nextRates, date, updatedAt) {
  rates = nextRates;
  rateDate = date;
  cachedAt = updatedAt;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("aura:fx-updated", { detail: { date } }));
  }
}

const savedRates = readCachedRates();
if (savedRates) applyRates(savedRates.rates, savedRates.date, savedRates.cachedAt);

export function getCurrencyRate(code) {
  return rates[code] || FALLBACK_RATES[code] || 1;
}

export function getCurrencyRateDate() {
  return rateDate;
}

export async function refreshCurrencyRates() {
  if (refreshRequest) return refreshRequest;
  if (cachedAt && Date.now() - cachedAt < CACHE_TTL_MS) return;

  refreshRequest = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(RATE_URL, { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error(`Exchange-rate service returned HTTP ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data) || data.length !== CURRENCIES.length - 1) {
        throw new Error("Exchange-rate service returned an incomplete rate list");
      }

      const nextRates = { INR: 1 };
      let latestDate = "";
      for (const item of data) {
        if (
          item.base !== "INR" ||
          !CURRENCY_CODES.has(item.quote) ||
          !Number.isFinite(item.rate) ||
          item.rate <= 0 ||
          typeof item.date !== "string"
        ) {
          throw new Error("Exchange-rate service returned invalid rate data");
        }
        nextRates[item.quote] = item.rate;
        if (item.date > latestDate) latestDate = item.date;
      }

      if (!CURRENCIES.every(({ code }) => Number.isFinite(nextRates[code]) && nextRates[code] > 0)) {
        throw new Error("Exchange-rate service did not return every supported currency");
      }

      const updatedAt = Date.now();
      applyRates(nextRates, latestDate, updatedAt);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: nextRates, date: latestDate, cachedAt: updatedAt }));
      } catch (error) {
        console.warn("Could not cache the latest currency rates:", error);
      }
    } catch (error) {
      console.warn("Could not refresh currency rates; continuing with the last available rates:", error);
    } finally {
      clearTimeout(timeout);
      refreshRequest = null;
    }
  })();

  return refreshRequest;
}

const CURRENCY_CODES = new Set(CURRENCIES.map(({ code }) => code).filter((code) => code !== "INR"));
