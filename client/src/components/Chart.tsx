import { useEffect, useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { Candle } from '../types';

interface ChartProps {
  symbol: string;
  currentPrice?: number;
  isUp: boolean;
}

interface ChartPoint {
  time: string;
  price: number;
  date: Date;
}

const RESOLUTIONS = [
  { label: '1W', resolution: 'D', days: 7 },
  { label: '1M', resolution: 'D', days: 30 },
  { label: '3M', resolution: 'D', days: 90 },
  { label: '6M', resolution: 'W', days: 180 },
  { label: '1Y', resolution: 'W', days: 365 },
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: ChartPoint }> }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: 'var(--surface3)',
      border: '1px solid var(--border2)',
      borderRadius: 8,
      padding: '8px 12px',
      fontFamily: 'var(--mono)',
      fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-dim)', marginBottom: 2 }}>
        {d.payload.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
      <div style={{ color: 'var(--text-bright)', fontWeight: 600, fontSize: 14 }}>
        ${d.value.toFixed(2)}
      </div>
    </div>
  );
};

export default function Chart({ symbol, isUp }: ChartProps) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRes, setActiveRes] = useState(1); // default 1M

  const color = isUp ? 'var(--green)' : 'var(--red)';
  const colorDim = isUp ? 'var(--green-dim)' : 'var(--red-dim)';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { resolution, days } = RESOLUTIONS[activeRes];
      const now = Math.floor(Date.now() / 1000);
      const from = now - days * 24 * 60 * 60;
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/candles/${symbol}?resolution=${resolution}&from=${from}&to=${now}`);
      const candle: Candle = await res.json();

      if (candle.s === 'ok' && candle.t) {
        const points: ChartPoint[] = candle.t.map((ts, i) => ({
          time: new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: candle.c[i],
          date: new Date(ts * 1000),
        }));
        setData(points);
      } else {
        setData([]);
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [symbol, activeRes]);

  useEffect(() => { load(); }, [load]);

  const firstPrice = data[0]?.price;
  const minPrice = data.length ? Math.min(...data.map(d => d.price)) * 0.998 : 0;
  const maxPrice = data.length ? Math.max(...data.map(d => d.price)) * 1.002 : 0;

  return (
    <div>
      {/* Resolution selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {RESOLUTIONS.map((r, i) => (
          <button
            key={r.label}
            onClick={() => setActiveRes(i)}
            style={{
              background: activeRes === i ? (isUp ? 'var(--green-glow)' : 'var(--red-glow)') : 'transparent',
              border: `1px solid ${activeRes === i ? color : 'var(--border)'}`,
              color: activeRes === i ? color : 'var(--text-dim)',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 12,
              fontFamily: 'var(--mono)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontWeight: activeRes === i ? 600 : 400,
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: 200 }} className="loading-skeleton" />
        </div>
      ) : data.length === 0 ? (
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
          No chart data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--mono)' }}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(data.length / 5)}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--mono)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            {firstPrice && (
              <ReferenceLine
                y={firstPrice}
                stroke={colorDim}
                strokeDasharray="3 3"
                strokeWidth={1}
                opacity={0.5}
              />
            )}
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fill="url(#priceGrad)"
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: 'var(--bg)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
