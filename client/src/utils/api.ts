const BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api`;

export async function fetchQuotes(symbols?: string[]): Promise<unknown[]> {
  const q = symbols ? `?symbols=${symbols.join(',')}` : '';
  const res = await fetch(`${BASE}/quotes${q}`);
  return res.json();
}

export async function fetchQuote(symbol: string): Promise<unknown> {
  const res = await fetch(`${BASE}/quote/${symbol}`);
  return res.json();
}

export async function fetchProfile(symbol: string): Promise<unknown> {
  const res = await fetch(`${BASE}/profile/${symbol}`);
  return res.json();
}

export async function fetchCandles(symbol: string, resolution = 'D'): Promise<unknown> {
  const res = await fetch(`${BASE}/candles/${symbol}?resolution=${resolution}`);
  return res.json();
}

export async function searchSymbols(query: string): Promise<unknown[]> {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`);
  return res.json();
}

export async function fetchNews(symbol: string): Promise<unknown[]> {
  const res = await fetch(`${BASE}/news/${symbol}`);
  return res.json();
}
