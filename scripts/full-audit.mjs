#!/usr/bin/env node
// full-audit.mjs
// Usage: pnpm starter:audit [project-path]
// Runs the complete self-audit on this repository or a target project.

import { scanProject } from '../dist/src/ai/adoption/project-scanner.js';
import { analyzeGaps, formatGapReport } from '../dist/src/ai/adoption/gap-analyzer.js';
import { scanForModelReferences, generateCurrencyReport } from '../dist/src/ai/version-checks/check-model-currency.js';
import { writeFileSync, mkdirSync } from 'node:fs';

const targetDir = process.argv[2] ?? process.cwd();

console.log(`\n🔬 Full Audit: ${targetDir}`);
console.log('─'.repeat(60));

// 1. Project scan and gap analysis
const profile = scanProject(targetDir);
const gaps = analyzeGaps(profile);
const gapReport = formatGapReport(profile, gaps);

// 2. Model currency audit
const modelFindings = scanForModelReferences(targetDir);
const modelReport = generateCurrencyReport(modelFindings);

// 3. Save reports
mkdirSync('reports', { recursive: true });
writeFileSync('reports/gap-analysis.md', gapReport, 'utf8');
writeFileSync('reports/model-currency-report.md', modelReport, 'utf8');

// 4. Print to console
console.log(gapReport);
console.log('\n' + '─'.repeat(60));
console.log(modelReport);
console.log('\n' + '─'.repeat(60));
console.log('📁 Reports saved to:');
console.log('   reports/gap-analysis.md');
console.log('   reports/model-currency-report.md');

// Exit non-zero if critical gaps found
const criticalCount = gaps.filter((g) => g.severity === 'critical').length;
if (criticalCount > 0) {
  console.error(`\n⛔ ${criticalCount} CRITICAL gap(s) found.`);
  process.exit(1);
}
