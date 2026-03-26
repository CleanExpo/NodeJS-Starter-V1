# Dashboard Patterns — Component Library Reference

> Extracted from `SKILL.md`. Component library at `apps/web/components/status-command-centre/`.

---

## Component Catalogue

### Main Components

| Component | Variants | Purpose |
|-----------|----------|---------|
| `StatusCommandCentre` | full, compact, minimal | Complete dashboard view with timeline and metrics |

### Data Display

| Component | Usage | Key Props |
|-----------|-------|-----------|
| `DataStrip` | Horizontal inline metrics bar | `metrics: Array<{ label, value, variant? }>` |
| `MetricTile` | Single stat with trend indicator | `label, value, trend, variant` |

DataStrip uses:
- JetBrains Mono (`font-mono`) for values
- `text-[10px] tracking-widest uppercase` for labels
- Pipe separators (`w-px bg-white/10`) between metrics
- Spectral glow on non-zero highlighted values
- Variants: `info=#00F5FF`, `success=#00FF88`, `warning=#FFB800`, `error=#FF4444`

### Visualisation

| Component | Usage | Key Props |
|-----------|-------|-----------|
| `ProgressOrb` | Circular progress indicator with glow | `progress, colour, size` |
| `ProgressRing` | Ring-style progress indicator | `progress, colour` |
| `StatusPulse` | Breathing status dot | `status, size` |
| `StatusBadge` | Text label with status colour | `status, label` |

### Activity

| Component | Usage | Key Props |
|-----------|-------|-----------|
| `AgentNode` | Timeline node for agent execution | `run, index` |
| `AgentActivityCard` | Detailed agent activity view | `agent, runs` |
| `ActivityTimeline` | Step-by-step timeline view | `steps` |
| `AgentThinkingIndicator` | Animated thinking state | `isThinking` |

### Utility

| Component | Usage | Key Props |
|-----------|-------|-----------|
| `NotificationStream` | Sidebar notification feed | `notifications` |
| `ElapsedTimer` | Live elapsed time counter | `startTime` |

---

## Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useElapsedTime` | Tracks elapsed time from a start timestamp | `elapsed: string` |
| `useCountdown` | Counts down to a target time | `remaining: string` |
| `useStatusTransitions` | Detects state changes, triggers animations | `transition: { from, to }` |
| `useStatusColourTransition` | Smooth colour interpolation on status change | `colour: string` |

---

## Utility Functions

| Function | Purpose | Format |
|----------|---------|--------|
| `formatElapsedAU` | Formats elapsed time in Australian style | "2m 34s" |
| `formatTimestampAU` | Formats timestamp in DD/MM/YYYY H:MM am/pm | "26/03/2026 2:30 pm" |
| `formatDateAU` | Formats date only | "26/03/2026" |
| `getAustralianTimezone` | Returns current AU timezone | "AEDT" or "AEST" |

---

## Spectral Colour Mapping

| Status | Colour | Hex | Animation |
|--------|--------|-----|-----------|
| `pending` | Slate | `hsl(220 14% 46%)` | Pulse (idle) |
| `in_progress` | Blue | `hsl(217 91% 60%)` | Spin (active) |
| `awaiting_verification` | Amber | `hsl(38 92% 50%)` | Pulse (active) |
| `verification_in_progress` | Amber | `hsl(38 92% 50%)` | Spin (active) |
| `verification_passed` | Green | `hsl(142 76% 36%)` | None (idle) |
| `verification_failed` | Red | `hsl(0 84% 60%)` | Pulse (urgent) |
| `completed` | Emerald | `#00FF88` | None (idle) |
| `failed` | Red | `#FF4444` | Pulse (urgent) |
| `blocked` | Slate | Muted | None (idle) |
| `escalated_to_human` | Magenta | `#FF00FF` | Pulse (urgent) |

Access: `getStatusConfig(status)` from `constants.ts`.

---

## Dashboard Page Structure

Every dashboard page follows this pattern:

```
1. Server Component wrapper (data fetch with fallback)
2. Header
   - Category label (text-[10px] tracking-[0.3em] uppercase text-white/30)
   - Page title (text-4xl font-extralight tracking-tight text-white)
   - DataStrip (inline metrics)
3. Content (wrapped in Suspense with LoadingSkeleton)
   - Timeline or orbital layout (never card grid)
4. Footer
   - Australian date format (font-mono text-[10px] text-white/20)
```

---

## Data Fetching Patterns

| Pattern | When | Implementation |
|---------|------|---------------|
| Server Component | Initial page load | `fetch()` with `cache: 'no-store'`, fallback data |
| Polling | Non-realtime pages | `setInterval(fetchMetrics, 30_000)` with cleanup |
| Supabase Realtime | Live dashboards | Channel subscription to `agent_runs` table |

Connection status states:
- **Connected**: Emerald breathing dot + "Live" label
- **Reconnecting**: Amber dot + "Reconnecting" label
- **Disconnected**: Red dot + "Offline" label

---

## Component Decision Matrix

| Need | Component |
|------|-----------|
| Inline metrics row | `DataStrip` |
| Single stat with trend | `MetricTile` |
| Agent execution status | `AgentNode` |
| Circular progress | `ProgressOrb` or `ProgressRing` |
| Status dot | `StatusPulse` |
| Status label | `StatusBadge` |
| Step timeline | `ActivityTimeline` |
| Notification sidebar | `NotificationStream` |
| Elapsed time counter | `ElapsedTimer` |
