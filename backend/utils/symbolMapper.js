const INDEX_SYMBOLS = {
  NIFTY50: { yahoo: '^NSEI', name: 'NIFTY 50', exchange: 'NSE' },
  SENSEX: { yahoo: '^BSESN', name: 'SENSEX', exchange: 'BSE' },
};

const POPULAR_STOCKS = {
  RELIANCE: { nse: 'RELIANCE.NS', bse: 'RELIANCE.BO', name: 'Reliance Industries' },
  TCS: { nse: 'TCS.NS', bse: 'TCS.BO', name: 'Tata Consultancy Services' },
  INFY: { nse: 'INFY.NS', bse: 'INFY.BO', name: 'Infosys' },
  HDFCBANK: { nse: 'HDFCBANK.NS', bse: 'HDFCBANK.BO', name: 'HDFC Bank' },
  ICICIBANK: { nse: 'ICICIBANK.NS', bse: 'ICICIBANK.BO', name: 'ICICI Bank' },
  SBIN: { nse: 'SBIN.NS', bse: 'SBIN.BO', name: 'State Bank of India' },
  BHARTIARTL: { nse: 'BHARTIARTL.NS', bse: 'BHARTIARTL.BO', name: 'Bharti Airtel' },
  ITC: { nse: 'ITC.NS', bse: 'ITC.BO', name: 'ITC Limited' },
  KOTAKBANK: { nse: 'KOTAKBANK.NS', bse: 'KOTAKBANK.BO', name: 'Kotak Mahindra Bank' },
  LT: { nse: 'LT.NS', bse: 'LT.BO', name: 'Larsen & Toubro' },
  HINDUNILVR: { nse: 'HINDUNILVR.NS', bse: 'HINDUNILVR.BO', name: 'Hindustan Unilever' },
  BAJFINANCE: { nse: 'BAJFINANCE.NS', bse: 'BAJFINANCE.BO', name: 'Bajaj Finance' },
  ASIANPAINT: { nse: 'ASIANPAINT.NS', bse: 'ASIANPAINT.BO', name: 'Asian Paints' },
  MARUTI: { nse: 'MARUTI.NS', bse: 'MARUTI.BO', name: 'Maruti Suzuki' },
  SUNPHARMA: { nse: 'SUNPHARMA.NS', bse: 'SUNPHARMA.BO', name: 'Sun Pharmaceutical' },
  TATAMOTORS: { nse: 'TATAMOTORS.NS', bse: 'TATAMOTORS.BO', name: 'Tata Motors' },
  WIPRO: { nse: 'WIPRO.NS', bse: 'WIPRO.BO', name: 'Wipro' },
  HCLTECH: { nse: 'HCLTECH.NS', bse: 'HCLTECH.BO', name: 'HCL Technologies' },
  AXISBANK: { nse: 'AXISBANK.NS', bse: 'AXISBANK.BO', name: 'Axis Bank' },
  TITAN: { nse: 'TITAN.NS', bse: 'TITAN.BO', name: 'Titan Company' },
  ADANIENT: { nse: 'ADANIENT.NS', bse: 'ADANIENT.BO', name: 'Adani Enterprises' },
  ADANIPORTS: { nse: 'ADANIPORTS.NS', bse: 'ADANIPORTS.BO', name: 'Adani Ports' },
  POWERGRID: { nse: 'POWERGRID.NS', bse: 'POWERGRID.BO', name: 'Power Grid Corporation' },
  NTPC: { nse: 'NTPC.NS', bse: 'NTPC.BO', name: 'NTPC' },
  ONGC: { nse: 'ONGC.NS', bse: 'ONGC.BO', name: 'Oil & Natural Gas Corp' },
  TATASTEEL: { nse: 'TATASTEEL.NS', bse: 'TATASTEEL.BO', name: 'Tata Steel' },
  JSWSTEEL: { nse: 'JSWSTEEL.NS', bse: 'JSWSTEEL.BO', name: 'JSW Steel' },
  INDUSINDBK: { nse: 'INDUSINDBK.NS', bse: 'INDUSINDBK.BO', name: 'IndusInd Bank' },
  TECHM: { nse: 'TECHM.NS', bse: 'TECHM.BO', name: 'Tech Mahindra' },
  DRREDDY: { nse: 'DRREDDY.NS', bse: 'DRREDDY.BO', name: "Dr. Reddy's Laboratories" },
  CIPLA: { nse: 'CIPLA.NS', bse: 'CIPLA.BO', name: 'Cipla' },
  DIVISLAB: { nse: 'DIVISLAB.NS', bse: 'DIVISLAB.BO', name: "Divi's Laboratories" },
  EICHERMOT: { nse: 'EICHERMOT.NS', bse: 'EICHERMOT.BO', name: 'Eicher Motors' },
  'BAJAJ-AUTO': { nse: 'BAJAJ-AUTO.NS', bse: 'BAJAJ-AUTO.BO', name: 'Bajaj Auto' },
  HEROMOTOCO: { nse: 'HEROMOTOCO.NS', bse: 'HEROMOTOCO.BO', name: 'Hero MotoCorp' },
  COALINDIA: { nse: 'COALINDIA.NS', bse: 'COALINDIA.BO', name: 'Coal India' },
  TATACONSUM: { nse: 'TATACONSUM.NS', bse: 'TATACONSUM.BO', name: 'Tata Consumer Products' },
  BPCL: { nse: 'BPCL.NS', bse: 'BPCL.BO', name: 'Bharat Petroleum' },
  HINDALCO: { nse: 'HINDALCO.NS', bse: 'HINDALCO.BO', name: 'Hindalco Industries' },
  GRASIM: { nse: 'GRASIM.NS', bse: 'GRASIM.BO', name: 'Grasim Industries' },
  ULTRACEMCO: { nse: 'ULTRACEMCO.NS', bse: 'ULTRACEMCO.BO', name: 'UltraTech Cement' },
  NESTLEIND: { nse: 'NESTLEIND.NS', bse: 'NESTLEIND.BO', name: 'Nestle India' },
  TRENT: { nse: 'TRENT.NS', bse: 'TRENT.BO', name: 'Trent' },
  BEL: { nse: 'BEL.NS', bse: 'BEL.BO', name: 'Bharat Electronics' },
};

