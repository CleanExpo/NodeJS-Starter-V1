# Report Template - HTML (Scientific Luxury)

HTML report template with Scientific Luxury styling: OLED Black background, spectral colours, system fonts, sharp corners.

---

## Template

```html
<!DOCTYPE html>
<html lang="en-AU">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{report.title}</title>
  <style>
    /* Scientific Luxury Design System */
    :root {
      --sl-bg: #050505;
      --sl-surface: #0a0a0a;
      --sl-border: #1a1a1a;
      --sl-text: #e0e0e0;
      --sl-text-muted: #808080;
      --sl-cyan: #00F5FF;
      --sl-emerald: #00FF88;
      --sl-amber: #FFB800;
      --sl-red: #FF4444;
      --sl-magenta: #FF00FF;
      --sl-radius: 2px; /* rounded-sm equivalent */
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: var(--sl-bg);
      color: var(--sl-text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
    }

    h1 {
      color: var(--sl-cyan);
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
      letter-spacing: -0.02em;
    }

    h2 {
      color: var(--sl-text);
      font-size: 1.1rem;
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--sl-border);
    }

    .subtitle {
      color: var(--sl-text-muted);
      font-size: 0.85rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      background: var(--sl-surface);
      border: 1px solid var(--sl-border);
      border-radius: var(--sl-radius);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .status-pass { color: var(--sl-emerald); }
    .status-warning { color: var(--sl-amber); }
    .status-fail { color: var(--sl-red); }
    .status-critical { color: var(--sl-magenta); }

    .score {
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.04em;
    }

    .score-label {
      color: var(--sl-text-muted);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }

    th {
      text-align: left;
      color: var(--sl-text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid var(--sl-border);
    }

    td {
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid var(--sl-border);
      font-size: 0.875rem;
    }

    tr:hover { background: rgba(255, 255, 255, 0.02); }

    .findings-list {
      list-style: none;
      padding: 0;
    }

    .findings-list li {
      padding: 0.5rem 0;
      padding-left: 1rem;
      border-left: 2px solid var(--sl-cyan);
      margin-bottom: 0.5rem;
    }

    .actions-list {
      list-style: none;
      padding: 0;
      counter-reset: action-counter;
    }

    .actions-list li {
      padding: 0.5rem 0;
      padding-left: 1.5rem;
      counter-increment: action-counter;
      position: relative;
    }

    .actions-list li::before {
      content: counter(action-counter);
      position: absolute;
      left: 0;
      color: var(--sl-amber);
      font-weight: 600;
    }

    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid var(--sl-border);
      color: var(--sl-text-muted);
      font-size: 0.75rem;
    }

    @media (max-width: 640px) {
      body { padding: 1rem; }
      .score { font-size: 2rem; }
    }
  </style>
</head>
<body>
  <h1>{report.title}</h1>
  <p class="subtitle">Generated: {DD/MM/YYYY HH:mm AEST} | Design System: Scientific Luxury</p>

  <div class="summary-card">
    <div class="score-label">Overall Score</div>
    <div class="score status-{status}">{score}/100</div>
    <div class="status-{status}" style="margin-top: 0.5rem; font-weight: 600;">
      {OVERALL_STATUS}
    </div>
  </div>

  <h2>Key Findings</h2>
  <ul class="findings-list">
    <li>{finding 1}</li>
    <li>{finding 2}</li>
  </ul>

  <h2>Immediate Actions</h2>
  <ol class="actions-list">
    <li>{action 1}</li>
    <li>{action 2}</li>
  </ol>

  <!-- Repeat for each section -->
  <h2>{section.title}</h2>
  <p><strong>Status:</strong> <span class="status-{section.status}">{section.status}</span></p>
  {section.content as HTML}

  <div class="footer">
    Report ID: {id} | Generator: v{version} | Generation time: {ms}ms | Locale: en-AU
  </div>
</body>
</html>
```

---

## Colour Mapping

| Status | CSS Class | Colour | Hex |
|--------|-----------|--------|-----|
| Pass | `.status-pass` | Emerald | `#00FF88` |
| Warning | `.status-warning` | Amber | `#FFB800` |
| Fail | `.status-fail` | Red | `#FF4444` |
| Critical | `.status-critical` | Magenta | `#FF00FF` |
| Active/Info | — | Cyan | `#00F5FF` |

---

## Usage Notes

- All CSS is inline (no external stylesheets) for standalone rendering
- Background is OLED Black (`#050505`) with surface cards at `#0a0a0a`
- Border radius is `2px` (equivalent to `rounded-sm`)
- No CSS transitions — Framer Motion is the animation standard (HTML reports are static)
- Responsive at 640px breakpoint for mobile rendering
- System font stack for consistent rendering across platforms
