import { getCurrentUser } from "../auth";
import { CURRENCY_BY_CODE } from "./currencyOptions";
import { getCurrencyRate } from "./currencyRates";

export function formatCurrency(value, currencyCode = null) {
  if (value == null || value === "") return "-";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);

  const curr = currencyCode || getCurrentUser()?.currency || "INR";
  const currency = CURRENCY_BY_CODE[curr] || CURRENCY_BY_CODE.INR;
  const amount = numeric * getCurrencyRate(currency.code);
  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
  }).format(amount);
}

export default formatCurrency;