function toYahooSymbol(raw, exchange) {
  if (!raw) return null;
  const cleaned = raw.trim().toUpperCase();

  if (cleaned.startsWith('^NSEI') || cleaned.startsWith('^BSESN')) return cleaned;
  if (cleaned.endsWith('.NS') || cleaned.endsWith('.BO')) return cleaned;

  if (exchange === 'NSE') return `${cleaned}.NS`;
  if (exchange === 'BSE') return `${cleaned}.BO`;

  const known = POPULAR_STOCKS[cleaned];
  if (known) return known.nse;

  return `${cleaned}.NS`;
}

function resolveSearch(query) {
  const q = query.trim().toUpperCase();
  const results = [];

  if (INDEX_SYMBOLS[q]) {
    results.push({ symbol: INDEX_SYMBOLS[q].yahoo, name: INDEX_SYMBOLS[q].name, exchange: INDEX_SYMBOLS[q].exchange, type: 'Index' });
  }

  for (const [ticker, info] of Object.entries(POPULAR_STOCKS)) {
    if (ticker === q || info.name.toUpperCase().includes(q) || ticker.includes(q)) {
      results.push({ symbol: info.nse, name: info.name, exchange: 'NSE', type: 'Equity' });
      results.push({ symbol: info.bse, name: info.name, exchange: 'BSE', type: 'Equity' });
    }
  }

  return results;
}

module.exports = { toYahooSymbol, resolveSearch, INDEX_SYMBOLS, POPULAR_STOCKS };
