# Bar chart — Generic

Recharts horizontal bar chart for categorical comparison. Publication-quality palette, system fonts, WCAG AA compliant, works on both dark and light backgrounds.

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

const PUBLICATION = {
  primary: '#4E79A7',
  positive: '#59A14F',
  warning: '#EDC949',
  negative: '#E15759',
  neutral: '#9C9C9C',
  accent: '#B07AA1',
} as const;

const MONO_FONT = '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';

const statusColour: Record<DepartmentSpend['status'], string> = {
  'on-track': PUBLICATION.primary,
  'over-budget': PUBLICATION.negative,
  'under-budget': PUBLICATION.positive,
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
        {data.department}
      </p>
      <p
        style={{
          fontFamily: MONO_FONT,
          fontSize: '13px',
          color: colour,
          margin: '0 0 2px 0',
        }}
      >
        ${data.spend.toLocaleString('en-AU')}
      </p>
      <p
        style={{
          fontFamily: MONO_FONT,
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
        Quarterly department spend
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={departmentSpend}
          layout="vertical"
          margin={{ left: 20, right: 20 }}
        >
          <CartesianGrid
            horizontal={true}
            vertical={false}
            stroke="rgba(0,0,0,0.08)"
          />
          <XAxis
            type="number"
            tick={{
              fill: 'rgba(0,0,0,0.6)',
              fontFamily: MONO_FONT,
              fontSize: 11,
            }}
            axisLine={{ stroke: 'rgba(0,0,0,0.15)' }}
            tickLine={false}
            label={{
              value: 'Spend ($)',
              position: 'insideBottom',
              offset: -5,
              fill: 'rgba(0,0,0,0.5)',
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
              fill: 'rgba(0,0,0,0.6)',
              fontFamily: MONO_FONT,
              fontSize: 11,
            }}
            axisLine={{ stroke: 'rgba(0,0,0,0.15)' }}
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
    </div>
  );
}
```
