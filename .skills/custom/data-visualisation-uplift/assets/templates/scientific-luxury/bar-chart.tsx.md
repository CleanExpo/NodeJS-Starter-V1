# Bar chart — Scientific Luxury

Recharts horizontal bar chart for categorical comparison. OLED Black surface, spectral palette, sorted by value, JetBrains Mono axes, custom tooltip, Framer Motion entry animation.

```tsx
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';

// --- Types ---

interface DepartmentSpend {
  department: string;
  spend: number;
  status: 'on-track' | 'over-budget' | 'under-budget';
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: DepartmentSpend;
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

const statusColour: Record<DepartmentSpend['status'], string> = {
  'on-track': SPECTRAL.primary,
  'over-budget': SPECTRAL.negative,
  'under-budget': SPECTRAL.positive,
};

// --- Data ---

const departmentSpend: DepartmentSpend[] = [
  { department: 'Engineering', spend: 284000, status: 'on-track' },
  { department: 'Marketing', spend: 196000, status: 'over-budget' },
  { department: 'Sales', spend: 172000, status: 'on-track' },
  { department: 'Operations', spend: 148000, status: 'under-budget' },
  { department: 'Customer Success', spend: 124000, status: 'on-track' },
  { department: 'Product', spend: 118000, status: 'over-budget' },
  { department: 'HR & People', spend: 86000, status: 'under-budget' },
].sort((a, b) => b.spend - a.spend);

// --- Custom tooltip ---

function SpendTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const colour = statusColour[data.status];

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
        {data.department}
      </p>
      <p
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '13px',
          color: colour,
          margin: '0 0 2px 0',
        }}
      >
        ${data.spend.toLocaleString('en-AU')}
      </p>
      <p
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          color: colour,
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {data.status.replace('-', ' ')}
      </p>
    </div>
  );
}

// --- Component ---

export function DepartmentSpendChart() {
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
        Quarterly department spend (AUD)
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={departmentSpend}
          layout="vertical"
          style={{ background: '#050505' }}
          margin={{ left: 20, right: 20 }}
        >
          <CartesianGrid
            horizontal={true}
            vertical={false}
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            type="number"
            tick={{
              fill: 'rgba(255,255,255,0.6)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
            }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
            label={{
              value: 'Spend (AUD)',
              position: 'insideBottom',
              offset: -5,
              fill: 'rgba(255,255,255,0.4)',
              style: { fontSize: 12 },
            }}
            tickFormatter={(value: number) =>
              `$${(value / 1000).toFixed(0)}K`
            }
          />
          <YAxis
            type="category"
            dataKey="department"
            tick={{
              fill: 'rgba(255,255,255,0.6)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
            }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
            width={130}
          />
          <Tooltip content={<SpendTooltip />} cursor={false} />
          <Bar dataKey="spend" radius={[0, 4, 4, 0]} barSize={24}>
            {departmentSpend.map((entry, index) => (
              <Cell key={index} fill={statusColour[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
```
