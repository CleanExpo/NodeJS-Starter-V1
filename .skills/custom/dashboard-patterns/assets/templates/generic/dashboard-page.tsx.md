# Generic Dashboard Page — Template

> Portable dashboard page template. No project-specific design system. Replace tokens with your own.

```tsx
import { Suspense } from 'react';
import { motion } from 'framer-motion';

// -- Types --
interface Metric {
  label: string;
  value: string | number;
  colour?: string;
}

interface ListItem {
  id: string;
  title: string;
  status: string;
  timestamp: string;
  value?: string | number;
}

// -- Data Fetching --
async function fetchData(): Promise<ListItem[]> {
  const baseUrl = process.env.API_URL || 'http://localhost:8000';
  try {
    const res = await fetch(`${baseUrl}/api/data`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// -- Loading Skeleton --
function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-8">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-20 rounded-sm bg-white/5"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

// -- Empty State --
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <motion.div
        className="h-3 w-3 rounded-full bg-white/20"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <h3 className="mt-4 text-lg font-light text-white/80">
        No data available
      </h3>
      <p className="mt-1 text-sm text-white/40">
        Data will appear here when available.
      </p>
    </div>
  );
}

// -- Metrics Bar --
function MetricsBar({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="flex items-center gap-6 border border-white/[0.08] bg-white/[0.02] px-6 py-3 rounded-sm">
      {metrics.map((metric, index) => (
        <div key={metric.label} className="flex items-baseline gap-2">
          {index > 0 && <div className="mr-4 h-4 w-px bg-white/10" />}
          <span className="text-xs uppercase tracking-wider text-white/40">
            {metric.label}
          </span>
          <span
            className="font-mono text-lg font-medium tabular-nums"
            style={{ color: metric.colour || 'rgba(255,255,255,0.8)' }}
          >
            {metric.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// -- List Item --
function DataRow({ item, index }: { item: ListItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="rounded-sm border border-white/[0.08] bg-white/[0.02] px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-light text-white/90">{item.title}</h3>
        <span className="text-xs text-white/40">{item.timestamp}</span>
      </div>
      {item.value && (
        <p className="mt-1 font-mono text-lg font-medium text-white/80">
          {item.value}
        </p>
      )}
    </motion.div>
  );
}

// -- Dashboard Content --
function DashboardContent({ data }: { data: ListItem[] }) {
  if (data.length === 0) return <EmptyState />;

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <DataRow key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}

// -- Page --
export default async function DashboardPage() {
  const data = await fetchData();

  const metrics: Metric[] = [
    { label: 'Total', value: data.length },
    { label: 'Active', value: data.filter((d) => d.status === 'active').length },
    { label: 'Done', value: data.filter((d) => d.status === 'done').length },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-white/[0.08] p-8">
        <h1 className="text-3xl font-light text-white">Dashboard</h1>
        <div className="mt-4">
          <MetricsBar metrics={metrics} />
        </div>
      </header>

      <main className="p-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <DashboardContent data={data} />
        </Suspense>
      </main>

      <footer className="border-t border-white/[0.08] p-4">
        <p className="text-xs text-white/30">
          {new Date().toLocaleDateString()}
        </p>
      </footer>
    </div>
  );
}
```

## Customisation Points

- Replace `bg-[#0A0A0A]` with your background token
- Replace `border-white/[0.08]` with your border token
- Replace `rounded-sm` with your chosen border radius
- Add status colours via your theme config
- Replace Framer Motion with CSS transitions if not using Framer
- Adjust MetricsBar to match your metrics component
- Add sidebar navigation per your layout requirements
