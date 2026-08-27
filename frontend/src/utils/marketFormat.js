const USD_RATE = 0.012;

export function fmtINR(value, compact = false) {
  if (value == null || isNaN(value)) return "—";
  const num = Number(value);
  if (compact) {
    if (Math.abs(num) >= 10000000) return "₹" + (num / 10000000).toFixed(2) + " Cr";
    if (Math.abs(num) >= 100000) return "₹" + (num / 100000).toFixed(2) + " L";
    if (Math.abs(num) >= 1000) return "₹" + (num / 1000).toFixed(1) + "K";
  }
  return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function fmtUSD(value) {
  if (value == null || isNaN(value)) return "—";
  const usd = Number(value) * USD_RATE;
  if (Math.abs(usd) >= 1000000) return "$" + (usd / 1000000).toFixed(2) + "M";
  if (Math.abs(usd) >= 1000) return "$" + (usd / 1000).toFixed(1) + "K";
  return "$" + usd.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function fmtPrice(value, currency = "INR") {
  if (value == null || isNaN(value)) return "—";
  if (currency === "USD") return fmtUSD(value);
  return fmtINR(value);
}

export function fmtCompact(value, currency = "INR") {
  if (value == null || isNaN(value)) return "—";
  const num = Number(value);
  if (currency === "USD") {
    const usd = num * USD_RATE;
    if (Math.abs(usd) >= 1000000) return "$" + (usd / 1000000).toFixed(2) + "M";
    if (Math.abs(usd) >= 1000) return "$" + (usd / 1000).toFixed(1) + "K";
    return "$" + usd.toFixed(2);
  }
  if (Math.abs(num) >= 10000000) return "₹" + (num / 10000000).toFixed(2) + " Cr";
  if (Math.abs(num) >= 100000) return "₹" + (num / 100000).toFixed(2) + " L";
  if (Math.abs(num) >= 1000) return "₹" + (num / 1000).toFixed(1) + "K";
  return "₹" + num.toFixed(2);
}

export function fmtChange(value, showSign = true) {
  if (value == null || isNaN(value)) return "—";
  const num = Number(value);
  const sign = showSign && num > 0 ? "+" : "";
  return sign + num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function fmtPct(value) {
  if (value == null || isNaN(value)) return "—";
  const num = Number(value);
  const sign = num > 0 ? "+" : "";
  return sign + num.toFixed(2) + "%";
}

export function fmtVolume(value) {
  if (value == null || isNaN(value)) return "—";
  const num = Number(value);
  if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr";
  if (num >= 100000) return (num / 100000).toFixed(2) + " L";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toLocaleString("en-IN");
}

export function changeColor(isUp) {
  return isUp ? "text-emerald-700" : "text-rose-700";
}

export function changeBg(isUp) {
  return isUp ? "bg-emerald-500/10" : "bg-rose-500/10";
}

export function changeArrow(isUp) {
  return isUp ? "▲" : "▼";
}

export function changeSign(value) {
  if (value == null || isNaN(value)) return "";
  return Number(value) >= 0 ? "+" : "";
}
