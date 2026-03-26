# Metric card — Generic

Single KPI display with trend indicator and delta. System fonts, publication-quality palette, works on both dark and light backgrounds. No Framer Motion dependency — uses CSS transitions.

```tsx
'use client';

import { useEffect, useState } from 'react';

// --- Types ---

interface MetricCardProps {
  label: string;
  value: number;
  previousValue: number;
  format: 'currency' | 'number' | 'percentage';
  prefix?: string;
  suffix?: string;
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

// --- Helpers ---

function formatValue(value: number, format: MetricCardProps['format']): string {
  switch (format) {
    case 'currency':
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
      return `$${value.toLocaleString('en-AU')}`;
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'number':
    default:
      return value.toLocaleString('en-AU');
  }
}

function getTrend(current: number, previous: number) {
  if (current === previous) return { direction: 'flat' as const, delta: 0 };
  const delta = ((current - previous) / previous) * 100;
  return {
    direction: current > previous ? ('up' as const) : ('down' as const),
    delta,
  };
}

function getTrendColour(direction: 'up' | 'down' | 'flat'): string {
  switch (direction) {
    case 'up':
      return PUBLICATION.positive;
    case 'down':
      return PUBLICATION.negative;
    case 'flat':
      return PUBLICATION.neutral;
  }
}

function getTrendArrow(direction: 'up' | 'down' | 'flat'): string {
  switch (direction) {
    case 'up':
      return '\u2191'; // up arrow
    case 'down':
      return '\u2193'; // down arrow
    case 'flat':
      return '\u2192'; // right arrow
  }
}

// --- Count-up hook ---

function useCountUp(target: number, duration: number = 500): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    let animationFrame: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    }

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return current;
}

// --- Component ---

export function MetricCard({
  label,
  value,
  previousValue,
  format,
  prefix,
  suffix,
}: MetricCardProps) {
  const animatedValue = useCountUp(value);
  const trend = getTrend(value, previousValue);
  const trendColour = getTrendColour(trend.direction);

  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: '4px',
        padding: '24px',
        minWidth: '200px',
        transition: 'box-shadow 300ms ease-out',
      }}
    >
      <p
        style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '12px',
          color: 'rgba(0,0,0,0.5)',
          margin: '0 0 8px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: MONO_FONT,
          fontSize: '32px',
          color: 'rgba(0,0,0,0.87)',
          margin: '0 0 8px 0',
          fontWeight: 600,
          lineHeight: 1.1,
        }}
      >
        {prefix}
        {formatValue(animatedValue, format)}
        {suffix}
      </p>
      <p
        style={{
          fontFamily: MONO_FONT,
          fontSize: '12px',
          color: trendColour,
          margin: 0,
        }}
      >
        {getTrendArrow(trend.direction)}{' '}
        {trend.direction === 'flat'
          ? 'No change'
          : `${trend.delta > 0 ? '+' : ''}${trend.delta.toFixed(1)}% vs. previous period`}
      </p>
    </div>
  );
}

// --- Usage example ---

/*
<MetricCard
  label="Monthly recurring revenue"
  value={204000}
  previousValue={189000}
  format="currency"
/>

<MetricCard
  label="Active users"
  value={12847}
  previousValue={11203}
  format="number"
/>

<MetricCard
  label="Conversion rate"
  value={3.2}
  previousValue={2.8}
  format="percentage"
/>
*/
```
