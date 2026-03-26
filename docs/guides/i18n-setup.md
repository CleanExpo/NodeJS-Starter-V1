# Internationalisation (i18n) Setup Guide

This guide explains how to add multi-language support with en-AU as the default locale.

## Recommended: next-intl

### 1. Install

```bash
pnpm --filter web add next-intl
```

### 2. Configuration

Create `apps/web/i18n.ts`:

```typescript
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));
```

### 3. Message Files

Create `apps/web/messages/en-AU.json`:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back"
  }
}
```

### 4. Australian Conventions

- **Date format**: DD/MM/YYYY
- **Currency**: AUD ($)
- **Spelling**: colour, behaviour, organisation, licence (noun)
- **Timezone**: AEST/AEDT (UTC+10/UTC+11)

## Further Reading

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
