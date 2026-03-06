import { existsSync, readFileSync } from 'node:fs';

export interface VisualAuditResult {
  rule: string;
  status: 'PASS' | 'FAIL' | 'UNKNOWN';
  evidence?: string;
}

interface DesignRule {
  id: string;
  rule: string;
  pattern: RegExp;
  requiresMatch: boolean; // true = pattern must be found to PASS; false = pattern must NOT be found to PASS
}

const DESIGN_RULES: DesignRule[] = [
  {
    id: 'background-color',
    rule: 'Background uses OLED Black #050505',
    pattern: /#050505/i,
    requiresMatch: true,
  },
  {
    id: 'no-rounded-lg',
    rule: 'No rounded-lg, rounded-full, or larger (use rounded-sm only)',
    pattern: /rounded-(?:lg|full|xl|2xl|3xl)/,
    requiresMatch: false,
  },
  {
    id: 'framer-motion',
    rule: 'Animations import Framer Motion',
    pattern: /from\s+['"]framer-motion['"]/,
    requiresMatch: true,
  },
  {
    id: 'jetbrains-mono',
    rule: 'Monospace font references JetBrains Mono',
    pattern: /JetBrains[- ]Mono/i,
    requiresMatch: true,
  },
  {
    id: 'no-bg-white',
    rule: 'No plain white or light grey backgrounds',
    pattern: /\bbg-white\b|\bbg-gray-(?:50|100|200)\b|\bbg-slate-(?:50|100|200)\b/,
    requiresMatch: false,
  },
];

export function auditFile(filePath: string): VisualAuditResult[] {
  if (!existsSync(filePath)) {
    return [
      {
        rule: 'File exists',
        status: 'FAIL',
        evidence: `File not found: ${filePath}`,
      },
    ];
  }

  const content = readFileSync(filePath, 'utf8');

  return DESIGN_RULES.map((rule): VisualAuditResult => {
    const found = rule.pattern.test(content);
    const pass = rule.requiresMatch ? found : !found;
    return {
      rule: rule.rule,
      status: pass ? 'PASS' : 'FAIL',
      evidence: pass
        ? `Verified in ${filePath}`
        : rule.requiresMatch
          ? `Required pattern not found in ${filePath}`
          : `Banned pattern found in ${filePath}`,
    };
  });
}

export function generateVisualAuditReport(results: VisualAuditResult[]): string {
  const lines: string[] = [
    '# Visual Audit Report',
    '',
    `Generated: ${new Date().toLocaleDateString('en-AU')}`,
    '',
    '| Rule | Status | Evidence |',
    '|------|--------|----------|',
  ];

  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '❓';
    lines.push(`| ${r.rule} | ${icon} ${r.status} | ${r.evidence ?? ''} |`);
  }

  const passes = results.filter((r) => r.status === 'PASS').length;
  const fails = results.filter((r) => r.status === 'FAIL').length;
  lines.push('', `**Score: ${passes}/${results.length} rules passing. Failures: ${fails}**`);

  return lines.join('\n');
}
