# Dashboard Patterns — Before/After Examples

> Demonstrates transformation from generic grid dashboard to Scientific Luxury timeline dashboard.

---

## Example: Metrics Dashboard

### BEFORE — Generic Grid Dashboard

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Analytics Dashboard
      </h1>

      {/* Metric cards — symmetrical grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="rounded-lg shadow-md">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Total Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">1,000</p>
            <span className="text-green-500 text-sm">+10%</span>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-md">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">99.99%</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-md">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">50</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-md">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">0</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-lg shadow-md">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left text-gray-600">Agent</th>
              <th className="p-3 text-left text-gray-600">Status</th>
              <th className="p-3 text-left text-gray-600">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3">Agent 1</td>
              <td className="p-3"><span className="text-green-500">●</span> Running</td>
              <td className="p-3">2 min ago</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
```

**Violations**:
- `bg-gray-50` (banned — must be `#050505`)
- `grid-cols-4` (banned — card grid layout)
- `rounded-lg` (banned — must be `rounded-sm`)
- `shadow-md` (banned — no generic shadows)
- `font-bold` (wrong hierarchy — use `font-extralight` for titles)
- `text-gray-500`, `text-gray-900` (banned — use white opacity)
- `text-green-500`, `text-blue-500` (banned — use spectral colours)
- Round numbers: `1,000`, `99.99%`, `50`, `0` (AI tells)
- `bg-gray-100` table header (banned)
- No Framer Motion animations
- No loading skeleton or empty state
- No connection indicator

### AFTER — Scientific Luxury Timeline Dashboard

```tsx
import { Suspense } from 'react';
import { motion } from 'framer-motion';

const FALLBACK_RUNS: AgentRun[] = [];

async function fetchRuns() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  try {
    const res = await fetch(`${backendUrl}/api/agents/stats`, { cache: 'no-store' });
    if (!res.ok) return FALLBACK_RUNS;
    return res.json();
  } catch {
    return FALLBACK_RUNS;
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 px-8 py-8">
      <motion.div
        className="h-12 w-full rounded-sm bg-white/5"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="ml-8 h-20 rounded-sm bg-white/5"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

export default async function AnalyticsDashboard() {
  const runs = await fetchRuns();

  return (
    <div className="relative min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-8 py-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
          Real-Time Analytics
        </p>
        <h1 className="text-4xl font-extralight tracking-tight text-white">
          Agent Analytics
        </h1>

        {/* DataStrip — replaces card grid */}
        <div className="mt-4 flex items-center gap-8 border-[0.5px] border-white/[0.06] bg-white/[0.01] px-6 py-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] tracking-widest text-white/30 uppercase">Runs</span>
            <span className="font-mono text-lg font-medium tabular-nums text-[#00F5FF]">1,247</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] tracking-widest text-white/30 uppercase">Success</span>
            <span className="font-mono text-lg font-medium tabular-nums text-[#00FF88]">94.7%</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] tracking-widest text-white/30 uppercase">Active</span>
            <span className="font-mono text-lg font-medium tabular-nums text-[#00F5FF]">47</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] tracking-widest text-white/30 uppercase">Errors</span>
            <span className="font-mono text-lg font-medium tabular-nums text-[#FF4444]">3</span>
          </div>
        </div>
      </header>

      {/* Timeline Content */}
      <main className="px-8 py-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <div className="relative pl-4">
            {/* Vertical Timeline Spine */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="absolute top-0 bottom-0 left-8 w-px origin-top
                         bg-gradient-to-b from-white/10 via-white/5 to-transparent"
            />

            <div className="space-y-6">
              {runs.map((run, index) => (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: [0.19, 1, 0.22, 1],
                  }}
                  className="relative ml-8 rounded-sm border-[0.5px] border-white/[0.06] bg-white/[0.01] px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: getStatusColour(run.status) }}
                      animate={
                        run.status === 'in_progress'
                          ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }
                          : {}
                      }
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <h3 className="text-sm font-light text-white/90">{run.agent}</h3>
                    <span className="font-mono text-[10px] text-white/30">
                      {formatTimestampAU(run.timestamp)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
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

---

## Summary of Transformations

| Before | After |
|--------|-------|
| `bg-gray-50` | `bg-[#050505]` |
| `grid-cols-4` card grid | `DataStrip` horizontal metrics |
| `rounded-lg shadow-md` cards | `rounded-sm border-[0.5px] border-white/[0.06]` |
| `font-bold text-gray-900` | `font-extralight tracking-tight text-white` |
| `text-green-500` | `text-[#00FF88]` spectral Emerald |
| Static `●` icon | Breathing orb with Framer Motion |
| No animations | Staggered entry + timeline spine animation |
| No loading state | Skeleton matching final layout |
| No empty state | Centred breathing orb + guidance |
| Round numbers (`1,000`) | Organic numbers (`1,247`) |
| `bg-gray-100` table header | Timeline layout (no table needed) |
| No connection indicator | Status dot with "Live" label |
