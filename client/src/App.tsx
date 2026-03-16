import { useState, useEffect, useCallback, useRef } from 'react';
import type { Quote } from './types';
import { fetchQuotes, fetchQuote } from './utils/api';
import { useWebSocket } from './hooks/useWebSocket';
import StockCard from './components/StockCard';
import StockDetail from './components/StockDetail';
import Ticker from './components/Ticker';
import Search from './components/Search';
import { DollarSign, BarChart2, RefreshCw, AlertTriangle } from 'lucide-react';
import { getShariahInfo } from './utils/shariahData';

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD', 'NFLX', 'JPM'];

export default function App() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selected, setSelected] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [customSymbols, setCustomSymbols] = useState<string[]>([]);
  const [apiKeySet, setApiKeySet] = useState<boolean | null>(null);
  const [shariahFilter, setShariahFilter] = useState(false);
  const quotesRef = useRef<Quote[]>([]);

  const allSymbols = [...DEFAULT_SYMBOLS, ...customSymbols.filter(s => !DEFAULT_SYMBOLS.includes(s))];

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/status`)
      .then(r => r.json())
      .then(d => setApiKeySet(d.apiKeySet))
      .catch(() => setApiKeySet(false));
  }, []);

  const loadQuotes = useCallback(async () => {
    try {
      const data = await fetchQuotes(allSymbols) as Quote[];
      setQuotes(data);
      quotesRef.current = data;
      if (selected) {
        const updated = data.find(q => q.symbol === selected.symbol);
        if (updated) setSelected(updated);
      }
    } finally {
      setLoading(false);
    }
  }, [allSymbols.join(','), selected?.symbol]);

  // Initial load
  useEffect(() => { loadQuotes(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch whenever the watchlist grows (custom symbols added via search)
  useEffect(() => {
    if (customSymbols.length > 0) loadQuotes();
  }, [customSymbols]); // eslint-disable-line react-hooks/exhaustive-deps

  // WebSocket for live updates
  const handleWsMessage = useCallback((msg: unknown) => {
    const m = msg as { type: string; data: Quote[] };
    if (m.type === 'quotes') {
      setConnected(true);
      setLastUpdate(new Date());
      setQuotes(prev => {
        const map = new Map(prev.map(q => [q.symbol, q]));
        m.data.forEach(q => map.set(q.symbol, q));
        const next = Array.from(map.values());
        quotesRef.current = next;
        return next;
      });
      // Update selected quote if open
      setSelected(prev => {
        if (!prev) return prev;
        const updated = m.data.find(q => q.symbol === prev.symbol);
        return updated ?? prev;
      });
    }
  }, []);

  useWebSocket(
    (import.meta.env.VITE_API_URL ?? 'http://localhost:3001').replace(/^http/, 'ws'),
    handleWsMessage
  );

  useEffect(() => {
    const t = setTimeout(() => { if (!connected) setConnected(false); }, 5000);
    return () => clearTimeout(t);
  }, [connected]);

  const handleSelectSymbol = async (symbol: string) => {
    if (!customSymbols.includes(symbol) && !DEFAULT_SYMBOLS.includes(symbol)) {
      setCustomSymbols(prev => [...prev, symbol]);
    }
    // Fetch quote for this symbol
    const existing = quotesRef.current.find(q => q.symbol === symbol);
    if (existing) {
      setSelected(existing);
    } else {
      const data = await fetchQuote(symbol) as Quote;
      // price can be 0 when markets are closed — check symbol instead
      if (data?.symbol) {
        setSelected(data);
        setQuotes(prev => {
          if (prev.find(q => q.symbol === symbol)) return prev;
          return [...prev, data];
        });
        quotesRef.current = [...quotesRef.current, data];
      }
    }
  };

  const totalGain = quotes.reduce((sum, q) => sum + (q.changePercent ?? 0), 0);
  const gainers = quotes.filter(q => (q.changePercent ?? 0) > 0).length;
  const losers = quotes.filter(q => (q.changePercent ?? 0) < 0).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(10px)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, #00d4a0, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0,212,160,0.3)',
          }}>
            <DollarSign size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{
              fontWeight: 700, fontSize: 16, color: 'var(--text-bright)',
              background: 'linear-gradient(90deg, #00d4a0, #2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              StockPulse
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: -2, letterSpacing: '0.05em' }}>
              LIVE MARKETS
            </div>
          </div>
        </div>

        {/* Center stats */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Gainers</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>{gainers}</div>
          </div>
          <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Losers</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, color: 'var(--red)' }}>{losers}</div>
          </div>
          <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Avg Change</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, color: totalGain >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {totalGain >= 0 ? '+' : ''}{(totalGain / (quotes.length || 1)).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Right: search + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Search onSelect={handleSelectSymbol} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="live-dot" />
            <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
              {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Connecting...'}
            </span>
          </div>
          <button
            onClick={loadQuotes}
            style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '6px', cursor: 'pointer',
              color: 'var(--text-dim)', display: 'flex', alignItems: 'center',
              transition: 'all 0.15s',
            }}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* Ticker strip */}
      <Ticker quotes={quotes} />

      {/* API Key banner */}
      {apiKeySet === false && (
        <div style={{
          background: 'rgba(255, 165, 0, 0.08)',
          borderBottom: '1px solid rgba(255, 165, 0, 0.25)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          color: '#ffb347',
        }}>
          <AlertTriangle size={15} />
          <span>
            <strong>API key not configured.</strong> Get a free key at{' '}
            <strong>finnhub.io/register</strong>, then add it to{' '}
            <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: 3, fontFamily: 'var(--mono)' }}>
              server/.env
            </code>{' '}
            as <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: 3, fontFamily: 'var(--mono)' }}>FINNHUB_API_KEY</code> and restart the server.
          </span>
        </div>
      )}

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <aside style={{
          width: 280,
          borderRight: '1px solid var(--border)',
          background: 'var(--surface)',
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          <div style={{
            padding: '10px 12px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart2 size={14} color="var(--text-dim)" />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Watchlist
              </span>
              <span style={{
                marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)',
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '1px 7px', fontFamily: 'var(--mono)',
              }}>
                {shariahFilter
                  ? `${quotes.filter(q => getShariahInfo(q.symbol).status === 'compliant').length} / ${quotes.length}`
                  : quotes.length}
              </span>
            </div>

            {/* Shariah filter toggle */}
            <button
              onClick={() => setShariahFilter(f => !f)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                background: shariahFilter ? 'rgba(0,212,160,0.1)' : 'var(--surface2)',
                border: `1px solid ${shariahFilter ? 'rgba(0,212,160,0.4)' : 'var(--border)'}`,
                borderRadius: 8,
                padding: '7px 10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Crescent icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                  fill={shariahFilter ? '#00d4a0' : '#5c7a9a'} />
              </svg>
              <span style={{
                fontSize: 11, fontWeight: 600, flex: 1, textAlign: 'left',
                color: shariahFilter ? 'var(--green)' : 'var(--text-dim)',
                letterSpacing: '0.04em',
              }}>
                Shariah Compliant Only
              </span>
              {/* Toggle pill */}
              <div style={{
                width: 28, height: 16, borderRadius: 8,
                background: shariahFilter ? 'var(--green)' : 'var(--border2)',
                position: 'relative', transition: 'background 0.2s',
                flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute', top: 2,
                  left: shariahFilter ? 14 : 2,
                  width: 12, height: 12, borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </div>
            </button>
          </div>

          <div style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="loading-skeleton" style={{ height: 80, borderRadius: 10 }} />
                ))
              : quotes
                  .filter(q => !shariahFilter || getShariahInfo(q.symbol).status === 'compliant')
                  .map(quote => (
                    <StockCard
                      key={quote.symbol}
                      quote={quote}
                      selected={selected?.symbol === quote.symbol}
                      onClick={() => setSelected(quote)}
                    />
                  ))
            }
            {!loading && shariahFilter && quotes.filter(q => getShariahInfo(q.symbol).status === 'compliant').length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-dim)', fontSize: 12 }}>
                No compliant stocks in watchlist
              </div>
            )}
          </div>
        </aside>

        {/* Main panel */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {selected ? (
            <StockDetail quote={selected} />
          ) : (
            <EmptyState onPickRandom={() => quotes[0] && setSelected(quotes[0])} hasQuotes={quotes.length > 0} />
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyState({ onPickRandom, hasQuotes }: { onPickRandom: () => void; hasQuotes: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', minHeight: 400, textAlign: 'center', gap: 20,
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(0,212,160,0.15), rgba(37,99,235,0.15))',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 40px rgba(0,212,160,0.1)',
      }}>
        <DollarSign size={36} color="var(--green)" strokeWidth={1.5} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 8 }}>
          Select a Stock
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-dim)', maxWidth: 320 }}>
          Pick any stock from your watchlist or search for a ticker to view live prices, charts, and news.
        </div>
      </div>
      {hasQuotes && (
        <button
          onClick={onPickRandom}
          style={{
            background: 'linear-gradient(135deg, var(--green), #2563eb)',
            border: 'none', borderRadius: 8, padding: '10px 24px',
            color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,212,160,0.3)',
          }}
        >
          View Top Stock
        </button>
      )}
    </div>
  );
}
