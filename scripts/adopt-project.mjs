#!/usr/bin/env node
// adopt-project.mjs
// Usage: pnpm starter:adopt "<target-project-path>" [--linear] [--full-audit]

import { adoptProject } from '../dist/src/ai/adoption/project-adopter.js';

const args = process.argv.slice(2);
const targetDir = args.find((a) => !a.startsWith('--'));

if (!targetDir) {
  console.error('Usage: pnpm starter:adopt "<target-project-path>" [--linear] [--full-audit]');
  console.error('');
  console.error('Options:');
  console.error('  --linear      Sync critical gaps to Linear (requires LINEAR_API_KEY + LINEAR_TEAM_ID)');
  console.error('  --full-audit  Include model currency audit');
  process.exit(1);
}

await adoptProject({
  targetDir,
  syncLinear: args.includes('--linear'),
  fullAudit: args.includes('--full-audit'),
});
