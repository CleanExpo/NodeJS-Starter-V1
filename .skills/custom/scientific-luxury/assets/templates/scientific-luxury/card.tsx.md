# DataCard — Scientific Luxury Card Template

> Replaces generic Bootstrap/Tailwind cards. Uses timeline-node aesthetic with single-pixel borders and breathing indicators.

```tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DataCardProps {
  title: string;
  label?: string;
  value?: string | number;
  status?: 'active' | 'success' | 'warning' | 'error' | 'idle';
  children?: React.ReactNode;
  index?: number;
  className?: string;
}

const STATUS_COLOURS = {
  active: '#00F5FF',
  success: '#00FF88',
  warning: '#FFB800',
  error: '#FF4444',
  idle: '#6B7280',
} as const;

export function DataCard({
  title,
  label,
  value,
  status = 'idle',
  children,
  index = 0,
  className,
}: DataCardProps) {
  const colour = STATUS_COLOURS[status];
  const isActive = status !== 'idle';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.19, 1, 0.22, 1],
      }}
      className={cn(
        'relative rounded-sm border-[0.5px] border-white/[0.06] bg-white/[0.01]',
        'px-6 py-5',
        className
      )}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: colour }}
          animate={
            isActive
              ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }
              : {}
          }
          transition={
            isActive
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : {}
          }
        />
        {label && (
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
            {label}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-light tracking-tight text-white/90">
        {title}
      </h3>

      {/* Value */}
      {value !== undefined && (
        <p
          className="mt-2 font-mono text-2xl font-medium tabular-nums"
          style={{ color: colour }}
        >
          {value}
        </p>
      )}

      {/* Children */}
      {children && <div className="mt-4">{children}</div>}

      {/* Active glow */}
      {isActive && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-sm"
          animate={{
            boxShadow: [
              `0 0 0 ${colour}00`,
              `0 0 20px ${colour}15`,
              `0 0 0 ${colour}00`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
```

## Usage

```tsx
<div className="space-y-4">
  <DataCard
    title="Agent Runs"
    label="Real-Time"
    value="47"
    status="active"
    index={0}
  />
  <DataCard
    title="Success Rate"
    label="Last 24 Hours"
    value="94.7%"
    status="success"
    index={1}
  />
  <DataCard
    title="Failed Tasks"
    label="Requires Attention"
    value="3"
    status="error"
    index={2}
  />
</div>
```

## Checklist

- [x] `rounded-sm` corners
- [x] `border-[0.5px] border-white/[0.06]` single-pixel border
- [x] `bg-white/[0.01]` OLED-safe elevated background
- [x] Breathing orb status indicator
- [x] Glow pulse for active states
- [x] Staggered entry via `index` prop
- [x] `font-mono` for data values with `tabular-nums`
- [x] `text-[10px] tracking-[0.3em] uppercase` for labels
- [x] Framer Motion only — no CSS transitions
