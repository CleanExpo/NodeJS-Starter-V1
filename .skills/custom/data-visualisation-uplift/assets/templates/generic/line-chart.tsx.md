# Line chart — Generic

Recharts line chart component for time-series data. Publication-quality palette, system fonts, WCAG AA compliant, works on both dark and light backgrounds.

```tsx
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// --- Types ---

interface MonthlyRevenue {
  month: string;
  revenue: number;
  previousYear: number;
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

const monthlyRevenue: MonthlyRevenue[] = [
  { month: 'Jul 2025', revenue: 142000, previousYear: 118000 },
  { month: 'Aug 2025', revenue: 156000, previousYear: 125000 },
  { month: 'Sep 2025', revenue: 149000, previousYear: 131000 },
  { month: 'Oct 2025', revenue: 168000, previousYear: 142000 },
  { month: 'Nov 2025', revenue: 183000, previousYear: 155000 },
  { month: 'Dec 2025', revenue: 197000, previousYear: 168000 },
  { month: 'Jan 2026', revenue: 175000, previousYear: 148000 },
  { month: 'Feb 2026', revenue: 189000, previousYear: 157000 },
  { month: 'Mar 2026', revenue: 204000, previousYear: 170000 },
];

// --- Custom tooltip ---

function RevenueTooltip({ active, payload, label }: ChartTooltipProps) {
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
          {entry.name}: ${entry.value.toLocaleString('en-AU')}
        </p>
      ))}
    </div>
  );
}

// --- Component ---

export function RevenueLineChart() {
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
        Monthly revenue — current vs. previous year
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={monthlyRevenue}>
          <CartesianGrid
            horizontal={true}
            vertical={false}
            stroke="rgba(0,0,0,0.08)"
          />
          <XAxis
            dataKey="month"
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
              value: 'Revenue ($)',
              angle: -90,
              position: 'insideLeft',
              fill: 'rgba(0,0,0,0.5)',
              style: { fontSize: 12 },
            }}
            tickFormatter={(value: number) =>
              `$${(value / 1000).toFixed(0)}K`
            }
          />
          <Tooltip content={<RevenueTooltip />} />
          <Line
            name="Current year"
            type="monotoneX"
            dataKey="revenue"
            stroke={PUBLICATION.primary}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: PUBLICATION.primary }}
          />
          <Line
            name="Previous year"
            type="monotoneX"
            dataKey="previousYear"
            stroke={PUBLICATION.neutral}
            strokeWidth={1.5}
            strokeDasharray="6 4"
            dot={false}
            activeDot={{ r: 4, fill: PUBLICATION.neutral }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```
