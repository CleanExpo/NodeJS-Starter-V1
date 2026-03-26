# TypeScript Error Handler Template -- Scientific Luxury

> ApiClientError class and user-facing message mapping for NodeJS-Starter-V1.

---

## ApiClientError Class

```typescript
// apps/web/lib/api/errors.ts

export interface ApiError {
  detail: string;
  error_code: string;
  severity?: 'fatal' | 'error' | 'warning';
  field?: string;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode: string,
    public severity: 'fatal' | 'error' | 'warning' = 'error',
    public field?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }

  get isAuth(): boolean {
    return this.errorCode.startsWith('AUTH_');
  }

  get isValidation(): boolean {
    return this.errorCode.includes('_VALIDATION_');
  }

  get isRetryable(): boolean {
    return this.status === 429 || this.status >= 500;
  }

  get domain(): string {
    return this.errorCode.split('_')[0];
  }
}
```

---

## User-Facing Message Map

```typescript
// apps/web/lib/api/error-messages.ts

const ERROR_MESSAGES: Record<string, string> = {
  // Authentication
  AUTH_VALIDATION_INVALID_TOKEN: 'Your session is invalid. Please sign in again.',
  AUTH_VALIDATION_EXPIRED_TOKEN: 'Your session has expired. Please sign in again.',
  AUTH_VALIDATION_MISSING_TOKEN: 'Please sign in to continue.',
  AUTH_PERMISSION_DENIED: 'You do not have permission to perform this action.',
  AUTH_PERMISSION_INACTIVE: 'Your account has been deactivated.',

  // Agent
  AGENT_RUNTIME_TIMEOUT: 'The AI agent took too long to respond. Please try again.',
  AGENT_EXTERNAL_PROVIDER_DOWN: 'The AI service is temporarily unavailable.',

  // Data
  DATA_VALIDATION_MISSING_FIELD: 'Please fill in all required fields.',
  DATA_VALIDATION_INVALID_FORMAT: 'Invalid data format. Please check your input.',
  DATA_CONFLICT_DUPLICATE: 'This resource already exists.',

  // System
  SYS_EXTERNAL_DATABASE: 'A database error occurred. Please try again later.',
  SYS_RATELIMIT_EXCEEDED: 'Too many requests. Please wait a moment.',
  SYS_RUNTIME_INTERNAL: 'An internal error occurred. Please try again later.',
};

export function getUserMessage(error: ApiClientError): string {
  return ERROR_MESSAGES[error.errorCode] ?? error.message;
}
```

---

## Response Parser

```typescript
// apps/web/lib/api/parse-error.ts

import { ApiClientError } from './errors';

export function parseApiError(status: number, body: unknown): ApiClientError {
  if (typeof body === 'object' && body !== null && 'error_code' in body) {
    const err = body as { detail: string; error_code: string; severity?: string; field?: string };
    return new ApiClientError(
      err.detail,
      status,
      err.error_code,
      (err.severity as 'fatal' | 'error' | 'warning') ?? 'error',
      err.field,
    );
  }

  // Fallback for non-standard error responses
  const detail = typeof body === 'object' && body !== null && 'detail' in body
    ? String((body as { detail: unknown }).detail)
    : 'An unexpected error occurred.';

  return new ApiClientError(detail, status, 'SYS_RUNTIME_INTERNAL');
}
```

---

## Usage in API Client

```typescript
import { parseApiError } from './parse-error';
import { getUserMessage } from './error-messages';

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, options);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw parseApiError(response.status, body);
  }

  return response.json();
}

// In UI components
try {
  await apiRequest('/api/documents');
} catch (error) {
  if (error instanceof ApiClientError) {
    if (error.isAuth) {
      router.push('/login');
    } else {
      toast.error(getUserMessage(error));
    }
  }
}
```
