import { getCurrentUser } from "../auth";

const LOCALES = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
};

const DATA_BASE = "INR";
const STATIC_FX_RATES = {
  USD: 0.012, // 1 INR = 0.012 USD
  EUR: 0.011, // 1 INR = 0.011 EUR
};

export function formatCurrency(value, currencyCode = null) {
  if (value == null || value === "") return "-";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);

  const curr = currencyCode || (getCurrentUser && getCurrentUser()?.currency) || DATA_BASE;
  const locale = LOCALES[curr] || "en-US";
  const rate = curr === DATA_BASE ? 1 : STATIC_FX_RATES[curr] || 1;
  const amount = numeric * rate;

  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency: curr }).format(amount);
  } catch (e) {
    const symbol = curr === "INR" ? "₹" : curr === "USD" ? "$" : "€";
    return symbol + amount.toLocaleString();
  }
}

export default formatCurrency;
