import { mkdirSync, writeFileSync } from 'node:fs';
import { scanProject } from './project-scanner.js';
import { analyzeGaps, formatGapReport } from './gap-analyzer.js';
import {
  scanForModelReferences,
  generateCurrencyReport,
} from '../version-checks/check-model-currency.js';

export interface AdoptOptions {
  targetDir: string;
  syncLinear?: boolean;
  fullAudit?: boolean;
  outputDir?: string;
}

export async function adoptProject(options: AdoptOptions): Promise<void> {
  const { targetDir, fullAudit = false, outputDir = 'reports' } = options;

  console.log(`\n🔍 Scanning project: ${targetDir}\n`);

  const profile = scanProject(targetDir);

  console.log(`📦 Stack detected: ${profile.detectedStack.join(', ') || 'Unknown'}`);
  console.log(`📋 CLAUDE.md:  ${profile.hasClaudeMd ? '✅' : '❌'}`);
  console.log(`🧠 memory.md:  ${profile.hasMemoryMd ? '✅' : '❌'}`);
  console.log(`🎯 Skills:     ${profile.hasSkills ? '✅' : '❌'}`);
  console.log(`🤖 Agents:     ${profile.hasAgents ? '✅' : '❌'}`);
  console.log(`🔐 Auth:       ${profile.hasAuth ? '✅' : '❌'}`);
  console.log(`🧪 Tests:      ${profile.hasTests ? '✅' : '❌'}`);
  console.log(`🔄 CI/CD:      ${profile.hasCiCd ? '✅' : '❌'}`);
  console.log(`📊 Linear:     ${profile.hasLinear ? '✅' : '❌'}`);

  const gaps = analyzeGaps(profile);
  const gapReport = formatGapReport(profile, gaps);

  mkdirSync(outputDir, { recursive: true });
  const gapPath = `${outputDir}/gap-analysis.md`;
  writeFileSync(gapPath, gapReport, 'utf8');
  console.log(`\n📊 Gap analysis → ${gapPath}`);
  console.log('\n' + '─'.repeat(60));
  console.log(gapReport);
  console.log('─'.repeat(60));

  if (fullAudit) {
    console.log('\n🔬 Running model currency audit...\n');
    const modelFindings = scanForModelReferences(targetDir);
    const modelReport = generateCurrencyReport(modelFindings);
    const modelPath = `${outputDir}/model-currency-report.md`;
    writeFileSync(modelPath, modelReport, 'utf8');
    console.log(`🤖 Model report → ${modelPath}`);
  }

  const criticalCount = gaps.filter((g) => g.severity === 'critical').length;

  if (criticalCount > 0) {
    console.error(`\n⛔ ${criticalCount} CRITICAL gap(s) found. Project is NOT adoption-ready.`);
    process.exit(1);
  } else {
    console.log(`\n✅ No critical gaps. Project is adoption-ready.`);
  }
}
