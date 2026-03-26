# SL Dashboard Page — Template

> Scientific Luxury dashboard page template. Uses timeline layout, DataStrip metrics, OLED Black, and Framer Motion.

```tsx
import { Suspense } from 'react';
import { motion } from 'framer-motion';

// -- Types --
interface DashboardMetric {
  label: string;
  value: string | number;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

interface DashboardItem {
  id: string;
  title: string;
  status: string;
  timestamp: string;
  value?: string | number;
}

// -- Data Fetching (Server Component) --
const FALLBACK_DATA: DashboardItem[] = [];

async function fetchDashboardData(): Promise<DashboardItem[]> {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  try {
    const res = await fetch(`${backendUrl}/api/dashboard/data`, {
      cache: 'no-store',
    });
    if (!res.ok) return FALLBACK_DATA;
    return res.json();
  } catch {
    return FALLBACK_DATA;
  }
}

// -- Loading Skeleton --
function LoadingSkeleton() {
  return (
    <div className="space-y-8 px-8 py-8">
      {/* DataStrip skeleton */}
      <motion.div
        className="h-12 w-full rounded-sm bg-white/5"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      {/* Timeline skeleton */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="ml-8 h-24 rounded-sm bg-white/5"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

// -- Empty State --
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        className="h-3 w-3 rounded-full bg-white/20"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <h3 className="mt-4 text-xl font-light text-white">
        No data available
      </h3>
      <p className="mt-2 font-mono text-xs text-white/40">
        Data will appear here when available.
      </p>
    </div>
  );
}

// -- Timeline Node --
const VARIANT_COLOURS = {
  info: '#00F5FF',
  success: '#00FF88',
  warning: '#FFB800',
  error: '#FF4444',
  default: '#6B7280',
};

function TimelineNode({
  item,
  index,
}: {
  item: DashboardItem;
  index: number;
}) {
  const colour =
    VARIANT_COLOURS[item.status as keyof typeof VARIANT_COLOURS] ||
    VARIANT_COLOURS.default;
  const isActive = item.status === 'in_progress';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.19, 1, 0.22, 1],
      }}
      className="relative ml-8 rounded-sm border-[0.5px] border-white/[0.06] bg-white/[0.01] px-6 py-4"
    >
      {/* Status orb */}
      <div className="flex items-center gap-3">
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
        <h3 className="text-sm font-light text-white/90">{item.title}</h3>
      </div>

      <div className="mt-2 flex items-baseline gap-4">
        {item.value && (
          <span
            className="font-mono text-lg font-medium tabular-nums"
            style={{ color: colour }}
          >
            {item.value}
          </span>
        )}
        <span className="font-mono text-[10px] text-white/30">
          {item.timestamp}
        </span>
      </div>
    </motion.div>
  );
}

// -- DataStrip --
function DataStrip({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="flex items-center gap-8 border-[0.5px] border-white/[0.06] bg-white/[0.01] px-6 py-3">
      {metrics.map((metric, index) => (
        <div key={metric.label} className="flex items-center gap-2">
          {index > 0 && <div className="mr-6 h-4 w-px bg-white/10" />}
          <span className="text-[10px] uppercase tracking-widest text-white/30">
            {metric.label}
          </span>
          <span
            className="font-mono text-lg font-medium tabular-nums"
            style={{
              color:
                VARIANT_COLOURS[
                  metric.variant as keyof typeof VARIANT_COLOURS
                ] || '#00F5FF',
            }}
          >
            {metric.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// -- Dashboard Content --
function DashboardContent({ data }: { data: DashboardItem[] }) {
  if (data.length === 0) return <EmptyState />;

  return (
    <div className="relative pl-4">
      {/* Vertical Timeline Spine */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="absolute top-0 bottom-0 left-8 w-px origin-top
                   bg-gradient-to-b from-white/10 via-white/5 to-transparent"
      />
      {/* Timeline Nodes */}
      <div className="space-y-6">
        {data.map((item, index) => (
          <TimelineNode key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

// -- Page Component --
export default async function DashboardPage() {
  const data = await fetchDashboardData();

  const metrics: DashboardMetric[] = [
    { label: 'Total', value: data.length },
    {
      label: 'Active',
      value: data.filter((d) => d.status === 'in_progress').length,
      variant: 'info',
    },
    {
      label: 'Completed',
      value: data.filter((d) => d.status === 'completed').length,
      variant: 'success',
    },
    {
      label: 'Failed',
      value: data.filter((d) => d.status === 'failed').length,
      variant: 'error',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-8 py-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
          Real-Time Monitoring
        </p>
        <h1 className="text-4xl font-extralight tracking-tight text-white">
          Dashboard Title
        </h1>
        <div className="mt-4">
          <DataStrip metrics={metrics} />
        </div>
      </header>

      {/* Content */}
      <main className="px-8 py-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <DashboardContent data={data} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-8 py-4">
        <p className="font-mono text-[10px] text-white/20">
          {new Date().toLocaleDateString('en-AU')}
        </p>
      </footer>
    </div>
  );
}
```

## Checklist

- [x] OLED Black `bg-[#050505]` background
- [x] Timeline layout (not card grid)
- [x] DataStrip for summary metrics
- [x] `border-[0.5px] border-white/[0.06]` borders
- [x] `rounded-sm` only
- [x] `font-mono tabular-nums` for data values
- [x] `text-[10px] tracking-[0.3em] uppercase` for labels
- [x] Framer Motion for all animations
- [x] Staggered entry for timeline nodes
- [x] Breathing orb for active states
- [x] Loading skeleton matching layout
- [x] Empty state with breathing orb
- [x] Fallback data for server fetch
- [x] Australian date format in footer
