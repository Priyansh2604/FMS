const apiBaseUrl = import.meta.env.VITE_API_URL || '';

async function request(url) {
  const response = await fetch(`${apiBaseUrl}${url}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export function getQuote(symbol) {
  return request(`/api/market/quote/${encodeURIComponent(symbol)}`);
}

export function getQuotes(symbols) {
  const list = symbols.join(',');
  return request(`/api/market/quotes?symbols=${encodeURIComponent(list)}`);
}

export function getHistory(symbol, period = '1mo') {
  return request(`/api/market/history/${encodeURIComponent(symbol)}?period=${period}`);
}

export function getIndices() {
  return request('/api/market/indices');
}

export function searchStocks(query) {
  return request(`/api/market/search?q=${encodeURIComponent(query)}`);
}

export async function fetchCategories() {
  try {
    const data = await request('/api/expenses/categories');
    return data;
  } catch {
    return null;
  }
}
