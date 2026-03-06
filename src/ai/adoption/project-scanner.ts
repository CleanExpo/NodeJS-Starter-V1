import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ProjectProfile {
  rootDir: string;
  hasNextJs: boolean;
  hasFastApi: boolean;
  hasDocker: boolean;
  hasPostgres: boolean;
  hasAuth: boolean;
  hasCiCd: boolean;
  hasTests: boolean;
  hasLinear: boolean;
  hasClaudeMd: boolean;
  hasMemoryMd: boolean;
  hasSkills: boolean;
  hasAgents: boolean;
  detectedStack: string[];
}

function readJsonSafe(filePath: string): Record<string, unknown> | null {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function scanProject(rootDir: string): ProjectProfile {
  const at = (p: string): string => join(rootDir, p);
  const has = (p: string): boolean => existsSync(at(p));

  const pkg = readJsonSafe(at('package.json'));
  const allDeps: Record<string, string> = {
    ...((pkg?.['dependencies'] as Record<string, string>) ?? {}),
    ...((pkg?.['devDependencies'] as Record<string, string>) ?? {}),
  };
  const depsStr = JSON.stringify(allDeps);

  const hasNextJs = 'next' in allDeps || has('next.config.ts') || has('next.config.js');
  const hasFastApi = has('apps/backend') || has('requirements.txt');
  const hasDocker = has('docker-compose.yml') || has('Dockerfile');
  const hasPostgres =
    has('scripts/init-db.sql') || depsStr.includes('"postgres"') || depsStr.includes('"pg"');

  const detectedStack: string[] = [];
  if (hasNextJs) detectedStack.push('Next.js');
  if (hasFastApi) detectedStack.push('FastAPI');
  if (hasDocker) detectedStack.push('Docker');
  if (hasPostgres) detectedStack.push('PostgreSQL');

  let hasLinear = false;
  const mcpJson = readJsonSafe(at('.mcp.json'));
  if (mcpJson !== null) {
    hasLinear = JSON.stringify(mcpJson).toLowerCase().includes('linear');
  }

  return {
    rootDir,
    hasNextJs,
    hasFastApi,
    hasDocker,
    hasPostgres,
    hasAuth: has('apps/web/middleware.ts') || has('apps/backend/src/auth'),
    hasCiCd: has('.github/workflows'),
    hasTests:
      has('apps/web/__tests__') ||
      has('apps/web/tests') ||
      has('apps/backend/tests') ||
      has('tests'),
    hasLinear,
    hasClaudeMd: has('CLAUDE.md'),
    hasMemoryMd: has('memory.md'),
    hasSkills: has('.skills/custom'),
    hasAgents: has('.claude/agents'),
    detectedStack,
  };
}
