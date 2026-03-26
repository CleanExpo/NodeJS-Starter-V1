# TypeScript Logger Template -- Generic

> Framework-agnostic structured logger with level filtering, ISO timestamps, and JSON output.

---

## Logger Class

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private level: number;

  constructor(level: LogLevel = 'info') {
    this.level = LOG_LEVELS[level] ?? LOG_LEVELS.info;
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

export const logger = new Logger(
  (process.env.LOG_LEVEL as LogLevel) ?? 'info'
);
```

---

## Usage

```typescript
import { logger } from './logger';

logger.info('User created', { userId: user.id, role: user.role });
logger.warn('Rate limit approaching', { current: 95, limit: 100 });
logger.error('Database query failed', error, { table: 'users' });
logger.debug('Query parameters', { page: 1, limit: 20 });
```
