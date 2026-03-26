# Alert Email Template -- Generic

> Framework-agnostic alert notification email using React Email components. No design system dependency.

---

## Template

```tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';

interface AlertEmailProps {
  title: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  service: string;
  timestamp: string;
  dashboardUrl: string;
  appName?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  warning: '#eab308',
  info: '#3b82f6',
};

const SEVERITY_BG: Record<string, string> = {
  critical: '#fef2f2',
  warning: '#fefce8',
  info: '#eff6ff',
};

export function AlertEmail({
  title,
  severity,
  message,
  service,
  timestamp,
  dashboardUrl,
  appName = 'Our App',
}: AlertEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>[{severity.toUpperCase()}] {title}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Severity Banner */}
          <Text
            style={{
              ...severityBanner,
              color: SEVERITY_COLORS[severity],
              backgroundColor: SEVERITY_BG[severity],
            }}
          >
            {severity.toUpperCase()}
          </Text>

          <Heading style={heading}>{title}</Heading>
          <Hr style={divider} />

          {/* Details */}
          <Text style={label}>Service</Text>
          <Text style={value}>{service}</Text>

          <Text style={label}>Time</Text>
          <Text style={value}>{timestamp}</Text>

          <Text style={label}>Details</Text>
          <Text style={bodyText}>{message}</Text>

          {/* CTA */}
          <Link href={dashboardUrl} style={button}>
            View Dashboard
          </Link>

          <Hr style={divider} />
          <Text style={footer}>Sent by {appName}</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: '#f6f6f6',
  fontFamily: "'Inter', Helvetica, Arial, sans-serif",
  margin: '0',
  padding: '0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  margin: '40px auto',
  maxWidth: '560px',
  padding: '32px',
};

const severityBanner = {
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.1em',
  borderRadius: '4px',
  display: 'inline-block',
  padding: '4px 8px',
  margin: '0 0 8px',
};

const heading = {
  color: '#111827',
  fontSize: '22px',
  fontWeight: '600',
  margin: '0 0 24px',
};

const divider = { borderColor: '#e5e7eb', margin: '24px 0' };

const label = {
  color: '#9ca3af',
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
  margin: '0 0 2px',
};

const value = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 16px',
};

const bodyText = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 24px',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '500',
  padding: '12px 24px',
  textDecoration: 'none',
};

const footer = { color: '#9ca3af', fontSize: '12px', margin: '0' };

export default AlertEmail;
```
