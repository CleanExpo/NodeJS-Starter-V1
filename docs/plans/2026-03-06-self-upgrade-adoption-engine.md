---
id: 2026-03-06-self-upgrade-adoption-engine
type: doc
version: 1.0.0
created: 20/03/2026
modified: 20/03/2026
status: active
---

# Self-Upgrade + Adoption Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform NodeJS-Starter-V1 into a self-auditing, self-upgrading project-adoption framework with governance, agent hierarchy, skills, model registry, and a one-line adopt command.

**Architecture:** All governance lives in `memory.md` (root) and is loaded first by CLAUDE.md. Agent hierarchy is documented in `docs/agent-framework/`. TypeScript adoption/audit tools live in `src/` (new root-level package). Scripts expose the one-line command interface.

**Tech Stack:** TypeScript (Node ESM), pure Node.js fs APIs (no shell exec), Markdown governance files, existing Linear MCP, existing `.skills/custom/` pattern.

**What already exists (do not recreate):**

- `.skills/custom/outcome-translator/SKILL.md` — already complete
- `.skills/custom/blueprint-first/SKILL.md` — already complete
- `.mcp.json` Linear config — already wired with LINEAR_API_KEY
- `.claude/agents/orchestrator/agent.md` — existing orchestrator

---

## Task 1: Create `memory.md` — Operational Constitution (Phase 1)

**Files:**

- Create: `memory.md` (root)

**Step 1: Write memory.md**

Create `memory.md` at the repository root. Include the following sections in order:

```markdown
# memory.md — NodeJS-Starter-V1 Operational Constitution

> Version: 1.0.0 | Last Updated: 06/03/2026 | Authority: Permanent
> Load this file before any planning, delegation, execution, or completion claim.

## 1. Founder Communication Model

...table of outcome phrases + engineering meaning...

## 2. Definition of Finished

Default meaning: production-ready SaaS.
Checklists: Frontend / Backend / Data / Security / Payments / Integrations / Deployment / Business / Visual

## 3. Agent Hierarchy

1. Senior PM Agent → translate outcome language, define DoD
2. Senior Orchestrator → coordinate, gate, collect evidence
3. Senior Specialist Agents → domain implementation (6 types)
4. Sub-Agents → isolated file edits, targeted searches, evidence collection

## 4. Skill Architecture

Max 6–8 skills per agent.
Skill schema: name | purpose | type | triggers | inputs | steps | validation gates | output format | failure modes | eval examples

## 5. Blueprint First Protocol

Step 1 GENERATE → Step 2 ITERATE → Step 3 CONVERT → Step 4 BUILD

## 6. Completion Claim Protocol

BANNED phrases: "Done!", "Complete", "Finished", "Everything is working"
REQUIRED: all DoD criteria = PROVEN with proof artifacts

## 7. Evaluation System

Score dimensions: correctness, completeness, proof, velocity

## 8. Visual Excellence and Model Currency Protocol

Model routing:

- reasoning/orchestration → Gemini 2.5 Pro / Claude Sonnet 4.6+
- fast image generation/editing → Gemini 2.5 Flash Image / Nano Banana
- high-fidelity branding visuals → Imagen 4

Visual: no factory-default UI. OLED Black #050505. rounded-sm only.

## 9. Development Principles

Local-First | Zero Barriers | Production Ready | Retrieval-First
```

**Step 2: Verify**

```bash
wc -l memory.md
head -10 memory.md
```

Expected: > 150 lines, header visible.

---

## Task 2: Update `CLAUDE.md` to Load `memory.md` First (Phase 2)

**Files:**

- Modify: `CLAUDE.md`

**Step 1: Read the current CLAUDE.md** — read the full file before modifying.

**Step 2: Insert memory.md directive**

Insert directly after the `# CLAUDE.md — NodeJS-Starter-V1` heading:

````markdown
## Operational Constitution

> **REQUIRED**: Load `memory.md` before any planning, delegation, execution, or completion claim.

```bash
cat memory.md   # Load before every reasoning session
```
````

```

**Step 3: Add to Documentation table**

```

| [`memory.md`](memory.md) | Operational constitution — load first |

````

**Step 4: Verify**

