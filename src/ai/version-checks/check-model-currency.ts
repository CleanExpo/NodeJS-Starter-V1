import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { GEMINI_APPROVED_MODELS } from '../model-registry/index.js';

export interface ModelFinding {
  file: string;
  line: number;
  modelId: string;
  status: 'CURRENT' | 'OUTDATED' | 'UNAPPROVED';
}

const MODEL_PATTERNS: RegExp[] = [/gemini-[\w.-]+/g, /imagen-[\w.-]+/g, /claude-[\w.-]+/g];

const APPROVED_IDS = new Set<string>(Object.values(GEMINI_APPROVED_MODELS).map((m) => m.id));

const SCAN_EXTENSIONS = new Set<string>(['.ts', '.js', '.py', '.json', '.env', '.yaml', '.yml']);

const SKIP_DIRS = new Set<string>([
  'node_modules',
  '.git',
  'dist',
  '.turbo',
  '.next',
  '__pycache__',
]);

function walkDir(dir: string): string[] {
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      try {
        const stat = statSync(full);
        if (stat.isDirectory()) {
          results.push(...walkDir(full));
        } else if (SCAN_EXTENSIONS.has(extname(entry).toLowerCase())) {
          results.push(full);
        }
      } catch {
        /* skip unreadable entries */
      }
    }
  } catch {
    /* skip unreadable directories */
  }
  return results;
}

export function scanForModelReferences(rootDir: string): ModelFinding[] {
  const findings: ModelFinding[] = [];
  const files = walkDir(rootDir);

  for (const filePath of files) {
    let content: string;
    try {
      content = readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }

    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      for (const pattern of MODEL_PATTERNS) {
        // Reset lastIndex for global regex
        pattern.lastIndex = 0;
        const matches = line.match(pattern) ?? [];
        for (const match of matches) {
          findings.push({
            file: filePath,
            line: idx + 1,
            modelId: match,
            status: APPROVED_IDS.has(match) ? 'CURRENT' : 'OUTDATED',
          });
        }
      }
    });
  }

  return findings;
}

export function generateCurrencyReport(findings: ModelFinding[]): string {
  const date = new Date().toLocaleDateString('en-AU');
  const lines: string[] = [
    '# Model Currency Report',
    '',
    `Generated: ${date}`,
    '',
    '## Approved Model Policy',
    '',
    '| Tier | Approved Model ID | Approved Since |',
    '|------|-------------------|----------------|',
  ];

  for (const [tier, config] of Object.entries(GEMINI_APPROVED_MODELS)) {
    lines.push(`| ${tier} | \`${config.id}\` | ${config.approvedAt} |`);
  }

  lines.push('', '## Findings', '');

  if (findings.length === 0) {
    lines.push('No model references found in codebase.');
  } else {
    lines.push('| File | Line | Model ID | Status |');
    lines.push('|------|------|----------|--------|');
    for (const f of findings) {
      const short = f.file.replace(process.cwd(), '.');
      const icon = f.status === 'CURRENT' ? '✅' : '⚠️';
      lines.push(`| \`${short}\` | ${f.line} | \`${f.modelId}\` | ${icon} ${f.status} |`);
    }
  }

  const outdated = findings.filter((f) => f.status !== 'CURRENT').length;
  lines.push('', `## Summary`, '');
  lines.push(`- Total references: ${findings.length}`);
  lines.push(`- Current: ${findings.length - outdated}`);
  lines.push(`- Outdated/Unapproved: ${outdated}`);

  if (outdated > 0) {
    lines.push('', `> ⚠️ ${outdated} model reference(s) need updating before shipping.`);
  } else {
    lines.push('', '> ✅ All model references are current.');
  }

  return lines.join('\n');
}

// CLI entry point — only runs when invoked directly
// Usage: node src/ai/version-checks/check-model-currency.js [rootDir]
const isMain =
  process.argv[1]?.endsWith('check-model-currency.js') ||
  process.argv[1]?.endsWith('check-model-currency.ts');

if (isMain) {
  const rootDir = process.argv[2] ?? process.cwd();
  const findings = scanForModelReferences(rootDir);
  const report = generateCurrencyReport(findings);
  mkdirSync('reports', { recursive: true });
  writeFileSync('reports/model-currency-report.md', report, 'utf8');
  console.log(report);
  console.log('\n✅ Report saved to reports/model-currency-report.md');
}
