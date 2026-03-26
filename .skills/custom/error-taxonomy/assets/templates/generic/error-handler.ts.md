# TypeScript Error Handler Template -- Generic

> Framework-agnostic error class and message mapping. Portable to any TypeScript project.

---

## Error Class

```typescript
export interface ApiErrorBody {
  detail: string;
  error_code: string;
  severity?: 'fatal' | 'error' | 'warning';
  field?: string;
}

export class AppError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode: string,
    public severity: 'fatal' | 'error' | 'warning' = 'error',
    public field?: string,
  ) {
    super(message);
    this.name = 'AppError';
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

## Message Mapping

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  AUTH_VALIDATION_INVALID_TOKEN: 'Your session is invalid. Please sign in again.',
  AUTH_VALIDATION_EXPIRED_TOKEN: 'Your session has expired. Please sign in again.',
  AUTH_PERMISSION_DENIED: 'You do not have permission to perform this action.',
  DATA_VALIDATION_MISSING_FIELD: 'Please fill in all required fields.',
  SYS_RUNTIME_INTERNAL: 'An internal error occurred. Please try again later.',
};

export function getUserMessage(error: AppError): string {
  return ERROR_MESSAGES[error.errorCode] ?? error.message;
}
```

---

## Response Parser

```typescript
export function parseErrorResponse(status: number, body: unknown): AppError {
  if (typeof body === 'object' && body !== null && 'error_code' in body) {
    const err = body as ApiErrorBody;
    return new AppError(
      err.detail,
      status,
      err.error_code,
      (err.severity as 'fatal' | 'error' | 'warning') ?? 'error',
      err.field,
    );
  }

  return new AppError('An unexpected error occurred.', status, 'SYS_RUNTIME_INTERNAL');
}
```

---

## Usage

```typescript
try {
  const response = await fetch('/api/resource');
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw parseErrorResponse(response.status, body);
  }
} catch (error) {
  if (error instanceof AppError) {
    if (error.isAuth) {
      // Redirect to login
    } else if (error.isValidation && error.field) {
      // Highlight specific form field
    } else {
      // Show user-facing message
      alert(getUserMessage(error));
    }
  }
}
```