```bash
head -30 CLAUDE.md
````

Expected: memory.md directive appears before Quick Commands.

---

## Task 3: `docs/agent-framework/SENIOR_PM_AGENT.md` (Phase 3)

**Files:**

- Create: `docs/agent-framework/SENIOR_PM_AGENT.md`

**Step 1: Write the file**

Content sections:

- Role definition
- Trigger phrases (all outcome language patterns)
- Output format: full OUTCOME TRANSLATION block matching `.claude/rules/human-outcome-translation.md`
- Escalation protocol
- Skills: outcome-translator, definition-of-done-builder, delegation-planner
- Worked example: "Launch it" → full OUTCOME TRANSLATION

**Step 2: Verify**

```bash
wc -l docs/agent-framework/SENIOR_PM_AGENT.md
```

Expected: > 80 lines.

---

## Task 4: `docs/agent-framework/SENIOR_ORCHESTRATOR_AGENT.md` (Phase 3)

**Files:**

- Create: `docs/agent-framework/SENIOR_ORCHESTRATOR_AGENT.md`

**Step 1: Write the file**

Content sections:

- Role: delegate, coordinate, enforce dependency order, collect evidence, block false completion
- Delegation decision tree
- Evidence collection protocol: files, logs, screenshots, test results required (not summaries)
- Completion blocking conditions
- Skills: delegation-planner, evidence-verifier, finished-audit, blueprint-first
- Phase-lock pattern
- Token budget: < 80K tokens

**Step 2: Verify**

```bash
wc -l docs/agent-framework/SENIOR_ORCHESTRATOR_AGENT.md
```

Expected: > 80 lines.

---

## Task 5: `docs/agent-framework/SENIOR_SPECIALIST_AGENTS.md` (Phase 3)

**Files:**

- Create: `docs/agent-framework/SENIOR_SPECIALIST_AGENTS.md`

**Step 1: Write 6 agent definitions**

Each agent: name, role, context scope, token budget, trigger phrases, 6–8 max skills, evidence output format.

Agents:

1. Senior Engineering Agent
2. Senior UI/UX Agent
3. Senior QA / Production Agent
4. Senior Research Agent
5. Senior LMS Content Agent
6. Senior Growth / Marketing Agent

**Step 2: Verify**

```bash
wc -l docs/agent-framework/SENIOR_SPECIALIST_AGENTS.md
```

Expected: > 120 lines.

---

## Task 6: `docs/agent-framework/SUB_AGENT_PROTOCOL.md` (Phase 3)

**Files:**

- Create: `docs/agent-framework/SUB_AGENT_PROTOCOL.md`

**Step 1: Write the file**

Content:

- Sub-agents MUST return: evidence, files, logs, screenshots, comparisons, test results
- Banned response patterns: "It's done", "Looks good", "Should be working"
- Required evidence schema:
  ```
  EVIDENCE: [artifact type]
  PATH: [file path or URL]
  CONTENT: [actual content or result]
  STATUS: PROVEN | UNKNOWN | BLOCKED
  ```
- Iteration caps (from `.claude/rules/skills/minions-protocol.md`)
- Escalation triggers

**Step 2: Verify**

```bash
wc -l docs/agent-framework/SUB_AGENT_PROTOCOL.md
```

Expected: > 60 lines.

---

## Task 7: `docs/agent-framework/RECOMMENDED_SKILL_MAP.md` (Phase 3)

**Files:**

- Create: `docs/agent-framework/RECOMMENDED_SKILL_MAP.md`

**Step 1: Write the file**

Skill map table: Agent → Skill 1..8 (max 8). Reference existing `.skills/custom/` skills.

Also include:

- Skill loading order
- When NOT to load a skill
- Conflict resolution

**Step 2: Verify**

```bash
wc -l docs/agent-framework/RECOMMENDED_SKILL_MAP.md
```

Expected: > 60 lines.

---

## Task 8: Skill — `definition-of-done-builder` (Phase 4)

**Files:**

- Create: `.skills/custom/definition-of-done-builder/SKILL.md`

**Step 1: Write full SKILL.md with YAML frontmatter**

```yaml
---
name: definition-of-done-builder
description: >
  Build measurable, verifiable Definition of Done criteria for any outcome phrase.
  Generates a full DoD checklist with Proven/Unknown/Missing status labels.
type: Capability Uplift
triggers:
  - 'what does done mean'
  - 'define done'
  - 'what needs to be true'
  - 'when is it finished'
  - 'what are the success criteria'
---
```

Procedure: categorised checklist (Frontend/Backend/Data/Security/Payments/Integrations/Deployment/Business), Proven|Unknown|Missing status, proof artifact per Unknown, gate conditions.

**Step 2: Verify**

```bash
wc -l .skills/custom/definition-of-done-builder/SKILL.md
```

Expected: > 80 lines.

---

## Task 9: Skill — `finished-audit` (Phase 4)

**Files:**

- Create: `.skills/custom/finished-audit/SKILL.md`

**Step 1: Write full SKILL.md**

```yaml
---
name: finished-audit
description: >
  Verify whether "finished" is actually true. Audits against DoD criteria
  and blocks false completion claims.
