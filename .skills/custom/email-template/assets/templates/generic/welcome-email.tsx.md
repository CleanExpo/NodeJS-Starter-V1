# Welcome Email Template -- Generic

> Framework-agnostic welcome email using React Email components. No design system dependency.

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

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
  appName?: string;
}

export function WelcomeEmail({
  name,
  loginUrl,
  appName = 'Our App',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {appName}, {name}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Welcome, {name}</Heading>
          <Hr style={divider} />
          <Text style={bodyText}>
            Your account has been created. Click the button below to sign in
            and get started.
          </Text>
          <Link href={loginUrl} style={button}>
            Sign In
          </Link>
          <Hr style={divider} />
          <Text style={footer}>
            Sent by {appName}
          </Text>
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

const heading = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 24px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
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

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
};

export default WelcomeEmail;
```
