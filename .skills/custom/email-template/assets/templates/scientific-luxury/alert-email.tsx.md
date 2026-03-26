# Alert Email Template -- Scientific Luxury

> OLED dark theme alert notification email with severity-coloured indicators for NodeJS-Starter-V1.

---

## Template

```tsx
// apps/web/emails/alert-notification.tsx
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
  timestamp: string;  // DD/MM/YYYY HH:mm AEST
  dashboardUrl: string;
}

const SEVERITY_COLOURS: Record<string, string> = {
  critical: '#FF4444',  // Red
  warning: '#FFB800',   // Amber
  info: '#00F5FF',      // Cyan
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'CRITICAL',
  warning: 'WARNING',
  info: 'INFO',
};

export function AlertEmail({
  title,
  severity,
  message,
  service,
  timestamp,
  dashboardUrl,
}: AlertEmailProps) {
  const severityColour = SEVERITY_COLOURS[severity] ?? '#FFB800';

  return (
    <Html>
      <Head />
      <Preview>[{SEVERITY_LABELS[severity]}] {title}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Brand Label */}
          <Text style={brandLabel}>NODEJS-STARTER-V1</Text>

          {/* Severity Badge */}
          <Text style={{ ...severityBadge, color: severityColour }}>
            {SEVERITY_LABELS[severity]}
          </Text>

          {/* Heading */}
          <Heading style={heading}>{title}</Heading>
          <Hr style={divider} />

          {/* Alert Details */}
          <Text style={metricBlock}>
            <span style={metricLabel}>SERVICE</span>
            <br />
            <span style={metricValue}>{service}</span>
          </Text>

          <Text style={metricBlock}>
            <span style={metricLabel}>TIME</span>
            <br />
            <span style={metricValue}>{timestamp}</span>
          </Text>

          <Text style={metricBlock}>
            <span style={metricLabel}>DETAILS</span>
            <br />
            <span style={bodyText}>{message}</span>
          </Text>

          {/* CTA Button */}
          <Link href={dashboardUrl} style={button}>
            View Dashboard
          </Link>

          {/* Footer */}
          <Hr style={divider} />
          <Text style={footer}>
            Sent by NodeJS-Starter-V1 -- Brisbane, QLD, Australia
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: '#050505',
  fontFamily: "'Inter', 'SF Pro Display', Helvetica, Arial, sans-serif",
  margin: '0',
  padding: '0',
};

const container = {
  backgroundColor: '#0a0a0a',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '2px',
  margin: '40px auto',
  maxWidth: '560px',
  padding: '32px',
};

const brandLabel = {
  color: 'rgba(255, 255, 255, 0.3)',
  fontSize: '10px',
  fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: '0.3em',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
};

const severityBadge = {
  fontSize: '11px',
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: '700',
  letterSpacing: '0.15em',
  margin: '0 0 4px',
};

const heading = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '24px',
  fontWeight: '200',
  letterSpacing: '-0.02em',
  margin: '0 0 24px',
};

const divider = {
  borderColor: 'rgba(255, 255, 255, 0.06)',
  borderWidth: '0.5px',
  margin: '24px 0',
};

const metricBlock = { margin: '0 0 16px' };

const metricLabel = {
  color: 'rgba(255, 255, 255, 0.3)',
  fontSize: '10px',
  fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
};

const metricValue = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '16px',
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: '500',
};

const bodyText = {
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '14px',
  lineHeight: '1.6',
};

const button = {
  backgroundColor: '#00F5FF',
  borderRadius: '2px',
  color: '#050505',
  display: 'inline-block',
  fontFamily: "'Inter', Helvetica, sans-serif",
  fontSize: '14px',
  fontWeight: '500',
  padding: '12px 24px',
  textDecoration: 'none',
};

const footer = {
  color: 'rgba(255, 255, 255, 0.3)',
  fontSize: '11px',
  margin: '0',
};

export default AlertEmail;
```
