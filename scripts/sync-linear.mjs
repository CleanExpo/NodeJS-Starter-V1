#!/usr/bin/env node
// sync-linear.mjs
// Usage: LINEAR_API_KEY=xxx LINEAR_TEAM_ID=yyy pnpm starter:sync-linear [project-path]

import { scanProject } from '../dist/src/ai/adoption/project-scanner.js';
import { analyzeGaps } from '../dist/src/ai/adoption/gap-analyzer.js';
import { syncGapsToLinear } from '../dist/src/integrations/linear/sync-issues.js';

const apiKey = process.env['LINEAR_API_KEY'];
const teamId = process.env['LINEAR_TEAM_ID'];

if (!apiKey || !teamId) {
  console.error('Required environment variables:');
  console.error('  LINEAR_API_KEY   — your Linear API key');
  console.error('  LINEAR_TEAM_ID   — your Linear team ID');
  console.error('');
  console.error('Usage: LINEAR_API_KEY=xxx LINEAR_TEAM_ID=yyy pnpm starter:sync-linear [project-path]');
  process.exit(1);
}

const targetDir = process.argv[2] ?? process.cwd();
console.log(`\n🔍 Scanning for adoption gaps: ${targetDir}`);

const profile = scanProject(targetDir);
const gaps = analyzeGaps(profile);

if (gaps.length === 0) {
  console.log('✅ No gaps found. Nothing to sync to Linear.');
  process.exit(0);
}

await syncGapsToLinear(gaps, apiKey, teamId);
