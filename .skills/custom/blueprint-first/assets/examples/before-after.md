# Blueprint First — Before/After Examples

> Demonstrates the difference between code-first and blueprint-first workflows.

---

## Example: Building an Analytics Dashboard

### BEFORE — Code-First Workflow

```
User: "Build an analytics dashboard"

Agent: "I'll create the analytics dashboard now."

[Agent writes 280 lines of JSX immediately]

// AnalyticsDashboard.tsx — first attempt
export default function AnalyticsDashboard() {
  return (
    <div className="grid grid-cols-4 gap-4 p-8">
      <Card><h3>Total Users</h3><p>1,234</p></Card>
      <Card><h3>Revenue</h3><p>$50,000</p></Card>
      <Card><h3>Active</h3><p>456</p></Card>
      <Card><h3>Errors</h3><p>12</p></Card>
      <div className="col-span-4">
        <Chart data={revenueData} />
      </div>
      <div className="col-span-4">
        <Table columns={columns} data={events} />
      </div>
    </div>
  );
}

User: "No, I wanted a timeline layout, not cards. And the chart
       should be on the left with a sidebar on the right."

Agent: [Rewrites 200 lines]

User: "Actually, can we have the metrics as a horizontal strip
       instead of a grid?"

Agent: [Rewrites another 150 lines — third attempt]
```

**Total cost**: ~630 lines of code written, ~430 discarded. Three full revision cycles.

### AFTER — Blueprint-First Workflow

```
User: "Build an analytics dashboard"

Agent: "Before writing any code, here is the layout blueprint:"

BLUEPRINT: Analytics Dashboard
═══════════════════════════════════════════════════════

DESKTOP LAYOUT
┌──────────┬──────────────────────────────────────────┐
│  SIDEBAR │  HEADER                                   │
│          │  p: Real-Time Analytics                    │
│  Overview│  H1: Analytics Dashboard                   │
│  Revenue*│  DATASTRIP [Active | Done | Failed]        │
│  Users   ├──────────────────────────────────────────┤
│  Events  │  TIMELINE CONTENT                         │
│          │  │ Revenue trend (last 30 days)            │
│          │  │  └─ [Line chart — Framer Motion]       │
│          │  │ Recent events table                     │
│          │  │  └─ [Sortable, paginated]               │
│          ├──────────────────────────────────────────┤
│          │  FOOTER [DD/MM/YYYY]                       │
└──────────┴──────────────────────────────────────────┘

═══════════════════════════════════════════════════════
Does this match your vision? Reply "approved" or describe changes.

User: "Move the chart to the left side, and make the timeline
       vertical instead of horizontal."

Agent: [Revises ASCII — changes 3 lines]

Updated:
│          │  CONTENT (60/40 split)                    │
│          │  ┌──────────────────┐ ┌──────────────┐   │
│          │  │ Chart [flex-[3]] │ │ Timeline     │   │
│          │  │ Revenue trend    │ │ [flex-[2]]   │   │
│          │  │ (30-day line)    │ │ Vertical     │   │
│          │  │                  │ │ spine + nodes│   │
│          │  └──────────────────┘ └──────────────┘   │

User: "approved"

Agent: [Generates implementation spec, then writes code once — 280 lines]
```

**Total cost**: ~310 lines total (30 ASCII + 280 code). One revision in ASCII, zero code rewrites.

---

## Cost Comparison

| Metric | Code-First | Blueprint-First |
|--------|-----------|----------------|
| Lines written | ~630 | ~310 |
| Lines discarded | ~430 | ~3 (ASCII only) |
| Revision cycles | 3 | 1 (in ASCII) |
| Code rewrites | 2 full rewrites | 0 |
| Stakeholder review | Requires reading JSX | Reviews ASCII diagram |
| Final accuracy | 3rd attempt matches intent | 1st code attempt matches intent |

---

## Key Principle

The cost of revising an ASCII blueprint is near zero. The cost of revising implemented code is hundreds of lines and multiple cycles. Front-load the alignment work where it is cheapest.
