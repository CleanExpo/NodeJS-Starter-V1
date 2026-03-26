# Generic Dashboard Patterns

> Portable dashboard design and engineering patterns. No project-specific component or design system references.

---

## Dashboard Layout Principles

### 1. Metrics Summary Bar

Place key metrics in a horizontal bar at the top of the page. Each metric shows a label + value. Use separators between metrics rather than card containers.

### 2. Primary Content Area

The main content area should use one of these layouts:

| Layout | Best For |
|--------|---------|
| Timeline (vertical) | Activity feeds, event logs, sequential data |
| Split view (asymmetric) | Chart + detail panel, list + preview |
| Tabbed | Multiple data views of the same entity |
| Scrollable table | Dense tabular data |

Avoid equal-column card grids for primary content — they waste space and lack hierarchy.

### 3. Sidebar Navigation

- Fixed on desktop (collapsible)
- Overlay on tablet
- Bottom bar on mobile
- Active state clearly indicated

---

## Data Fetching Patterns

### Initial Load

Use server-side rendering or SSR for initial data. Always provide fallback data so the page renders even when the backend is unavailable.

```typescript
async function fetchData() {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return FALLBACK_DATA;
    return res.json();
  } catch {
    return FALLBACK_DATA;
  }
}
```

### Polling

For non-realtime data, poll at a reasonable interval (15-60 seconds). Always clean up intervals on component unmount.

```typescript
useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, 30_000);
  return () => clearInterval(interval);
}, []);
```

### Realtime

For live data, use WebSocket or server-sent events. Subscribe on mount, unsubscribe on unmount.

### Connection Status

Always display connection state to the user:
- **Connected**: Green indicator + "Live" label
- **Reconnecting**: Amber indicator + "Reconnecting"
- **Disconnected**: Red indicator + "Offline"

---

## Loading States

### Skeleton Loaders

Every dashboard page must show a loading skeleton that matches the final layout structure:

- Use low-opacity background blocks matching the shape of final elements
- Animate with a breathing opacity effect
- Stagger delays for visual interest
- Never use spinners for page-level loading

### Empty States

When no data is available:

- Show a centred message with guidance
- Include a visual indicator (animated dot or icon)
- Provide a clear next action ("Run your first agent" or "Import data")

---

## Status Indicators

### Animated Dots

Use small animated dots for live status:
- Breathing animation (scale + opacity) for active states
- Static dot for idle/completed states
- Colour mapped to semantic meaning

### Colour Mapping

Define a central status-to-colour mapping. Never hardcode colours in components.

```typescript
const STATUS_COLOURS = {
  active: 'var(--colour-primary)',
  success: 'var(--colour-success)',
  warning: 'var(--colour-warning)',
  error: 'var(--colour-danger)',
  idle: 'var(--colour-neutral)',
};
```

---

## Animation Patterns

### Staggered Entry

List items should animate in with incremental delays:

```
Item 1: delay 0.0s
Item 2: delay 0.1s
Item 3: delay 0.2s
```

### State Transitions

When data changes state (e.g., "pending" to "completed"), animate the colour transition smoothly.

### Ambient Effects

For dashboards with active processes, show subtle ambient effects (background glow, breathing indicators) to communicate liveness.

---

## Responsive Strategy

| Breakpoint | Sidebar | Metrics | Content |
|-----------|---------|---------|---------|
| Desktop (>=1024px) | Fixed (240px) | Horizontal bar | Full layout |
| Tablet (768-1023px) | Overlay | Scrollable bar | Full width |
| Mobile (<768px) | Bottom nav | 2-col or scrollable | Stacked |

---

## Checklist for New Dashboards

### Layout
- [ ] Metrics summary at top (horizontal bar, not card grid)
- [ ] Primary content uses timeline, split, or table layout
- [ ] Sidebar navigation with active state indicator
- [ ] Responsive across desktop, tablet, mobile

### Data
- [ ] Server-side initial fetch with fallback data
- [ ] Polling or realtime subscription for live data
- [ ] Connection status indicator visible
- [ ] Loading skeleton matching final layout
- [ ] Empty state with guidance

### Animation
- [ ] Staggered entry for list items
- [ ] Breathing animation for active indicators
- [ ] Smooth state transitions
- [ ] Physics-based easing (not linear)

### Accessibility
- [ ] Keyboard navigation for all interactive elements
- [ ] Screen reader labels on status indicators
- [ ] Sufficient colour contrast
- [ ] Focus management on data updates
