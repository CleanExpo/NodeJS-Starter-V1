# Area chart — Generic

Recharts area chart for volume/accumulation data. Publication-quality palette, system fonts, WCAG AA compliant, works on both dark and light backgrounds.

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

const PUBLICATION = {
  primary: '#4E79A7',
  positive: '#59A14F',
  warning: '#EDC949',
  negative: '#E15759',
  neutral: '#9C9C9C',
  accent: '#B07AA1',
} as const;

const MONO_FONT = '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';

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
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: '4px',
        padding: '8px 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <p
        style={{
          fontFamily: MONO_FONT,
          fontSize: '11px',
          color: 'rgba(0,0,0,0.5)',
          margin: '0 0 4px 0',
        }}
      >
        {label}
      </p>
      {payload.map((entry, index) => (
        <p
          key={index}
          style={{
            fontFamily: MONO_FONT,
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
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: '4px',
        padding: '24px',
      }}
    >
      <h3
        style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          color: 'rgba(0,0,0,0.5)',
          margin: '0 0 16px 0',
          fontWeight: 400,
        }}
      >
        Daily site sessions — March 2026
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={dailyTraffic}>
          <defs>
            <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PUBLICATION.primary} stopOpacity={0.15} />
              <stop offset="100%" stopColor={PUBLICATION.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            horizontal={true}
            vertical={false}
            stroke="rgba(0,0,0,0.08)"
          />
          <XAxis
            dataKey="date"
            tick={{
              fill: 'rgba(0,0,0,0.6)',
              fontFamily: MONO_FONT,
              fontSize: 11,
            }}
            axisLine={{ stroke: 'rgba(0,0,0,0.15)' }}
            tickLine={false}
          />
          <YAxis
            tick={{
              fill: 'rgba(0,0,0,0.6)',
              fontFamily: MONO_FONT,
              fontSize: 11,
            }}
            axisLine={{ stroke: 'rgba(0,0,0,0.15)' }}
            tickLine={false}
            label={{
              value: 'Sessions',
              angle: -90,
              position: 'insideLeft',
              fill: 'rgba(0,0,0,0.5)',
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
            stroke={PUBLICATION.primary}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```
