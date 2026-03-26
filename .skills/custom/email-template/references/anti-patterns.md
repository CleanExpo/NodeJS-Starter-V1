# Email Template -- Anti-Patterns

> Banned patterns extracted from the email-template skill. Every violation breaks rendering in major email clients, creates inconsistent brand experiences, or causes delivery failures.

---

## AP-1: CSS Grid/Flexbox in Emails

**Severity**: Critical -- breaks layout in Outlook, Gmail, and Yahoo Mail.

```tsx
// BANNED: Flexbox layout
<div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
  <div>Column 1</div>
  <div>Column 2</div>
</div>

// BANNED: CSS Grid layout
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

```tsx
// CORRECT: Table-based layout via React Email
import { Row, Column } from '@react-email/components';

<Row>
  <Column style={{ width: '50%' }}>Column 1</Column>
  <Column style={{ width: '50%' }}>Column 2</Column>
</Row>
```

**Why it fails**: Outlook uses Microsoft Word's HTML renderer which does not support Flexbox or Grid. Gmail strips most `display` properties. Table-based layout is the only reliable cross-client approach. React Email's `Row` and `Column` components generate table markup automatically.

---

## AP-2: External Style Blocks

**Severity**: High -- stripped by most email clients, leaving unstyled content.

```tsx
// BANNED: External <style> block
<Html>
  <Head>
    <style>{`
      .heading { color: white; font-size: 24px; }
      .button { background: #00F5FF; padding: 12px 24px; }
    `}</style>
  </Head>
  <Body>
    <h1 className="heading">Welcome</h1>
  </Body>
</Html>
```

```tsx
// CORRECT: Inline styles (React Email default)
<Heading style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '24px' }}>
  Welcome
</Heading>
```

**Why it fails**: Gmail, Outlook.com, and Yahoo strip `<style>` blocks from the `<head>`. CSS classes reference rules that no longer exist, leaving text unstyled. React Email automatically inlines styles during rendering.

---

## AP-3: Light Theme Email from Dark App

**Severity**: Medium -- inconsistent brand experience between application and email.

```tsx
// BANNED: Generic white email from a Scientific Luxury app
const body = {
  backgroundColor: '#ffffff',
  color: '#333333',
  fontFamily: 'Arial, sans-serif',
};
```

```tsx
// CORRECT: Scientific Luxury dark theme email
const body = {
  backgroundColor: '#050505',  // OLED Black
  fontFamily: "'Inter', 'SF Pro Display', Helvetica, Arial, sans-serif",
  margin: '0',
  padding: '0',
};

const container = {
  backgroundColor: '#0a0a0a',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '2px',  // rounded-sm
  margin: '40px auto',
  maxWidth: '560px',
  padding: '32px',
};
```

**Why it fails**: Users who interact with a dark-themed application and then receive a bright white email experience brand disconnection. The email should feel like a natural extension of the application. Scientific Luxury: OLED black background, spectral accents, monospace data values.

---

## AP-4: Images Without Alt Text

**Severity**: Medium -- accessibility failure, blank content when images blocked.

```tsx
// BANNED: No alt attribute
<Img src="https://example.com/logo.png" />
<Img src="https://example.com/chart.png" alt="" />

// CORRECT: Descriptive alt text
<Img src="https://example.com/logo.png" alt="NodeJS-Starter-V1 logo" width={120} height={32} />
<Img src="https://example.com/chart.png" alt="Weekly agent performance chart showing 95% success rate" />
```

**Why it fails**: Many corporate email clients block images by default. Without `alt` text, the user sees nothing. Screen readers cannot describe the image. Alt text provides context even when the image cannot load.

---

## AP-5: Hardcoded Recipient Addresses

**Severity**: Medium -- breaks across environments, sends dev emails to production users.

```typescript
// BANNED: Hardcoded recipients
await sendEmail({
  to: 'admin@company.com.au',
  subject: 'Daily Report',
  react: DailyReportEmail(data),
});
```

```typescript
// CORRECT: Recipients from environment variable
if (process.env.REPORT_EMAIL_RECIPIENTS) {
  const recipients = process.env.REPORT_EMAIL_RECIPIENTS.split(',');
  await sendEmail({
    to: recipients,
    subject: `Agent Report -- ${report.date}`,
    react: DailyReportEmail(data),
  });
}
```

**Why it fails**: Hardcoded addresses mean dev environments send real emails to real people. Production requires different recipients from staging. Environment variables enable per-environment configuration without code changes.

---

## AP-6: Sending Without Preview

**Severity**: Medium -- rendering bugs discovered in production, formatting issues across clients.

```typescript
// BANNED: Deploy without testing
// 1. Write template
// 2. Deploy to production
// 3. Hope it looks right
```

```bash
# CORRECT: Preview in React Email dev server first
pnpm email:dev
# Opens http://localhost:3001 with live preview of all templates
# Test across themes, check responsive behaviour, verify all props
```

```typescript
// CORRECT: Programmatic render for test assertions
import { render } from '@react-email/render';
import { WelcomeEmail } from '@/emails/welcome';

const html = await render(WelcomeEmail({ name: 'Test User' }));
expect(html).toContain('Welcome, Test User');
expect(html).not.toContain('undefined');
expect(html).not.toContain('null');
```

**Why it fails**: Email rendering varies drastically across clients. What looks correct in a browser may be broken in Outlook, Gmail, or Apple Mail. The React Email dev server provides instant visual feedback. Programmatic rendering enables automated test assertions against the rendered HTML.
