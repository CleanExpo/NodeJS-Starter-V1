# Email Template -- Scientific Luxury Standards

> Domain-specific standards for transactional emails in NodeJS-Starter-V1. React Email + Resend, OLED dark theme, inline styles, Australian locale formatting.

---

## Stack

| Tool | Purpose |
|------|---------|
| `@react-email/components` | Component library for email templates |
| `react-email` | Dev server for previewing templates |
| `resend` | Email delivery API |

---

## File Structure

```
apps/web/
  emails/                      # Email templates
    components/                # Shared components
      email-header.tsx         # Brand header
      email-footer.tsx         # Unsubscribe + address
      email-button.tsx         # CTA button
    welcome.tsx                # Welcome email
    password-reset.tsx         # Password reset
    daily-report.tsx           # Daily agent report
    alert-notification.tsx     # System alert
  lib/email/
    send.ts                    # Email sending utility
    config.ts                  # Provider configuration
```

---

## Scientific Luxury Email Palette

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#050505` | Email body |
| Container | `#0a0a0a` | Content area |
| Border | `rgba(255, 255, 255, 0.06)` | Dividers, container |
| Text primary | `rgba(255, 255, 255, 0.9)` | Headings, values |
| Text secondary | `rgba(255, 255, 255, 0.7)` | Body text |
| Text muted | `rgba(255, 255, 255, 0.3)` | Labels, footer |
| Cyan accent | `#00F5FF` | CTA buttons, links |
| Emerald | `#00FF88` | Success metrics |
| Red | `#FF4444` | Failure metrics |
| Amber | `#FFB800` | Warning states |

---

## Typography

| Role | Font | Style |
|------|------|-------|
| Brand label | JetBrains Mono | 10px, tracking 0.3em, uppercase, muted |
| Heading | Inter / SF Pro Display | 24px, weight 200, tracking -0.02em |
| Body | Inter | 14px, weight 400, secondary colour |
| Data values | JetBrains Mono | 20px, weight 500, primary colour |
| Metric labels | JetBrains Mono | 10px, tracking 0.2em, uppercase, muted |
| Footer | Inter | 11px, muted colour |

---

## Container Standards

```typescript
const body = {
  backgroundColor: '#050505',
  fontFamily: "'Inter', 'SF Pro Display', Helvetica, Arial, sans-serif",
  margin: '0',
  padding: '0',
};

const container = {
  backgroundColor: '#0a0a0a',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '2px',  // rounded-sm only
  margin: '40px auto',
  maxWidth: '560px',
  padding: '32px',
};
```

---

## Four Rules of Email Templates

1. **Table-based layout**: Use `Row`/`Column` from React Email, not CSS Grid/Flexbox
2. **Inline styles**: React Email handles this automatically; never use `<style>` blocks
3. **Dark theme first**: Scientific Luxury OLED aesthetic adapted for email
4. **Preview before send**: Every template must render in the React Email dev server

---

## Shared Component Contract

### EmailHeader

- Brand label: "NODEJS-STARTER-V1" in muted monospace
- Title: Heading in primary colour, weight 200
- Divider: `rgba(255, 255, 255, 0.06)`, 0.5px

### EmailButton

- Background: Cyan `#00F5FF`
- Text: Black `#050505`
- Border radius: 2px
- Padding: 12px 24px

### EmailFooter

- Divider
- Text: "Sent by NodeJS-Starter-V1 -- Brisbane, QLD, Australia"
- Colour: muted `rgba(255, 255, 255, 0.3)`

---

## Email Sending Utility

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const { data, error } = await resend.emails.send({
    from: 'NodeJS-Starter-V1 <noreply@yourdomain.com.au>',
    to,
    subject,
    react,
  });
  if (error) throw new Error(`Email send failed: ${error.message}`);
  return data;
}
```

---

## Dark Mode Fallback

Some email clients force light mode. Add border as visual anchor:

```typescript
const container = {
  backgroundColor: '#0a0a0a',
  border: '1px solid #1a1a1a',  // Visible in forced light mode
};
```

---

## Australian Locale (en-AU)

- **Dates**: DD/MM/YYYY in email body
- **Currency**: AUD ($X,XXX.XX)
- **Timezone**: AEST/AEDT -- timestamps display Australian time
- **Spelling**: colour, behaviour, analyse, organise, centre
- **Footer**: Australian business address (Brisbane, QLD)

---

## Error Taxonomy Integration

| Code | HTTP | Trigger |
|------|------|---------|
| `SYS_EXTERNAL_EMAIL_PROVIDER` | 503 | Email delivery failure |
| `DATA_VALIDATION_INVALID_EMAIL` | 422 | Invalid recipient address |
| `SYS_RUNTIME_EMAIL_RENDER` | 500 | Template rendering error |
