# Email Template -- Before/After Examples

> Concrete transformations from anti-patterns to Scientific Luxury email templates.

---

## Example 1: Light Theme to OLED Dark Theme

### Before

```tsx
// Generic light theme email -- brand disconnect from dark application
const body = {
  backgroundColor: '#ffffff',
  color: '#333333',
  fontFamily: 'Arial, sans-serif',
};

const container = {
  backgroundColor: '#f9f9f9',
  border: '1px solid #dddddd',
  borderRadius: '8px',
  padding: '20px',
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '4px',
  color: '#ffffff',
  padding: '10px 20px',
};
```

**Problems**: Bright white background clashes with OLED dark application. Generic blue button and rounded corners do not match Scientific Luxury design system.

### After

```tsx
// Scientific Luxury dark theme email
const body = {
  backgroundColor: '#050505',                    // OLED Black
  fontFamily: "'Inter', 'SF Pro Display', Helvetica, Arial, sans-serif",
  margin: '0',
  padding: '0',
};

const container = {
  backgroundColor: '#0a0a0a',                    // Slightly elevated
  border: '1px solid rgba(255, 255, 255, 0.06)', // Single-pixel border
  borderRadius: '2px',                           // rounded-sm only
  margin: '40px auto',
  maxWidth: '560px',
  padding: '32px',
};

const button = {
  backgroundColor: '#00F5FF',                    // Spectral Cyan
  borderRadius: '2px',                           // rounded-sm only
  color: '#050505',                              // Dark text on cyan
  display: 'inline-block',
  fontFamily: "'Inter', Helvetica, sans-serif",
  fontSize: '14px',
  fontWeight: '500',
  padding: '12px 24px',
  textDecoration: 'none',
};
```

---

## Example 2: Flexbox Layout to Table-Based

### Before

```tsx
// BROKEN in Outlook -- uses Flexbox
<div style={{ display: 'flex', justifyContent: 'space-between' }}>
  <div style={{ flex: 1 }}>
    <h3>Total Runs</h3>
    <p>42</p>
  </div>
  <div style={{ flex: 1 }}>
    <h3>Success Rate</h3>
    <p>90.5%</p>
  </div>
</div>
```

### After

```tsx
// Works everywhere -- table-based via React Email
import { Row, Column, Text } from '@react-email/components';

<Row>
  <Column style={{ width: '50%' }}>
    <Text style={metricLabel}>TOTAL RUNS</Text>
    <Text style={metricValue}>42</Text>
  </Column>
  <Column style={{ width: '50%' }}>
    <Text style={metricLabel}>SUCCESS RATE</Text>
    <Text style={{ ...metricValue, color: '#00FF88' }}>90.5%</Text>
  </Column>
</Row>
```

---

## Example 3: Style Block to Inline Styles

### Before

```tsx
// BROKEN -- <style> stripped by Gmail and Outlook.com
<Html>
  <Head>
    <style>{`
      .heading { color: white; font-size: 24px; font-weight: 200; }
      .body-text { color: #b0b0b0; font-size: 14px; }
      .btn { background: #00F5FF; color: black; padding: 12px 24px; }
    `}</style>
  </Head>
  <Body>
    <h1 className="heading">Welcome</h1>
    <p className="body-text">Your account is ready.</p>
    <a className="btn" href="/login">Sign In</a>
  </Body>
</Html>
```

### After

```tsx
// Inline styles -- works in all clients
<Html>
  <Head />
  <Body style={{ backgroundColor: '#050505' }}>
    <Heading style={{
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '24px',
      fontWeight: '200',
    }}>
      Welcome
    </Heading>
    <Text style={{
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '14px',
    }}>
      Your account is ready.
    </Text>
    <Link href="/login" style={{
      backgroundColor: '#00F5FF',
      borderRadius: '2px',
      color: '#050505',
      padding: '12px 24px',
      textDecoration: 'none',
    }}>
      Sign In
    </Link>
  </Body>
</Html>
```

---

## Example 4: Hardcoded Recipients to Environment Variable

### Before

```typescript
await sendEmail({
  to: 'admin@company.com.au',
  subject: 'Daily Report',
  react: DailyReportEmail(data),
});
```

### After

```typescript
if (process.env.REPORT_EMAIL_RECIPIENTS) {
  const recipients = process.env.REPORT_EMAIL_RECIPIENTS.split(',');
  await sendEmail({
    to: recipients,
    subject: `Agent Report -- ${report.date}`,
    react: DailyReportEmail({
      date: new Date(report.date).toLocaleDateString('en-AU'),
      total: report.summary.total,
      completed: report.summary.completed,
      failed: report.summary.failed,
      successRate: report.summary.successRate,
    }),
  });
}
```

---

## Example 5: Missing Alt Text to Accessible Images

### Before

```tsx
<Img src="https://example.com/logo.png" />
<Img src="https://example.com/chart.png" alt="" />
```

### After

```tsx
<Img
  src="https://example.com/logo.png"
  alt="NodeJS-Starter-V1 logo"
  width={120}
  height={32}
/>
<Img
  src="https://example.com/chart.png"
  alt="Weekly agent performance chart: 42 runs, 90.5% success rate"
  width={480}
  height={240}
/>
```
