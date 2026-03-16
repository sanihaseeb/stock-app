import type { Quote } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { getShariahInfo } from '../utils/shariahData';
import ShariahBadge from './ShariahBadge';

interface StockCardProps {
  quote: Quote;
  selected: boolean;
  onClick: () => void;
}

export default function StockCard({ quote, selected, onClick }: StockCardProps) {
  const isUp = (quote.changePercent ?? 0) >= 0;
  const shariah = getShariahInfo(quote.symbol);
  const prevPrice = useRef(quote.price);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (quote.price !== prevPrice.current) {
      setFlash(quote.price > prevPrice.current ? 'up' : 'down');
      prevPrice.current = quote.price;
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
  }, [quote.price]);

  const borderColor = selected
    ? (isUp ? 'var(--green)' : 'var(--red)')
    : flash === 'up' ? 'var(--green)'
    : flash === 'down' ? 'var(--red)'
    : 'var(--border)';

  const bgGlow = selected
    ? (isUp ? 'var(--green-glow)' : 'var(--red-glow)')
    : 'transparent';

  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? 'var(--surface3)' : 'var(--surface2)',
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: selected ? `0 0 20px ${bgGlow}` : 'none',
        animation: flash ? `${flash === 'up' ? 'pulse-green' : 'pulse-red'} 0.6s ease` : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isUp
          ? 'linear-gradient(135deg, transparent 60%, rgba(0,212,160,0.03) 100%)'
          : 'linear-gradient(135deg, transparent 60%, rgba(255,71,87,0.03) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              fontFamily: 'var(--mono)',
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--text-bright)',
              letterSpacing: '0.05em',
            }}>
              {quote.symbol}
            </div>
            <ShariahBadge status={shariah.status} />
          </div>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginTop: 6,
          }}>
            ${quote.price?.toFixed(2)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            justifyContent: 'flex-end',
            color: isUp ? 'var(--green)' : 'var(--red)',
            fontFamily: 'var(--mono)',
            fontSize: 13,
            fontWeight: 600,
          }}>
            {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {isUp ? '+' : ''}{quote.changePercent?.toFixed(2)}%
          </div>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: 12,
            color: isUp ? 'var(--green-dim)' : 'var(--red-dim)',
            marginTop: 4,
          }}>
            {isUp ? '+' : ''}{quote.change?.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Mini sparkline bar */}
      <div style={{
        marginTop: 10,
        height: 3,
        background: 'var(--border)',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, Math.max(10, 50 + (quote.changePercent ?? 0) * 5))}%`,
          background: isUp
            ? 'linear-gradient(90deg, var(--green-dim), var(--green))'
            : 'linear-gradient(90deg, var(--red-dim), var(--red))',
          borderRadius: 2,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}