type: Capability Uplift
triggers:
  - 'are we done'
  - 'is this finished'
  - 'audit completion'
  - 'verify done'
  - 'check if complete'
---
```

Procedure:

1. Load DoD criteria
2. Verify each with evidence, label PROVEN/UNKNOWN/MISSING
3. Calculate completion %
4. If any UNKNOWN or MISSING: output NOT COMPLETE block
5. If all PROVEN: output COMPLETION APPROVED with proof artifacts

Must include a banned output phrases section listing: "Done!", "Complete", "Finished", "Everything is working".

**Step 2: Verify**

```bash
wc -l .skills/custom/finished-audit/SKILL.md
```

Expected: > 80 lines.

---

## Task 10: Skill — `evidence-verifier` (Phase 4)

**Files:**

- Create: `.skills/custom/evidence-verifier/SKILL.md`

**Step 1: Write full SKILL.md**

```yaml
---
name: evidence-verifier
description: >
  Verify that proof artifacts exist, are real, and match claims.
  Prevents phantom evidence and assumption-based completion.
type: Capability Uplift
triggers:
  - 'verify the proof'
  - 'check the evidence'
  - 'is there proof'
  - 'show me the artifacts'
---
```

Procedure: enumerate claimed artifacts, verify each physically exists, classify VERIFIED|CLAIMED|PHANTOM, reject CLAIMED/PHANTOM.

**Step 2: Verify**

```bash
wc -l .skills/custom/evidence-verifier/SKILL.md
```

Expected: > 60 lines.

---

## Task 11: Skill — `model-currency-checker` (Phase 4)

**Files:**

- Create: `.skills/custom/model-currency-checker/SKILL.md`

**Step 1: Write full SKILL.md**

```yaml
---
name: model-currency-checker
description: >
  Compare configured AI model usage against approved current policy.
  Flags outdated models and generates a currency report.
type: Capability Uplift
triggers:
  - 'check model versions'
  - 'are models up to date'
  - 'model currency'
  - 'which models are we using'
  - 'audit ai models'
---
```

Approved policy table:

- Reasoning/orchestration: Gemini 2.5 Pro / Claude Sonnet 4.6+
- Fast image gen/editing: Gemini 2.5 Flash Image / Nano Banana
- High-fidelity branding: Imagen 4

Procedure: scan codebase for AI model references, compare to policy, flag CURRENT|OUTDATED|UNAPPROVED, generate `reports/model-currency-report.md`.

**Step 2: Verify**

```bash
wc -l .skills/custom/model-currency-checker/SKILL.md
```

Expected: > 80 lines.

---

## Task 12: Skill — `visual-excellence-enforcer` (Phase 4)

**Files:**

- Create: `.skills/custom/visual-excellence-enforcer/SKILL.md`

**Step 1: Write full SKILL.md**

```yaml
---
name: visual-excellence-enforcer
description: >
  Prevent factory-default LLM UI from being accepted as complete.
  Enforces Scientific Luxury design system and screenshot-based proof.
type: Encoded Preference Workflow
triggers:
  - 'check the UI'
  - 'review the design'
  - 'is the visual quality acceptable'
  - 'audit visual'
  - 'does it look good'
---
```

Banned visual patterns (reject immediately):

- Grey/white backgrounds (must be OLED Black `#050505`)
- `rounded-lg`, `rounded-full`, `rounded-xl` (only `rounded-sm`)
- Linear CSS transitions (use approved cubic-bezier easings)
- Placeholder images / default browser fonts
- Generic unstyled shadcn defaults

Evidence required: screenshot + side-by-side vs. design token spec + Pass/Fail per rule.

**Step 2: Verify**

```bash
wc -l .skills/custom/visual-excellence-enforcer/SKILL.md
```

Expected: > 80 lines.

---

## Task 13: Skill — `delegation-planner` (Phase 4)

**Files:**

- Create: `.skills/custom/delegation-planner/SKILL.md`

**Step 1: Write full SKILL.md**

```yaml
---
name: delegation-planner
description: >
  Map work to the correct agent hierarchy layer.
  Prevents PM agents doing implementation or specialists doing strategy.
type: Capability Uplift
triggers:
  - 'who should do this'
  - 'which agent handles'
  - 'delegate this'
  - 'plan delegation'
  - 'assign tasks'
---
```

Decision tree:

- Outcome language / stakeholder comms → Senior PM
- Multi-agent coordination / phase gating → Senior Orchestrator
- Domain implementation → Senior Specialist (by domain)
- Isolated file edits / targeted searches → Sub-Agent

Output: delegation plan table (agent, task, evidence required, gate condition).

**Step 2: Verify**

```bash
wc -l .skills/custom/delegation-planner/SKILL.md
```

Expected: > 60 lines.

---

