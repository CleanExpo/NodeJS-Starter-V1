# Dashboard Patterns — Anti-Patterns Reference

> Extracted from `SKILL.md` §Anti-Patterns, §BANNED: Card Grid, and §The Three Laws of Dashboards.

---

## Anti-Pattern 1: Card Grid Layout (`grid-cols-2` / `grid-cols-4`)

**Why it fails**: Violates the first law of dashboards ("Timeline, never grid") and the Scientific Luxury layout rules.

```tsx
// REJECTED
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <Card>
    <h3>Total Users</h3>
    <p className="text-3xl font-bold">1,234</p>
  </Card>
  <Card>
    <h3>Revenue</h3>
    <p className="text-3xl font-bold">$50,000</p>
  </Card>
</div>

// CORRECT — DataStrip for metrics
<DataStrip
  metrics={[
    { label: 'Total', value: runs.length },
    { label: 'Active', value: activeRuns.length, variant: 'info' },
    { label: 'Completed', value: completedRuns.length, variant: 'success' },
    { label: 'Failed', value: failedRuns.length, variant: 'error' },
  ]}
/>

// CORRECT — Timeline for content
<div className="relative pl-4">
  <motion.div
    initial={{ scaleY: 0 }}
    animate={{ scaleY: 1 }}
    transition={{ delay: 0.3, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
    className="absolute top-0 bottom-0 left-8 w-px origin-top
               bg-gradient-to-b from-white/10 via-white/5 to-transparent"
  />
  <div className="space-y-8">
    {runs.map((run, index) => (
      <AgentNode key={run.id} run={run} index={index} />
    ))}
  </div>
</div>
```

---

## Anti-Pattern 2: Standard `<Card>` with `rounded-lg`

**Why it fails**: Wrong corners, wrong aesthetic. `rounded-lg` is banned by the Scientific Luxury design system.

```tsx
// REJECTED
<Card className="rounded-lg bg-white shadow-md p-6">
  <CardTitle>Agent Status</CardTitle>
  <CardContent>Running</CardContent>
</Card>

// CORRECT
<div className="rounded-sm border-[0.5px] border-white/[0.06] bg-white/[0.01] p-6">
  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Agent Status</p>
  <span className="font-mono text-lg text-[#00F5FF]">Running</span>
</div>
```

---

## Anti-Pattern 3: CSS Transitions (`transition: all 0.3s linear`)

**Why it fails**: Banned by Bezier (Council of Logic). Linear motion is mechanical and lifeless.

```tsx
// REJECTED
<div className="transition-all duration-300 ease-linear hover:bg-gray-100">
  Dashboard card
</div>

// CORRECT — Framer Motion with physics easing
<motion.div
  whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
  transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
>
  Dashboard element
</motion.div>
```

---

## Anti-Pattern 4: White/Light Background Dashboards

**Why it fails**: Violates the OLED Black requirement. Every dashboard surface must use `#050505`.

```tsx
// REJECTED
<div className="min-h-screen bg-white">
  <div className="bg-gray-50 p-8">Dashboard content</div>
</div>

// CORRECT
<div className="min-h-screen bg-[#050505]">
  <div className="px-8 py-8">Dashboard content</div>
</div>
```

---

## Anti-Pattern 5: No Loading Skeleton

**Why it fails**: Causes layout shift when data loads. Skeletons must match the final layout structure.

```tsx
// REJECTED — no loading state or generic spinner
{isLoading ? <Spinner /> : <DashboardContent />}

// CORRECT — skeleton matching final layout
function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <motion.div
        className="h-10 w-64 rounded-sm bg-white/5"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.div
        className="h-48 w-full rounded-sm bg-white/5"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      />
    </div>
  );
}
```

---

## Anti-Pattern 6: No Connection Indicator

**Why it fails**: Users cannot tell if displayed data is live, stale, or disconnected.

```tsx
// REJECTED — no connection status visible
<DashboardContent data={data} />

// CORRECT — connection indicator always present
<div className="flex items-center gap-2">
  <motion.span
    className="h-1.5 w-1.5 rounded-full"
    style={{ backgroundColor: isConnected ? '#00FF88' : '#FF4444' }}
    animate={isConnected ? { opacity: [1, 0.4, 1] } : {}}
    transition={{ duration: 2, repeat: Infinity }}
  />
  <span className="font-mono text-[10px] text-white/40">
    {isConnected ? 'Live' : 'Offline'}
  </span>
</div>
```

---

## Anti-Pattern 7: Hardcoded Status Colours

**Why it fails**: Drift from the spectral palette. All status colours must come from the central config.

```tsx
// REJECTED — hardcoded colours
<span style={{ color: status === 'completed' ? 'green' : 'red' }}>
  {status}
</span>

// CORRECT — centralised config
import { getStatusConfig } from './constants';
const config = getStatusConfig(status);
<span style={{ color: config.colour.primary }}>{status}</span>
```

---

## Anti-Pattern 8: `setInterval` Without Cleanup

**Why it fails**: Memory leak when component unmounts. Intervals persist and pile up.

```tsx
// REJECTED — no cleanup
useEffect(() => {
  setInterval(fetchMetrics, 30_000);
}, []);

// CORRECT — cleanup on unmount
useEffect(() => {
  fetchMetrics();
  const interval = setInterval(fetchMetrics, 30_000);
  return () => clearInterval(interval);
}, []);
```

---

## The Three Laws (Summary)

| Law | Rule | Violation |
|-----|------|-----------|
| 1. Timeline, never grid | No `grid-cols-2`/`grid-cols-4` | Use timelines, DataStrips, orbital arrangements |
| 2. Spectral, never static | Every status has spectral colour + animation | No grey placeholders, no hardcoded colours |
| 3. Real-time, never stale | Live data via Realtime or 30s polling | Always show connection status |
