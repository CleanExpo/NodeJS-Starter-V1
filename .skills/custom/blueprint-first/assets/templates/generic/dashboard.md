# ASCII Blueprint Template: Dashboard (Generic)

> Portable dashboard wireframe. Replace with your design system tokens.

```
BLUEPRINT: Dashboard
═══════════════════════════════════════════════════════

DESKTOP LAYOUT (>= 1024px)
┌──────────┬──────────────────────────────────────────┐
│  SIDEBAR │  HEADER                                   │
│          │  ┌──────────────────────────────────────┐ │
│  Logo    │  │  H1: [Page Title]                     │ │
│          │  │  [Breadcrumb or label]                │ │
│  ────────│  └──────────────────────────────────────┘ │
│  Nav 1   │  METRICS ROW                              │
│  Nav 2*  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  Nav 3   │  │Stat 1│ │Stat 2│ │Stat 3│ │Stat 4│    │
│  Nav 4   │  └──────┘ └──────┘ └──────┘ └──────┘    │
│          ├──────────────────────────────────────────┤
│  ────────│  PRIMARY CONTENT                          │
│  [User]  │  ┌──────────────────────────────────────┐ │
│  [Logout]│  │  [Chart / Table / Timeline]           │ │
│          │  │  [Content area]                       │ │
│          │  └──────────────────────────────────────┘ │
│          ├──────────────────────────────────────────┤
│          │  FOOTER [date, version]                   │
└──────────┴──────────────────────────────────────────┘
  * = active nav state

TABLET LAYOUT (768-1023px)
  Sidebar: collapsible overlay
  Content: full width

MOBILE LAYOUT (< 768px)
┌───────────────────────────────┐
│  HEADER (compact)              │
├───────────────────────────────┤
│  METRICS (2-col or scrollable) │
├───────────────────────────────┤
│  PRIMARY CONTENT (full width)  │
├───────────────────────────────┤
│  BOTTOM NAV (4-5 items)        │
└───────────────────────────────┘

═══════════════════════════════════════════════════════
```