## Task 14: Create Root `src/` TypeScript Package (Phase 5 setup)

**Files:**

- Create: `src/package.json`
- Create: `src/tsconfig.json`

**Step 1: Write `src/package.json`**

```json
{
  "name": "@starter/ai-framework",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.7.2"
  }
}
```

**Step 2: Write `src/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "strict": true,
    "declaration": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["./**/*.ts"],
  "exclude": ["**/__tests__/**", "**/*.test.ts"]
}
```

**Step 3: Verify**

```bash
ls src/package.json src/tsconfig.json
```

---

## Task 15: Model Registry — `providers/gemini.ts` + `index.ts` (Phase 5)

**Files:**

- Create: `src/ai/model-registry/providers/gemini.ts`
- Create: `src/ai/model-registry/index.ts`

**Step 1: Write `gemini.ts`**

```typescript
export type ModelTier = 'reasoning' | 'fast-image' | 'branding-image';

export interface ModelConfig {
  id: string;
  name: string;
  tier: ModelTier;
  approved: boolean;
  approvedAt: string;
  replacedBy?: string;
}

export const GEMINI_APPROVED_MODELS: Record<ModelTier, ModelConfig> = {
  reasoning: {
    id: 'gemini-2.5-pro-preview',
    name: 'Gemini 2.5 Pro Preview',
    tier: 'reasoning',
    approved: true,
    approvedAt: '2026-03-06',
  },
  'fast-image': {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    tier: 'fast-image',
    approved: true,
    approvedAt: '2026-03-06',
  },
  'branding-image': {
    id: 'imagen-4',
    name: 'Imagen 4',
    tier: 'branding-image',
    approved: true,
    approvedAt: '2026-03-06',
  },
};

export function checkModelCurrency(
  configuredId: string,
  tier: ModelTier
): 'CURRENT' | 'OUTDATED' | 'UNAPPROVED' {
  const approved = GEMINI_APPROVED_MODELS[tier];
  if (!approved) return 'UNAPPROVED';
  if (configuredId === approved.id) return 'CURRENT';
  if (approved.replacedBy === configuredId) return 'CURRENT';
  return 'OUTDATED';
}
```

**Step 2: Write `index.ts`**

```typescript
export { GEMINI_APPROVED_MODELS, checkModelCurrency } from './providers/gemini.js';
export type { ModelTier, ModelConfig } from './providers/gemini.js';
```

---

## Task 16: Model Currency Checker — `check-model-currency.ts` (Phase 5)

**Files:**

- Create: `src/ai/version-checks/check-model-currency.ts`

Uses pure Node.js `fs` walk — no shell subprocess.

**Step 1: Write the file**

```typescript
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { GEMINI_APPROVED_MODELS } from '../model-registry/index.js';

export interface ModelFinding {
  file: string;
  line: number;
  modelId: string;
  status: 'CURRENT' | 'OUTDATED' | 'UNAPPROVED';
}

const MODEL_PATTERNS = [/gemini-[\w.-]+/g, /imagen-[\w.-]+/g, /claude-[\w.-]+/g];

const APPROVED_IDS = new Set(Object.values(GEMINI_APPROVED_MODELS).map((m) => m.id));

const SCAN_EXTENSIONS = new Set(['.ts', '.js', '.py', '.json', '.env', '.yaml', '.yml']);

function walkDir(dir: string): string[] {
  const results: string[] = [];
  const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.turbo']);
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
        /* skip unreadable */
      }
    }
  } catch {
    /* skip unreadable dir */
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
    '| Tier | Approved Model ID |',
    '|------|-------------------|',
  ];

  for (const [tier, config] of Object.entries(GEMINI_APPROVED_MODELS)) {
    lines.push(`| ${tier} | \`${config.id}\` |`);
  }

  lines.push('', '## Findings', '');

  if (findings.length === 0) {
    lines.push('No model references found in codebase.');
  } else {
    lines.push('| File | Line | Model ID | Status |');
    lines.push('|------|------|----------|--------|');
    for (const f of findings) {
      const icon = f.status === 'CURRENT' ? '✅' : '⚠️';
      const short = f.file.replace(process.cwd(), '.');
      lines.push(`| \`${short}\` | ${f.line} | \`${f.modelId}\` | ${icon} ${f.status} |`);
    }
  }

  return lines.join('\n');
}
```

---

## Task 17: Routing Policy + Visual Audit (Phase 5)

**Files:**

- Create: `src/ai/graphics/routing-policy.ts`
- Create: `src/ai/audits/visual-audit.ts`

**Step 1: Write `routing-policy.ts`**

```typescript
export type TaskCategory =
  | 'reasoning'
  | 'orchestration'
  | 'fast-image-generation'
  | 'image-editing'
  | 'branding-visual'
  | 'logo-render';

