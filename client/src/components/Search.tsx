import { useState, useRef, useEffect, useCallback } from 'react';
import type { SearchResult } from '../types';
import { Search as SearchIcon, X } from 'lucide-react';
import { searchSymbols } from '../utils/api';

interface SearchProps {
  onSelect: (symbol: string) => void;
}

export default function Search({ onSelect }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await searchSymbols(q) as SearchResult[];
      setResults(data.filter(r => r.type === 'Common Stock'));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 300);
  };

  const handleSelect = (symbol: string) => {
    onSelect(symbol);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.closest('.search-wrap')?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="search-wrap" style={{ position: 'relative', width: 280 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '8px 12px',
        transition: 'border-color 0.15s',
      }}>
        <SearchIcon size={14} color="var(--text-dim)" />
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => query && setOpen(true)}
          placeholder="Search stocks..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-bright)',
            fontSize: 13,
            fontFamily: 'var(--mono)',
            width: '100%',
            '::placeholder': { color: 'var(--text-dim)' },
          } as React.CSSProperties}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}>
            <X size={13} />
          </button>
        )}
      </div>

      {open && (query || results.length > 0) && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: 'var(--surface2)',
          border: '1px solid var(--border2)',
          borderRadius: 8,
          overflow: 'hidden',
          zIndex: 100,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.15s ease',
        }}>
          {loading && (
            <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
              Searching...
            </div>
          )}
          {!loading && results.length === 0 && query && (
            <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-dim)' }}>
              No results found
            </div>
          )}
          {results.map((r) => (
            <div
              key={r.symbol}
              onClick={() => handleSelect(r.symbol)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 13, color: 'var(--text-bright)' }}>
                  {r.displaySymbol}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                  {r.description}
                </div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', background: 'var(--surface)', padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--mono)' }}>
                {r.type}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
