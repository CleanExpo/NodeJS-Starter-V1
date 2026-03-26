# Area chart — Scientific Luxury

Recharts area chart for volume/accumulation data. OLED Black surface, gradient fill from spectral Cyan, JetBrains Mono axes, custom tooltip, Framer Motion entry animation.

```tsx
'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

// --- Types ---

interface DailyTraffic {
  date: string;
  sessions: number;
  bounceRate: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

// --- Palette ---

const SPECTRAL = {
  primary: '#00F5FF',
  positive: '#00FF88',
  warning: '#FFB800',
  negative: '#FF4444',
  neutral: 'rgba(255,255,255,0.4)',
  accent: '#FF00FF',
} as const;

// --- Data ---

const dailyTraffic: DailyTraffic[] = [
  { date: '01 Mar', sessions: 4200, bounceRate: 42 },
  { date: '04 Mar', sessions: 5100, bounceRate: 38 },
  { date: '07 Mar', sessions: 4800, bounceRate: 41 },
  { date: '10 Mar', sessions: 6300, bounceRate: 35 },
  { date: '13 Mar', sessions: 7100, bounceRate: 33 },
  { date: '16 Mar', sessions: 6800, bounceRate: 36 },
  { date: '19 Mar', sessions: 8200, bounceRate: 31 },
  { date: '22 Mar', sessions: 7600, bounceRate: 34 },
  { date: '25 Mar', sessions: 9100, bounceRate: 29 },
  { date: '28 Mar', sessions: 8700, bounceRate: 30 },
];

// --- Custom tooltip ---

function TrafficTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '4px',
        padding: '8px 12px',
      }}
    >
      <p
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.6)',
          margin: '0 0 4px 0',
        }}
      >
        {label}
      </p>
      {payload.map((entry, index) => (
        <p
          key={index}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
            color: entry.color,
            margin: 0,
          }}
        >
          {entry.name}: {entry.value.toLocaleString('en-AU')}
          {entry.name === 'Bounce rate' ? '%' : ''}
        </p>
      ))}
    </div>
  );
}

// --- Component ---

export function TrafficAreaChart() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '4px',
        padding: '24px',
      }}
    >
      <h3
        style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.4)',
          margin: '0 0 16px 0',
          fontWeight: 400,
        }}
      >
        Daily site sessions — March 2026
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={dailyTraffic} style={{ background: '#050505' }}>
          <defs>
            <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SPECTRAL.primary} stopOpacity={0.15} />
              <stop offset="100%" stopColor={SPECTRAL.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            horizontal={true}
            vertical={false}
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            dataKey="date"
            tick={{
              fill: 'rgba(255,255,255,0.6)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
            }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            tick={{
              fill: 'rgba(255,255,255,0.6)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
            }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
            label={{
              value: 'Sessions',
              angle: -90,
              position: 'insideLeft',
              fill: 'rgba(255,255,255,0.4)',
              style: { fontSize: 12 },
            }}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${(value / 1000).toFixed(1)}K` : String(value)
            }
          />
          <Tooltip content={<TrafficTooltip />} />
          <Area
            name="Sessions"
            type="monotoneX"
            dataKey="sessions"
            fill="url(#sessionGradient)"
            stroke={SPECTRAL.primary}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
```