export interface RouteDecision {
  category: TaskCategory;
  provider: 'google' | 'anthropic' | 'nano-banana';
  modelId: string;
  rationale: string;
}

const ROUTING_TABLE: Record<TaskCategory, RouteDecision> = {
  reasoning: {
    category: 'reasoning',
    provider: 'google',
    modelId: 'gemini-2.5-pro-preview',
    rationale: 'Complex reasoning requires highest-capability model',
  },
  orchestration: {
    category: 'orchestration',
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-6',
    rationale: 'Agent coordination uses Claude for instruction following',
  },
  'fast-image-generation': {
    category: 'fast-image-generation',
    provider: 'google',
    modelId: 'gemini-2.5-flash-image',
    rationale: 'Fast iteration cycles require low-latency image model',
  },
  'image-editing': {
    category: 'image-editing',
    provider: 'nano-banana',
    modelId: 'nano-banana-pro',
    rationale: 'Image editing with context uses Nano Banana',
  },
  'branding-visual': {
    category: 'branding-visual',
    provider: 'google',
    modelId: 'imagen-4',
    rationale: 'High-fidelity branding requires Imagen 4 quality',
  },
  'logo-render': {
    category: 'logo-render',
    provider: 'google',
    modelId: 'imagen-4',
    rationale: '3D logo renders require Imagen 4 quality',
  },
};

export function routeTask(category: TaskCategory): RouteDecision {
  return ROUTING_TABLE[category];
}

export function getAllRoutes(): RouteDecision[] {
  return Object.values(ROUTING_TABLE);
}
```

**Step 2: Write `visual-audit.ts`**

```typescript
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
  requiresMatch: boolean; // true = pattern must be found; false = pattern must NOT be found
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
    rule: 'No rounded-lg or rounded-full (use rounded-sm only)',
    pattern: /rounded-(?:lg|full|xl|2xl|3xl)/i,
    requiresMatch: false,
  },
  {
    id: 'framer-motion',
    rule: 'Animations use Framer Motion',
    pattern: /from\s+['"]framer-motion['"]/i,
    requiresMatch: true,
  },
  {
    id: 'jetbrains-mono',
    rule: 'Monospace font is JetBrains Mono',
    pattern: /JetBrains[- ]Mono/i,
    requiresMatch: true,
  },
];

export function auditFile(filePath: string): VisualAuditResult[] {
  if (!existsSync(filePath)) {
    return [{ rule: 'File exists', status: 'FAIL', evidence: `Not found: ${filePath}` }];
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
          ? `Pattern not found in ${filePath}`
          : `Banned pattern found in ${filePath}`,
    };
  });
}

