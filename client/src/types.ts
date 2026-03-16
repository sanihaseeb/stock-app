export interface Quote {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface Profile {
  name?: string;
  logo?: string;
  exchange?: string;
  finnhubIndustry?: string;
  marketCapitalization?: number;
  shareOutstanding?: number;
  weburl?: string;
  country?: string;
  currency?: string;
  ipo?: string;
}

export interface Candle {
  c: number[];  // close
  h: number[];  // high
  l: number[];  // low
  o: number[];  // open
  t: number[];  // timestamp
  v: number[];  // volume
  s: string;    // status
}

export interface NewsItem {
  id: number;
  headline: string;
  source: string;
  url: string;
  datetime: number;
  image?: string;
  summary?: string;
}

export interface SearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}
