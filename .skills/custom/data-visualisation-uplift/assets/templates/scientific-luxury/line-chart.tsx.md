# Line chart — Scientific Luxury

Recharts line chart component for time-series data. OLED Black surface, spectral palette, JetBrains Mono axes, custom tooltip, Framer Motion entry animation.

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
import { motion } from 'framer-motion';

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

const SPECTRAL = {
  primary: '#00F5FF',
  positive: '#00FF88',
  warning: '#FFB800',
  negative: '#FF4444',
  neutral: 'rgba(255,255,255,0.4)',
  accent: '#FF00FF',
} as const;

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
          {entry.name}: ${entry.value.toLocaleString('en-AU')}
        </p>
      ))}
    </div>
  );
}

// --- Component ---

export function RevenueLineChart() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
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
        Monthly revenue — current vs. previous year
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={monthlyRevenue} style={{ background: '#050505' }}>
          <CartesianGrid
            horizontal={true}
            vertical={false}
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            dataKey="month"
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
              value: 'Revenue (AUD)',
              angle: -90,
              position: 'insideLeft',
              fill: 'rgba(255,255,255,0.4)',
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
            stroke={SPECTRAL.primary}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: SPECTRAL.primary }}
          />
          <Line
            name="Previous year"
            type="monotoneX"
            dataKey="previousYear"
            stroke={SPECTRAL.neutral}
            strokeWidth={1.5}
            strokeDasharray="6 4"
            dot={false}
            activeDot={{ r: 4, fill: SPECTRAL.neutral }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
```