export function generateVisualAuditReport(results: VisualAuditResult[]): string {
  const lines = [
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
  lines.push('', `**Score: ${passes}/${results.length} passing**`);

  return lines.join('\n');
}
```

---

## Task 18: Adoption Engine — Scanner + Gap Analyser + Adopter (Phase 6)

**Files:**

- Create: `src/ai/adoption/project-scanner.ts`
- Create: `src/ai/adoption/gap-analyzer.ts`
- Create: `src/ai/adoption/project-adopter.ts`

**Step 1: Write `project-scanner.ts`**

```typescript
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
  const at = (p: string) => join(rootDir, p);
  const has = (p: string) => existsSync(at(p));

  const pkg = readJsonSafe(at('package.json'));
  const allDeps = {
    ...((pkg?.['dependencies'] as Record<string, string>) ?? {}),
    ...((pkg?.['devDependencies'] as Record<string, string>) ?? {}),
  };
  const depsStr = JSON.stringify(allDeps);

  const hasNextJs = 'next' in allDeps || has('next.config.ts') || has('next.config.js');
  const hasFastApi = has('apps/backend') || has('requirements.txt');
  const hasDocker = has('docker-compose.yml') || has('Dockerfile');
  const hasPostgres =
    has('scripts/init-db.sql') || depsStr.includes('postgres') || depsStr.includes('"pg"');

  const detectedStack: string[] = [];
  if (hasNextJs) detectedStack.push('Next.js');
  if (hasFastApi) detectedStack.push('FastAPI');
  if (hasDocker) detectedStack.push('Docker');
  if (hasPostgres) detectedStack.push('PostgreSQL');

  let hasLinear = false;
  const mcpJson = readJsonSafe(at('.mcp.json'));
  if (mcpJson) {
    hasLinear = JSON.stringify(mcpJson).includes('linear');
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
```

**Step 2: Write `gap-analyzer.ts`**

```typescript
import { ProjectProfile } from './project-scanner.js';

export interface Gap {
  id: string;
  category: 'governance' | 'architecture' | 'testing' | 'ci-cd' | 'integrations' | 'security';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  remediation: string;
}

export function analyzeGaps(profile: ProjectProfile): Gap[] {
  const gaps: Gap[] = [];

  if (!profile.hasMemoryMd)
    gaps.push({
      id: 'no-memory-md',
      category: 'governance',
      severity: 'critical',
      description: 'No memory.md operational constitution',
      remediation: 'Copy memory.md from NodeJS-Starter-V1',
    });

  if (!profile.hasClaudeMd)
    gaps.push({
      id: 'no-claude-md',
      category: 'governance',
      severity: 'critical',
      description: 'No CLAUDE.md project instructions',
      remediation: 'Create CLAUDE.md with architecture routing and governance rules',
    });

  if (!profile.hasSkills)
    gaps.push({
      id: 'no-skills',
      category: 'governance',
      severity: 'major',
      description: 'No agent skills installed',
      remediation: 'Copy .skills/custom/ from NodeJS-Starter-V1',
    });

  if (!profile.hasAgents)
    gaps.push({
      id: 'no-agents',
      category: 'governance',
      severity: 'major',
      description: 'No agent configurations',
      remediation: 'Copy .claude/agents/ from NodeJS-Starter-V1',
    });

  if (!profile.hasAuth)
    gaps.push({
      id: 'no-auth',
      category: 'security',
      severity: 'critical',
      description: 'No authentication layer detected',
      remediation: 'Implement JWT auth middleware',
    });

  if (!profile.hasTests)
    gaps.push({
      id: 'no-tests',
      category: 'testing',
      severity: 'major',
      description: 'No test suite detected',
      remediation: 'Add unit and integration test coverage',
    });

  if (!profile.hasCiCd)
    gaps.push({
      id: 'no-ci-cd',
      category: 'ci-cd',
      severity: 'major',
      description: 'No CI/CD pipeline',
      remediation: 'Add GitHub Actions workflows',
    });

  if (!profile.hasLinear)
    gaps.push({
      id: 'no-linear',
      category: 'integrations',
      severity: 'minor',
      description: 'No Linear MCP integration',
      remediation: 'Add Linear MCP to .mcp.json',
    });

  if (!profile.hasDocker)
    gaps.push({
      id: 'no-docker',
      category: 'architecture',
      severity: 'major',
      description: 'No Docker configuration',
      remediation: 'Add docker-compose.yml for local services',
    });

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
    `**Stack**: ${profile.detectedStack.join(', ') || 'Unknown'}`,
    `**Generated**: ${new Date().toLocaleDateString('en-AU')}`,
    '',
    '## Summary',
    `- 🔴 Critical: ${critical.length}`,
    `- 🟡 Major: ${major.length}`,
    `- 🟢 Minor: ${minor.length}`,
    '',
    '## Gaps',
    '',
  ];

  for (const g of gaps) {
    const icon = g.severity === 'critical' ? '🔴' : g.severity === 'major' ? '🟡' : '🟢';
    lines.push(
      `### ${icon} ${g.id}`,
      `**Category**: ${g.category} | **Severity**: ${g.severity}`,
      `**Issue**: ${g.description}`,
      `**Fix**: ${g.remediation}`,
      ''
    );
  }

  return lines.join('\n');
}
```

**Step 3: Write `project-adopter.ts`**

```typescript
import { mkdirSync, writeFileSync } from 'node:fs';
import { scanProject, ProjectProfile } from './project-scanner.js';
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
  const profile: ProjectProfile = scanProject(targetDir);

  console.log(`📦 Stack: ${profile.detectedStack.join(', ') || 'Unknown'}`);
  console.log(`📋 CLAUDE.md: ${profile.hasClaudeMd ? '✅' : '❌'}`);
  console.log(`🧠 memory.md: ${profile.hasMemoryMd ? '✅' : '❌'}`);
  console.log(`🎯 Skills: ${profile.hasSkills ? '✅' : '❌'}`);
  console.log(`🤖 Agents: ${profile.hasAgents ? '✅' : '❌'}`);
  console.log(`🔐 Auth: ${profile.hasAuth ? '✅' : '❌'}`);
  console.log(`🧪 Tests: ${profile.hasTests ? '✅' : '❌'}`);

  const gaps = analyzeGaps(profile);
  const gapReport = formatGapReport(profile, gaps);

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(`${outputDir}/gap-analysis.md`, gapReport, 'utf8');
  console.log(`\n📊 Gap analysis → ${outputDir}/gap-analysis.md`);
  console.log(gapReport);

  if (fullAudit) {
    console.log('\n🔬 Running model currency audit...\n');
    const modelFindings = scanForModelReferences(targetDir);
    const modelReport = generateCurrencyReport(modelFindings);
    writeFileSync(`${outputDir}/model-currency-report.md`, modelReport, 'utf8');
    console.log(`🤖 Model report → ${outputDir}/model-currency-report.md`);
  }

  const critical = gaps.filter((g) => g.severity === 'critical').length;
  if (critical > 0) {
    console.error(`\n⛔ ${critical} CRITICAL gap(s) found. Project is NOT adoption-ready.`);
    process.exit(1);
  } else {
    console.log(`\n✅ No critical gaps. Project is adoption-ready.`);
  }
}
```

---

## Task 19: Linear Integration (Phase 6)

**Files:**

- Create: `src/integrations/linear/client.ts`
- Create: `src/integrations/linear/sync-issues.ts`

**Step 1: Write `client.ts`**

```typescript
export interface LinearIssue {
  title: string;
  description: string;
  priority: 0 | 1 | 2 | 3 | 4;
  teamId: string;
}

