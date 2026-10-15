export const CURRENCIES = [
  { code: "INR", label: "INR (₹)", locale: "en-IN" },
  { code: "USD", label: "USD ($)", locale: "en-US" },
  { code: "EUR", label: "EUR (€)", locale: "de-DE" },
  { code: "GBP", label: "GBP (£)", locale: "en-GB" },
  { code: "JPY", label: "JPY (¥)", locale: "ja-JP" },
  { code: "CAD", label: "CAD (C$)", locale: "en-CA" },
  { code: "AUD", label: "AUD (A$)", locale: "en-AU" },
  { code: "CHF", label: "CHF (CHF)", locale: "de-CH" },
  { code: "CNY", label: "CNY (CN¥)", locale: "zh-CN" },
  { code: "AED", label: "AED (د.إ)", locale: "ar-AE" },
  { code: "SGD", label: "SGD (S$)", locale: "en-SG" },
];

export const CURRENCY_BY_CODE = Object.fromEntries(
  CURRENCIES.map((currency) => [currency.code, currency])
);
