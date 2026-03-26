import type { ProjectProfile } from './project-scanner.js';

export interface Gap {
  id: string;
  category: 'governance' | 'architecture' | 'testing' | 'ci-cd' | 'integrations' | 'security';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  remediation: string;
}

export function analyzeGaps(profile: ProjectProfile): Gap[] {
  const gaps: Gap[] = [];

  if (!profile.hasMemoryMd) {
    gaps.push({
      id: 'no-memory-md',
      category: 'governance',
      severity: 'critical',
      description: 'No memory.md operational constitution',
      remediation: 'Copy memory.md from NodeJS-Starter-V1',
    });
  }

  if (!profile.hasClaudeMd) {
    gaps.push({
      id: 'no-claude-md',
      category: 'governance',
      severity: 'critical',
      description: 'No CLAUDE.md project instructions',
      remediation: 'Create CLAUDE.md with architecture routing and governance rules',
    });
  }

  if (!profile.hasSkills) {
    gaps.push({
      id: 'no-skills',
      category: 'governance',
      severity: 'major',
      description: 'No agent skills installed',
      remediation: 'Copy .skills/custom/ from NodeJS-Starter-V1',
    });
  }

  if (!profile.hasAgents) {
    gaps.push({
      id: 'no-agents',
      category: 'governance',
      severity: 'major',
      description: 'No agent configurations found',
      remediation: 'Copy .claude/agents/ from NodeJS-Starter-V1',
    });
  }

  if (!profile.hasAuth) {
    gaps.push({
      id: 'no-auth',
      category: 'security',
      severity: 'critical',
      description: 'No authentication layer detected',
      remediation: 'Implement JWT auth middleware',
    });
  }

  if (!profile.hasTests) {
    gaps.push({
      id: 'no-tests',
      category: 'testing',
      severity: 'major',
      description: 'No test suite detected',
      remediation: 'Add unit and integration test coverage',
    });
  }

  if (!profile.hasCiCd) {
    gaps.push({
      id: 'no-ci-cd',
      category: 'ci-cd',
      severity: 'major',
      description: 'No CI/CD pipeline found',
      remediation: 'Add GitHub Actions workflows in .github/workflows/',
    });
  }

  if (!profile.hasLinear) {
    gaps.push({
      id: 'no-linear',
      category: 'integrations',
      severity: 'minor',
      description: 'No Linear MCP integration',
      remediation: 'Add Linear MCP server to .mcp.json',
    });
  }

  if (!profile.hasDocker) {
    gaps.push({
      id: 'no-docker',
      category: 'architecture',
      severity: 'major',
      description: 'No Docker configuration found',
      remediation: 'Add docker-compose.yml for local services',
    });
  }

  return gaps;
}

export function formatGapReport(profile: ProjectProfile, gaps: Gap[]): string {
  const critical = gaps.filter((g) => g.severity === 'critical');
  const major = gaps.filter((g) => g.severity === 'major');
  const minor = gaps.filter((g) => g.severity === 'minor');

  const lines: string[] = [
    '# Gap Analysis Report',
    '',
    `**Project**: ${profile.rootDir}`,
    `**Stack Detected**: ${profile.detectedStack.join(', ') || 'Unknown'}`,
    `**Generated**: ${new Date().toLocaleDateString('en-AU')}`,
    '',
    '## Summary',
    '',
    `- 🔴 Critical gaps: ${critical.length}`,
    `- 🟡 Major gaps: ${major.length}`,
    `- 🟢 Minor gaps: ${minor.length}`,
    '',
    '## Gaps',
    '',
  ];

  if (gaps.length === 0) {
    lines.push('✅ No gaps found. Project passes all adoption checks.');
    return lines.join('\n');
  }

  for (const g of gaps) {
    const icon = g.severity === 'critical' ? '🔴' : g.severity === 'major' ? '🟡' : '🟢';
    lines.push(
      `### ${icon} ${g.id}`,
      '',
      `**Category**: ${g.category} | **Severity**: ${g.severity}`,
      '',
      `**Issue**: ${g.description}`,
      '',
      `**Fix**: ${g.remediation}`,
      ''
    );
  }

  return lines.join('\n');
}