export interface LinearCreatedIssue {
  id: string;
  url: string;
}

interface GraphQLResponse {
  data?: Record<string, unknown>;
  errors?: Array<{ message: string }>;
}

export function createLinearClient(apiKey: string) {
  const BASE_URL = 'https://api.linear.app/graphql';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: apiKey,
  };

  async function graphql(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });
    const json = (await res.json()) as GraphQLResponse;
    if (json.errors?.length) throw new Error(json.errors[0].message);
    return json.data ?? {};
  }

  return {
    async createIssue(issue: LinearIssue): Promise<LinearCreatedIssue> {
      const data = await graphql(
        `
          mutation CreateIssue($input: IssueCreateInput!) {
            issueCreate(input: $input) {
              issue {
                id
                url
              }
            }
          }
        `,
        { input: issue }
      );
      const created = (data['issueCreate'] as Record<string, unknown>)[
        'issue'
      ] as LinearCreatedIssue;
      return created;
    },

    async listTeams(): Promise<Array<{ id: string; name: string }>> {
      const data = await graphql(`
        query {
          teams {
            nodes {
              id
              name
            }
          }
        }
      `);
      const teams = (data['teams'] as Record<string, unknown>)['nodes'] as Array<{
        id: string;
        name: string;
      }>;
      return teams;
    },
  };
}
```

**Step 2: Write `sync-issues.ts`**

```typescript
import { Gap } from '../../ai/adoption/gap-analyzer.js';
import { createLinearClient, LinearIssue } from './client.js';

const SEVERITY_TO_PRIORITY: Record<Gap['severity'], LinearIssue['priority']> = {
  critical: 1,
  major: 2,
  minor: 3,
};

export async function syncGapsToLinear(gaps: Gap[], apiKey: string, teamId: string): Promise<void> {
  if (!apiKey) throw new Error('LINEAR_API_KEY is required');
  if (!teamId) throw new Error('LINEAR_TEAM_ID is required');

  const client = createLinearClient(apiKey);
  console.log(`\n📤 Syncing ${gaps.length} gap(s) to Linear...\n`);

  for (const gap of gaps) {
    const issue: LinearIssue = {
      title: `[Adoption Gap] ${gap.description}`,
      description: [
        `**Gap ID**: ${gap.id}`,
        `**Category**: ${gap.category}`,
        `**Severity**: ${gap.severity}`,
        '',
        '## Issue',
        gap.description,
        '',
        '## Remediation',
        gap.remediation,
        '',
        '*Auto-generated by NodeJS-Starter-V1 adoption engine*',
      ].join('\n'),
      priority: SEVERITY_TO_PRIORITY[gap.severity],
      teamId,
    };

    const created = await client.createIssue(issue);
    console.log(`✅ ${issue.title}\n   → ${created.url}`);
  }
}
```

---

## Task 20: CLI Scripts (Phase 6)

**Files:**

- Create: `scripts/adopt-project.mjs`
- Create: `scripts/full-audit.mjs`
- Create: `scripts/sync-linear.mjs`

**Step 1: `scripts/adopt-project.mjs`**

```javascript
#!/usr/bin/env node
import { adoptProject } from '../src/ai/adoption/project-adopter.js';

const args = process.argv.slice(2);
const targetDir = args[0];

if (!targetDir) {
  console.error('Usage: pnpm starter:adopt "<target-project-path>" [--linear] [--full-audit]');
  process.exit(1);
}

