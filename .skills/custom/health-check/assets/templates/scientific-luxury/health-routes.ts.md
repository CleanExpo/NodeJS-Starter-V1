# Next.js Health Routes Template -- Scientific Luxury

> Three-tier health endpoints for the NodeJS-Starter-V1 Next.js frontend.

---

## Tier 1: Liveness

```typescript
// apps/web/app/api/health/route.ts
import { NextResponse } from 'next/server';

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
}

const startTime = Date.now();

export async function GET() {
  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION ?? '0.1.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV ?? 'development',
  };

  return NextResponse.json(response);
}
```

---

## Tier 3: Deep Dependency Check

```typescript
// apps/web/app/api/health/deep/route.ts
import { NextResponse } from 'next/server';

interface DependencyCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unchecked';
  latency_ms: number | null;
  error: string | null;
  last_checked: string;
}

export async function GET() {
  const [database, backend, verification] = await Promise.all([
    checkDatabase(),
    checkBackend(),
    checkVerificationSystem(),
  ]);

  const checks = [database, backend, verification];
  const anyUnhealthy = checks.some((c) => c.status === 'unhealthy');
  const anyDegraded = checks.some((c) => c.status === 'degraded');

  const overall = anyUnhealthy ? 'unhealthy' : anyDegraded ? 'degraded' : 'healthy';

  const summary = {
    total_checks: checks.length,
    passed: checks.filter((c) => c.status === 'healthy').length,
    failed: checks.filter((c) => c.status === 'unhealthy').length,
    degraded: checks.filter((c) => c.status === 'degraded').length,
  };

  return NextResponse.json(
    { status: overall, timestamp: new Date().toISOString(), dependencies: checks, summary },
    { status: anyUnhealthy ? 503 : 200 },
  );
}

async function checkDatabase(): Promise<DependencyCheck> {
  return checkDependency('database', `${process.env.BACKEND_URL}/ready`);
}

async function checkBackend(): Promise<DependencyCheck> {
  return checkDependency('backend_api', `${process.env.BACKEND_URL}/health`);
}

async function checkVerificationSystem(): Promise<DependencyCheck> {
  return checkDependency('verification', `${process.env.BACKEND_URL}/api/agents/verifier/health`);
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

---

## Cron Health Check

```typescript
// apps/web/app/api/cron/health-check/route.ts
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  // 1. Verify CRON_SECRET
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorised', { status: 401 });
  }

  // 2. Check backend with latency measurement
  const start = Date.now();
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;

    logger.info('Health check cron', { backend: response.ok, latency });

    if (!response.ok) {
      logger.error('Backend unhealthy', { status: response.status, latency });
    }

    return NextResponse.json({
      status: response.ok ? 'healthy' : 'unhealthy',
      latency,
    });
  } catch (e) {
    const latency = Date.now() - start;
    logger.error('Backend unreachable', { error: e instanceof Error ? e.message : 'Unknown', latency });
    return NextResponse.json({ status: 'unhealthy', latency }, { status: 503 });
  }
}
```
