# Welcome Email Template -- Scientific Luxury

> OLED dark theme welcome email with spectral cyan CTA button for NodeJS-Starter-V1.

---

## Template

```tsx
// apps/web/emails/welcome.tsx
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

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
}

export function WelcomeEmail({ name, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to NodeJS-Starter-V1, {name}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Brand Label */}
          <Text style={brandLabel}>NODEJS-STARTER-V1</Text>

          {/* Heading */}
          <Heading style={heading}>Welcome, {name}</Heading>
          <Hr style={divider} />

          {/* Body */}
          <Text style={bodyText}>
            Your account has been created. You can now sign in to access the
            dashboard, manage your documents, and interact with AI agents.
          </Text>

          {/* CTA Button */}
          <Link href={loginUrl} style={button}>
            Sign In to Dashboard
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

// Scientific Luxury email styles
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

const bodyText = {
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 24px',
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

export default WelcomeEmail;
```
