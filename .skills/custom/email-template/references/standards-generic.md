# Email Template -- Generic Standards

> Portable email template standards applicable to any project. Framework-agnostic, design-system-agnostic.

---

## Principle

Transactional emails must use table-based layout, inline styles, and preview tooling. Email clients have inconsistent CSS support -- never rely on modern CSS features.

---

## Layout Rules

| Rule | Reason |
|------|--------|
| Use `<table>` for layout | Outlook uses Word's HTML renderer; Flexbox/Grid unsupported |
| Inline all styles | Most clients strip `<style>` blocks from `<head>` |
| Max width 600px | Standard email viewport width |
| Include `<Preview>` text | Snippet shown in inbox before opening |
| Add `alt` to all images | Many clients block images by default |

---

## Template Composition

Every email template should have:

1. **Base layout**: HTML, Head, Preview, Body, Container
2. **Header**: Brand identity and title
3. **Content**: Template-specific content
4. **Footer**: Unsubscribe link, business address, legal text

---

## Sending Pattern

```
1. Build template as React component (or HTML string)
2. Preview in dev server
3. Render to HTML string
4. Send via provider API (Resend, SendGrid, SES, SMTP)
5. Log result with structured logging
```

---

## Provider Selection

| Provider | Best For |
|----------|----------|
| Resend | React Email native, simple API, developer-friendly |
| SendGrid | Enterprise, high volume, advanced analytics |
| AWS SES | Cost-effective, already on AWS |
| SMTP | Self-hosted, full control, no vendor lock-in |

---

## Environment Configuration

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Provider API key |
| `EMAIL_FROM` | Default sender address |
| `REPORT_EMAIL_RECIPIENTS` | Comma-separated recipient list |

Never hardcode recipient addresses. Use environment variables for per-environment configuration.

---

## Testing

1. **Visual preview**: Use React Email dev server or equivalent
2. **Programmatic render**: Render to HTML string and assert on content
3. **Cross-client testing**: Test in Outlook, Gmail, Apple Mail at minimum
4. **Accessibility**: Verify alt text, heading structure, link text

---

## Checklist

- [ ] Table-based layout (no CSS Grid/Flexbox)
- [ ] Inline styles (no external `<style>` blocks)
- [ ] All images have descriptive `alt` attributes
- [ ] Preview text set for inbox snippet
- [ ] Recipients from environment variables
- [ ] Previewed in dev server before deployment
- [ ] Error handling with structured logging
- [ ] Dates in locale-appropriate format
