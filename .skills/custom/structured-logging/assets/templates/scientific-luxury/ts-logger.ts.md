# TypeScript Logger Template -- Scientific Luxury

> Frontend Logger class for NodeJS-Starter-V1 with level filtering, ISO timestamps, JSON context serialisation, and correlation ID propagation.

---

## Logger Class

```typescript
// apps/web/lib/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private level: number;

  constructor() {
    const envLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL ?? 'info') as LogLevel;
    this.level = LOG_LEVELS[envLevel] ?? LOG_LEVELS.info;
  }

  debug(event: string, context?: Record<string, unknown>): void {
    this.log('debug', event, context);
  }

  info(event: string, context?: Record<string, unknown>): void {
    this.log('info', event, context);
  }

  warn(event: string, context?: Record<string, unknown>): void {
    this.log('warn', event, context);
  }

  error(event: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorContext = error instanceof Error
      ? { error_message: error.message, error_name: error.name }
      : error
        ? { error_raw: String(error) }
        : {};
    this.log('error', event, { ...errorContext, ...context });
  }

  private log(level: LogLevel, event: string, context?: Record<string, unknown>): void {
    if (LOG_LEVELS[level] < this.level) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      ...context,
    };

    const method = level === 'error' ? console.error
      : level === 'warn' ? console.warn
      : console.log;

    method(JSON.stringify(entry));
  }
}

export const logger = new Logger();
```

---

## Correlation ID Propagation

```typescript
// apps/web/lib/api/correlation.ts

let correlationId: string | null = null;

export function getCorrelationId(): string | null {
  return correlationId;
}

export function setCorrelationId(id: string | null): void {
  correlationId = id;
}

export function getCorrelationHeaders(): Record<string, string> {
  return correlationId ? { 'X-Correlation-ID': correlationId } : {};
}
```

---

## API Client Integration

```typescript
// Usage in API client
import { getCorrelationHeaders, setCorrelationId } from './correlation';

export async function apiRequest(path: string, options?: RequestInit) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getCorrelationHeaders(),
    ...(options?.headers as Record<string, string>),
  };

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  // Capture correlation ID from response
  const responseCorrelationId = response.headers.get('X-Correlation-ID');
  if (responseCorrelationId) {
    setCorrelationId(responseCorrelationId);
  }

  return response;
}
```

---

## Usage Pattern

```typescript
import { logger } from '@/lib/logger';

// Business events
logger.info('Document created', { documentId: doc.id, userId: user.id });

// Warnings
logger.warn('API response slow', { endpoint: '/api/agents', durationMs: 2500 });

// Errors (always include the error object)
logger.error('Failed to fetch documents', error, { userId: user.id });

// Debug (stripped in production via LOG_LEVEL)
logger.debug('API response', { status: response.status, bodyLength: data.length });
```
