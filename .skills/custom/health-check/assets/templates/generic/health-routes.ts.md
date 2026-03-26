# TypeScript Health Routes Template -- Generic

> Framework-agnostic three-tier health endpoints. Adaptable to Next.js, Express, Fastify, or any Node.js framework.

---

## Types

```typescript
interface DependencyCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unchecked';
  latency_ms: number | null;
  error: string | null;
  last_checked: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
}

interface DeepHealthResponse extends HealthResponse {
  dependencies: DependencyCheck[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    degraded: number;
  };
}
```

---

## Liveness (Tier 1)

```typescript
export function livenessHandler(): HealthResponse {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION ?? '1.0.0',
  };
}
```

---

## Deep Health (Tier 3)

```typescript
export async function deepHealthHandler(): Promise<{
  response: DeepHealthResponse;
  statusCode: number;
}> {
  const checks = await Promise.all([
    checkDependency('database', DATABASE_URL),
    checkDependency('cache', CACHE_URL),
    checkDependency('external_api', EXTERNAL_API_URL),
  ]);

  const anyUnhealthy = checks.some((c) => c.status === 'unhealthy');
  const anyDegraded = checks.some((c) => c.status === 'degraded');
  const overall = anyUnhealthy ? 'unhealthy' : anyDegraded ? 'degraded' : 'healthy';

  return {
    statusCode: anyUnhealthy ? 503 : 200,
    response: {
      status: overall,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION ?? '1.0.0',
      dependencies: checks,
      summary: {
        total: checks.length,
        passed: checks.filter((c) => c.status === 'healthy').length,
        failed: checks.filter((c) => c.status === 'unhealthy').length,
        degraded: checks.filter((c) => c.status === 'degraded').length,
      },
    },
  };
}

async function checkDependency(name: string, url: string): Promise<DependencyCheck> {
  const start = Date.now();
  const result: DependencyCheck = {
    name,
    status: 'unchecked',
    latency_ms: null,
    error: null,
    last_checked: new Date().toISOString(),
  };

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });
    result.latency_ms = Date.now() - start;
    result.status = response.ok ? 'healthy' : 'degraded';
    if (!response.ok) result.error = `HTTP ${response.status}`;
  } catch (e) {
    result.latency_ms = Date.now() - start;
    result.status = 'unhealthy';
    result.error = e instanceof Error ? e.message : 'Unknown error';
  }

  return result;
}
```
