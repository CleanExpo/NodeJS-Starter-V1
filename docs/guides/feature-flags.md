# Feature Flags Guide

This guide explains how to implement feature flags for safe rollouts.

## Simple Environment Variable Approach

The simplest pattern — no external dependencies required.

### 1. Define Flags

Add to `.env`:

```
NEXT_PUBLIC_FEATURE_DARK_MODE=true
NEXT_PUBLIC_FEATURE_AGENT_V2=false
```

### 2. Frontend Usage

Create `apps/web/lib/features.ts`:

```typescript
export const features = {
  darkMode: process.env.NEXT_PUBLIC_FEATURE_DARK_MODE === 'true',
  agentV2: process.env.NEXT_PUBLIC_FEATURE_AGENT_V2 === 'true',
} as const;
```

```tsx
import { features } from '@/lib/features';

export function MyComponent() {
  if (!features.darkMode) return null;
  return <DarkModeToggle />;
}
```

### 3. Backend Usage (Python)

```python
import os

FEATURES = {
    "agent_v2": os.getenv("FEATURE_AGENT_V2", "false").lower() == "true",
}
```

## Scaling Up

For percentage rollouts, A/B testing, or user targeting, consider:

- **[LaunchDarkly](https://launchdarkly.com/)** — Enterprise feature management
- **[Unleash](https://www.getunleash.io/)** — Open-source alternative
- **[PostHog](https://posthog.com/feature-flags)** — Combined analytics + flags

## Further Reading

- [Feature Flags Best Practices](https://martinfowler.com/articles/feature-toggles.html)
