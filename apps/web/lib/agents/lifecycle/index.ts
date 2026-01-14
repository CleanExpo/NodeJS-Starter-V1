/**
 * Lifecycle Agents
 *
 * CLI-style development lifecycle commands:
 * - dev:* - Development workflow
 * - spec:* - Specifications
 * - build:* - Build and test
 * - design:* - Design tokens and components
 * - arch:* - Architecture decisions
 * - prod:* - Production deployment
 *
 * Usage:
 * ```typescript
 * import { createRunner, execCmd, createPipeline } from '@/lib/agents/lifecycle';
 *
 * // Create runner
 * const runner = createRunner({ cwd: '/path/to/project' });
 *
 * // Execute command
 * const result = await runner.run('dev:init', { name: 'myapp' });
 *
 * // Execute CLI string
 * const result = await execCmd('build:run --clean');
 *
 * // Pipeline
 * const results = await createPipeline()
 *   .add('dev:lint')
 *   .add('build:typecheck')
 *   .add('build:test')
 *   .add('build:run', { clean: true })
 *   .runUntilError();
 * ```
 */

// Types
export type { Cmd, Res, Phase, LifecycleCtx, MemStore, MemEntry, MemQuery } from "./types";
export { OK, ERR, WARN, SKIP, ok, err, warn, skip } from "./types";

// Memory
export { createMemStore, memCmds } from "./memory";

// Runner
export type { Runner, RunnerOpts, Pipeline } from "./runner";
export {
  createRunner,
  createPipeline,
  execCmd,
  parseCmd,
  getCmd,
  hasCmd,
  getCmdsByPhase,
  getCmdCount,
  formatRes,
} from "./runner";

// Commands
export { allCmds } from "./cmds";
export {
  // Dev
  devCmds,
  devInit, devStart, devStop, devStatus, devExec, devWatch, devLint, devFmt,
  // Spec
  specCmds,
  specNew, specGet, specSet, specStatus, specList, specValidate, specExport,
  // Build
  buildCmds,
  buildRun, buildCheck, buildAnalyze, buildClean, buildTypecheck, buildBundle, buildTest,
  // Design
  designCmds,
  designTokenSet, designTokenGet, designTokenList, designCompNew, designCompGet, designCompList, designExportCss, designExportTailwind,
  // Arch
  archCmds,
  archAdrNew, archAdrList, archModuleScan, archDepsGraph, archLayerDefine, archLayerValidate, archStats,
  // Prod
  prodCmds,
  prodDeploy, prodHealth, prodRollback, prodEnvSet, prodEnvList, prodLogs, prodScale, prodMetrics, prodSsl, prodDomainAdd, prodConfigSave, prodConfigLoad,
} from "./cmds";
