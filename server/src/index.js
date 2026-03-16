const express = require('express');
const cors = require('cors');
const axios = require('axios');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
if (!FINNHUB_API_KEY || FINNHUB_API_KEY === 'your_api_key_here') {
  console.error('\n⚠️  FINNHUB_API_KEY not set!');
  console.error('   1. Go to https://finnhub.io/register (free)');
  console.error('   2. Copy your API key');
  console.error('   3. Edit stock-market-app/server/.env and set FINNHUB_API_KEY=your_key\n');
}

// Popular stocks to track
const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD', 'NFLX', 'JPM'];

// Cache for quotes
const quoteCache = new Map();

const YF_HEADERS = { 'User-Agent': 'Mozilla/5.0' };

// Fetch a single quote via Yahoo Finance (no API key, no rate limit)
async function fetchQuote(symbol) {
  try {
    const res = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      { headers: YF_HEADERS }
    );
    const meta = res.data?.chart?.result?.[0]?.meta;
    if (!meta) return quoteCache.get(symbol) || null;
    const price = meta.regularMarketPrice ?? 0;
    const prev  = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const quote = {
      symbol,
      price,
      open:          meta.regularMarketOpen    ?? 0,
      high:          meta.regularMarketDayHigh ?? 0,
      low:           meta.regularMarketDayLow  ?? 0,
      prevClose:     prev,
      change:        prev ? price - prev : 0,
      changePercent: prev ? ((price - prev) / prev) * 100 : 0,
      timestamp:     Date.now(),
    };
    quoteCache.set(symbol, quote);
    return quote;
  } catch (err) {
    console.error(`Error fetching ${symbol}:`, err.message);
    return quoteCache.get(symbol) || null;
  }
}

// Fetch all symbols in parallel (Yahoo chart endpoint, no rate limits)
async function fetchQuotesBatch(symbols) {
  const results = await Promise.allSettled(symbols.map(fetchQuote));
  return results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value);
}

async function fetchProfile(symbol) {
  try {
    const res = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
    return res.data;
  } catch (err) {
    return {};
  }
}

// Candle data via Yahoo Finance (free, no key needed)
// Maps resolution/days from client to Yahoo range+interval
function resolveYahooParams(resolution, days) {
  const d = parseInt(days) || 30;
  if (d <= 7)   return { range: '5d',  interval: '1d' };
  if (d <= 30)  return { range: '1mo', interval: '1d' };
  if (d <= 90)  return { range: '3mo', interval: '1d' };
  if (d <= 180) return { range: '6mo', interval: '1wk' };
  return        { range: '1y',  interval: '1wk' };
}

async function fetchCandles(symbol, resolution = 'D', from, to) {
  try {
    const days = from ? Math.round((Date.now() / 1000 - parseInt(from)) / 86400) : 30;
    const { range, interval } = resolveYahooParams(resolution, days);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const result = res.data?.chart?.result?.[0];
    if (!result) return { s: 'no_data' };
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    // Return in Finnhub candle format so the client doesn't need changes
    return {
      s: 'ok',
      t: timestamps,
      c: quotes.close,
      o: quotes.open,
      h: quotes.high,
      l: quotes.low,
      v: quotes.volume,
    };
  } catch (err) {
    return { s: 'no_data' };
  }
}

async function searchSymbol(query) {
  try {
    const res = await axios.get(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0&listsCount=0`,
      { headers: YF_HEADERS }
    );
    const quotes = res.data?.quotes || [];
    // Map Yahoo format → Finnhub format so the client doesn't need changes
    return quotes
      .filter(q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
      .map(q => ({
        symbol:        q.symbol,
        displaySymbol: q.symbol,
        description:   q.longname || q.shortname || q.symbol,
        type:          q.quoteType === 'EQUITY' ? 'Common Stock' : q.quoteType,
      }));
  } catch (err) {
    return [];
  }
}

async function fetchNews(symbol) {
  try {
    const now = new Date();
    const from = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const to = now.toISOString().split('T')[0];
    const res = await axios.get(
      `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
    );
    return (res.data || []).slice(0, 5);
  } catch (err) {
    return [];
  }
}

// Routes
app.get('/api/status', (req, res) => {
  res.json({ apiKeySet: !!(FINNHUB_API_KEY && FINNHUB_API_KEY !== 'your_api_key_here') });
});

app.get('/api/quotes', async (req, res) => {
  const symbols = (req.query.symbols || DEFAULT_SYMBOLS.join(',')).split(',');
  const quotes = await fetchQuotesBatch(symbols);
  res.json(quotes);
});

app.get('/api/quote/:symbol', async (req, res) => {
  const quote = await fetchQuote(req.params.symbol.toUpperCase());
  res.json(quote || {});
});

app.get('/api/profile/:symbol', async (req, res) => {
  const profile = await fetchProfile(req.params.symbol.toUpperCase());
  res.json(profile);
});

app.get('/api/candles/:symbol', async (req, res) => {
  const { resolution, from, to } = req.query;
  const data = await fetchCandles(req.params.symbol.toUpperCase(), resolution, from, to);
  res.json(data);
});

app.get('/api/search', async (req, res) => {
  const results = await searchSymbol(req.query.q || '');
  res.json(results);
});

app.get('/api/news/:symbol', async (req, res) => {
  const news = await fetchNews(req.params.symbol.toUpperCase());
  res.json(news);
});

// WebSocket server for real-time updates
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Stock server running on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected. Total:', clients.size);

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected. Total:', clients.size);
  });
});

// Broadcast live price updates every 15 seconds using a single batch call
async function broadcastUpdates() {
  if (clients.size === 0) return;
  const allKnownSymbols = Array.from(quoteCache.keys());
  const symbolsToFetch = allKnownSymbols.length > 0 ? allKnownSymbols : DEFAULT_SYMBOLS;
  const quotes = await fetchQuotesBatch(symbolsToFetch);
  if (!quotes.length) return;
  const data = JSON.stringify({ type: 'quotes', data: quotes });
  clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(data);
  });
}

setInterval(broadcastUpdates, 15000);
