# Email Setup Guide

This guide explains how to add transactional email to your application.

## Recommended Providers

- **[Resend](https://resend.com/)** — Developer-friendly API, React Email templates
- **[SendGrid](https://sendgrid.com/)** — Enterprise-grade, high volume
- **[Postmark](https://postmarkapp.com/)** — Excellent deliverability

## Quick Start with Resend

### 1. Install

```bash
# Frontend (React Email templates)
pnpm --filter web add resend @react-email/components

# Backend (Python)
cd apps/backend && uv add resend
```

### 2. Environment Variables

Add to your `.env`:

```
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com.au
```

### 3. Backend Integration

Create `apps/backend/src/services/email.py`:

```python
import resend

resend.api_key = settings.resend_api_key

async def send_email(to: str, subject: str, html: str) -> dict:
    return resend.Emails.send({
        "from": settings.email_from,
        "to": to,
        "subject": subject,
        "html": html,
    })
```

### 4. Frontend Templates

Use [React Email](https://react.email/) to create type-safe email templates.

## Further Reading

- [Resend Documentation](https://resend.com/docs)
- [React Email Components](https://react.email/docs/introduction)
