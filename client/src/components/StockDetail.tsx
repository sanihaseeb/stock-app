import { useEffect, useState } from 'react';
import type { Quote, Profile, NewsItem } from '../types';
import { fetchProfile, fetchNews } from '../utils/api';
import { Globe, ExternalLink, Building2, TrendingUp, TrendingDown, Activity, ShieldCheck, ShieldX, ShieldAlert, ShieldQuestion } from 'lucide-react';
import Chart from './Chart';
import { getShariahInfo, STATUS_LABELS, STATUS_COLORS } from '../utils/shariahData';
import ShariahBadge from './ShariahBadge';

interface StockDetailProps {
  quote: Quote;
}

function ShariahCompliancePanel({ symbol }: { symbol: string }) {
  const info = getShariahInfo(symbol);
  const c = STATUS_COLORS[info.status];

  const StatusIcon = info.status === 'compliant' ? ShieldCheck
    : info.status === 'non_compliant' ? ShieldX
    : info.status === 'doubtful' ? ShieldAlert
    : ShieldQuestion;

  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 12,
      padding: '16px 20px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
    }}>
      <StatusIcon size={22} color={c.color} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: c.color }}>
            {STATUS_LABELS[info.status]}
          </span>
          <ShariahBadge status={info.status} size="md" />
        </div>
        {info.status === 'compliant' && info.screens && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            {info.screens.map(s => (
              <span key={s} style={{
                fontSize: 10, color: c.color, background: c.bg,
                border: `1px solid ${c.border}`, borderRadius: 10,
                padding: '2px 8px', fontFamily: 'var(--mono)',
              }}>
                ✓ {s}
              </span>
            ))}
          </div>
        )}
        {(info.status === 'non_compliant' || info.status === 'doubtful') && info.reason && (
          <div style={{ fontSize: 12, color: c.color, opacity: 0.85, lineHeight: 1.5, marginTop: 2 }}>
            {info.reason}
          </div>
        )}
        {info.status === 'unknown' && (
          <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, marginTop: 2 }}>
            This stock hasn't been screened yet. Refer to a qualified Shariah scholar or screening service for guidance.
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '10px 14px',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 600, color: 'var(--text-bright)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function StockDetail({ quote }: StockDetailProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [, setLoading] = useState(true);
  const isUp = (quote.changePercent ?? 0) >= 0;
  const shariah = getShariahInfo(quote.symbol);

  useEffect(() => {
    setLoading(true);
    setProfile(null);
    setNews([]);

    Promise.all([
      fetchProfile(quote.symbol) as Promise<Profile>,
      fetchNews(quote.symbol) as Promise<NewsItem[]>,
    ]).then(([p, n]) => {
      setProfile(p);
      setNews(n);
    }).finally(() => setLoading(false));
  }, [quote.symbol]);

  const formatMktCap = (v?: number) => {
    if (!v) return 'N/A';
    if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}T`;
    if (v >= 1000) return `$${(v / 1000).toFixed(2)}B`;
    return `$${v.toFixed(2)}M`;
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 200, height: 200,
          background: isUp ? 'radial-gradient(circle, rgba(0,212,160,0.06) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(255,71,87,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {profile?.logo && (
              <img src={profile.logo} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'contain', background: '#fff', padding: 4 }} />
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 22, color: 'var(--text-bright)', letterSpacing: '0.04em' }}>
                  {quote.symbol}
                </span>
                <ShariahBadge status={shariah.status} size="md" showLabel />
                {profile?.exchange && (
                  <span style={{
                    background: 'var(--surface3)', border: '1px solid var(--border)',
                    borderRadius: 4, padding: '2px 7px', fontSize: 10, color: 'var(--text-dim)',
                    fontFamily: 'var(--mono)', letterSpacing: '0.05em',
                  }}>
                    {profile.exchange}
                  </span>
                )}
              </div>
              {profile?.name && (
                <div style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 2 }}>{profile.name}</div>
              )}
              {profile?.finnhubIndustry && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
                  <Building2 size={11} />
                  {profile.finnhubIndustry}
                </div>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: 32,
              fontWeight: 700,
              color: 'var(--text-bright)',
              lineHeight: 1,
            }}>
              ${quote.price?.toFixed(2)}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end',
              marginTop: 6, color: isUp ? 'var(--green)' : 'var(--red)',
              fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 600,
            }}>
              {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {isUp ? '+' : ''}{quote.change?.toFixed(2)} ({isUp ? '+' : ''}{quote.changePercent?.toFixed(2)}%)
            </div>
            {profile?.weburl && (
              <a href={profile.weburl} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, color: 'var(--text-dim)', textDecoration: 'none',
                marginTop: 6,
              }}>
                <Globe size={10} /> {profile.weburl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                <ExternalLink size={9} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, marginBottom: 16 }}>
        <StatBox label="Open" value={`$${quote.open?.toFixed(2)}`} />
        <StatBox label="Prev Close" value={`$${quote.prevClose?.toFixed(2)}`} />
        <StatBox label="High" value={`$${quote.high?.toFixed(2)}`} />
        <StatBox label="Low" value={`$${quote.low?.toFixed(2)}`} />
        <StatBox label="Mkt Cap" value={formatMktCap(profile?.marketCapitalization)} />
        <StatBox label="Country" value={profile?.country || 'N/A'} />
      </div>

      {/* Shariah Compliance Panel */}
      <ShariahCompliancePanel symbol={quote.symbol} />

      {/* Chart */}
      <div style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '20px 20px 12px',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Activity size={15} color="var(--text-dim)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Price History
          </span>
        </div>
        <Chart symbol={quote.symbol} currentPrice={quote.price} isUp={isUp} />
      </div>

      {/* News */}
      {news.length > 0 && (
        <div style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '20px 20px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Latest News
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ fontSize: 13, color: 'var(--text-bright)', lineHeight: 1.4, marginBottom: 6 }}>
                  {item.headline}
                </div>
                <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-dim)' }}>
                  <span>{item.source}</span>
                  <span>·</span>
                  <span>{new Date(item.datetime * 1000).toLocaleDateString()}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
