import type { Quote } from '../types';

interface TickerProps {
  quotes: Quote[];
}

export default function Ticker({ quotes }: TickerProps) {
  if (!quotes.length) return null;

  const items = [...quotes, ...quotes]; // duplicate for seamless loop

  return (
    <div style={{
      background: 'linear-gradient(90deg, var(--surface) 0%, var(--surface2) 50%, var(--surface) 100%)',
      borderBottom: '1px solid var(--border)',
      overflow: 'hidden',
      position: 'relative',
      height: 36,
      display: 'flex',
      alignItems: 'center',
    }}>
      {/* Fade edges */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 80, height: '100%',
        background: 'linear-gradient(90deg, var(--surface), transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, width: 80, height: '100%',
        background: 'linear-gradient(270deg, var(--surface), transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex',
        animation: `ticker ${items.length * 3}s linear infinite`,
        whiteSpace: 'nowrap',
        gap: 0,
      }}>
        {items.map((q, i) => (
          <div key={`${q.symbol}-${i}`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 24px',
            borderRight: '1px solid var(--border)',
            fontFamily: 'var(--mono)',
            fontSize: 12,
          }}>
            <span style={{ color: 'var(--text-bright)', fontWeight: 600, letterSpacing: '0.05em' }}>
              {q.symbol}
            </span>
            <span style={{ color: 'var(--text-bright)' }}>
              ${q.price?.toFixed(2)}
            </span>
            <span style={{
              color: (q.changePercent ?? 0) >= 0 ? 'var(--green)' : 'var(--red)',
              fontWeight: 500,
            }}>
              {(q.changePercent ?? 0) >= 0 ? '+' : ''}{q.changePercent?.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
