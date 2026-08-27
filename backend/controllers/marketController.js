const yahooService = require('../services/yahooFinanceService');

async function getQuote(req, res) {
  try {
    const { symbol } = req.params;
    if (!symbol) return res.status(400).json({ error: 'Symbol parameter is required' });

    const data = await yahooService.getQuote(symbol);
    if (!data) return res.status(404).json({ error: `Stock symbol "${symbol}" not found` });

    res.json(data);
  } catch (err) {
    console.error('Market quote error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stock quote', details: err.message });
  }
}

async function getMultipleQuotes(req, res) {
  try {
    const { symbols } = req.query;
    if (!symbols) return res.status(400).json({ error: 'symbols query parameter is required (comma-separated)' });

    const symbolList = symbols.split(',').map((s) => s.trim()).filter(Boolean);
    if (symbolList.length === 0) return res.status(400).json({ error: 'At least one symbol is required' });
    if (symbolList.length > 20) return res.status(400).json({ error: 'Maximum 20 symbols per request' });

    const data = await yahooService.getMultipleQuotes(symbolList);
    res.json(data);
  } catch (err) {
    console.error('Market quotes error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stock quotes', details: err.message });
  }
}

async function getHistory(req, res) {
  try {
    const { symbol } = req.params;
    const { period } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol parameter is required' });

    const validPeriods = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y'];
    const selectedPeriod = validPeriods.includes(period) ? period : '1mo';

    const data = await yahooService.getHistoricalData(symbol, selectedPeriod);
    res.json(data);
  } catch (err) {
    console.error('Market history error:', err.message);
    res.status(500).json({ error: 'Failed to fetch historical data', details: err.message });
  }
}

async function getIndices(req, res) {
  try {
    const data = await yahooService.getMarketIndices();
    res.json(data);
  } catch (err) {
    console.error('Market indices error:', err.message);
    res.status(500).json({ error: 'Failed to fetch market indices', details: err.message });
  }
}

async function searchStocks(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) return res.status(400).json({ error: 'Search query "q" is required' });

    const data = await yahooService.searchStocks(q);
    res.json(data);
  } catch (err) {
    console.error('Stock search error:', err.message);
    res.status(500).json({ error: 'Failed to search stocks', details: err.message });
  }
}

module.exports = { getQuote, getMultipleQuotes, getHistory, getIndices, searchStocks };