await adoptProject({
  targetDir,
  syncLinear: args.includes('--linear'),
  fullAudit: args.includes('--full-audit'),
});
```

**Step 2: `scripts/full-audit.mjs`**

```javascript
#!/usr/bin/env node
import { scanProject } from '../src/ai/adoption/project-scanner.js';
import { analyzeGaps, formatGapReport } from '../src/ai/adoption/gap-analyzer.js';
import {
  scanForModelReferences,
  generateCurrencyReport,
} from '../src/ai/version-checks/check-model-currency.js';
import { writeFileSync, mkdirSync } from 'node:fs';

const targetDir = process.argv[2] ?? process.cwd();
console.log(`\n🔬 Full Audit: ${targetDir}\n` + '─'.repeat(60));

const profile = scanProject(targetDir);
const gaps = analyzeGaps(profile);
const gapReport = formatGapReport(profile, gaps);

const modelFindings = scanForModelReferences(targetDir);
const modelReport = generateCurrencyReport(modelFindings);

mkdirSync('reports', { recursive: true });
writeFileSync('reports/gap-analysis.md', gapReport, 'utf8');
writeFileSync('reports/model-currency-report.md', modelReport, 'utf8');

console.log(gapReport);
console.log('\n' + '─'.repeat(60));
console.log(modelReport);
console.log('\n📁 Reports saved to reports/');
```

**Step 3: `scripts/sync-linear.mjs`**

```javascript
#!/usr/bin/env node
import { scanProject } from '../src/ai/adoption/project-scanner.js';
import { analyzeGaps } from '../src/ai/adoption/gap-analyzer.js';
import { syncGapsToLinear } from '../src/integrations/linear/sync-issues.js';

const apiKey = process.env['LINEAR_API_KEY'];
const teamId = process.env['LINEAR_TEAM_ID'];

if (!apiKey || !teamId) {
  console.error('Required: LINEAR_API_KEY and LINEAR_TEAM_ID environment variables');
  process.exit(1);
}

const targetDir = process.argv[2] ?? process.cwd();
const profile = scanProject(targetDir);
const gaps = analyzeGaps(profile);
await syncGapsToLinear(gaps, apiKey, teamId);
```

**Step 4: Add npm scripts to `package.json`**

Add to the `scripts` object in root `package.json`:

```json
"starter:adopt": "node scripts/adopt-project.mjs",
"starter:audit": "node scripts/full-audit.mjs",
"starter:sync-linear": "node scripts/sync-linear.mjs"
```

---

## Task 21: Run Self-Audit on This Repository

**Step 1: Run the full audit**

```bash
cd "C:/NodeJS-Starter-V1 Upgrade Task List" && node scripts/full-audit.mjs . 2>&1
```

Expected: gap report and model currency report printed and saved to `reports/`.

**Step 2: Verify reports exist**

```bash
ls reports/gap-analysis.md reports/model-currency-report.md
```

**Step 3: Remediate any critical gaps found**

If this repo has critical gaps in its own self-audit, fix them before marking complete.

---

## Task 22: Final Verification Gate

**Step 1: Verify all files present**

```bash
ls memory.md && \
ls docs/agent-framework/SENIOR_PM_AGENT.md && \
ls docs/agent-framework/SENIOR_ORCHESTRATOR_AGENT.md && \
ls docs/agent-framework/SENIOR_SPECIALIST_AGENTS.md && \
ls docs/agent-framework/SUB_AGENT_PROTOCOL.md && \
ls docs/agent-framework/RECOMMENDED_SKILL_MAP.md && \
ls .skills/custom/definition-of-done-builder/SKILL.md && \
ls .skills/custom/finished-audit/SKILL.md && \
ls .skills/custom/evidence-verifier/SKILL.md && \
ls .skills/custom/model-currency-checker/SKILL.md && \
ls .skills/custom/visual-excellence-enforcer/SKILL.md && \
ls .skills/custom/delegation-planner/SKILL.md && \
ls src/ai/model-registry/index.ts && \
ls src/integrations/linear/client.ts && \
ls scripts/adopt-project.mjs && \
echo "ALL FILES PRESENT ✅"
```

**Step 2: TypeScript type check**

```bash
cd src && npx tsc --noEmit 2>&1
```

Expected: 0 errors.

**Step 3: Dry-run adopt command**

```bash
node scripts/adopt-project.mjs "." --full-audit 2>&1 | head -30
```

Expected: scan output + gap analysis printed.

---

## Completion Claim Protocol

NOT COMPLETE until:

- [ ] All 22 tasks done
- [ ] `memory.md` exists and is > 150 lines
- [ ] CLAUDE.md updated with memory.md directive
- [ ] 5 agent-framework docs exist in `docs/agent-framework/`
- [ ] 6 new skills created in `.skills/custom/`
- [ ] TypeScript compiles with 0 errors
- [ ] All 3 CLI scripts callable
- [ ] Self-audit ran and reports saved to `reports/`
