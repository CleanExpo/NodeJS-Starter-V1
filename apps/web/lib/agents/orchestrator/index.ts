/**
 * Orchestrator
 *
 * Autonomous codebase management system that operates like a Senior Executive Engineer.
 *
 * ## Modes
 *
 * - **demo**: AI simulated, no external calls, safe for testing
 * - **dev**: Local development with optional real APIs
 * - **staging**: Pre-production validation
 * - **prod**: Full production with all security enabled
 *
 * ## Quick Start
 *
 * ```typescript
 * import { createCLI, setMode } from '@/lib/agents/orchestrator';
 *
 * // Start in demo mode (default) - no API keys needed
 * const cli = createCLI();
 *
 * // Take over a GitHub repo
 * await cli.run('takeover', { url: 'https://github.com/user/repo' });
 *
 * // Start working on a feature
 * await cli.run('work', { task: 'add user authentication' });
 *
 * // Commit with validation
 * await cli.run('commit', { message: 'feat: add login form' });
 *
 * // When ready for production
 * setMode('prod');
 * await cli.run('prod:ready'); // Check readiness
 * await cli.run('prod:activate'); // Activate production mode
 * ```
 *
 * ## CLI Usage
 *
 * ```bash
 * orchestrator takeover https://github.com/user/repo
 * orchestrator work "add authentication"
 * orchestrator commit "feat: add login"
 * orchestrator review:staged
 * orchestrator release:create
 * orchestrator prod:ready
 * ```
 *
 * ## Features
 *
 * - Repository takeover with full health analysis
 * - AI Demo mode (works without API keys)
 * - Self-healing and auto-recovery
 * - Automated code review
 * - Release management with semantic versioning
 * - Standards enforcement
 * - Production readiness validation
 */

// Types
export type {
  Cmd,
  Res,
  Code,
  Phase,
  ProjectConfig,
  ProjectType,
  PackageManager,
  Issue,
  Severity,
  IssueCategory,
  AuditResult,
  Branch,
  BranchType,
  GitConfig,
  OrchestratorState,
  OrchestratorConfig,
  OrchestratorCtx,
  RepoInput,
  OnboardOpts,
} from "./types";

export { CODE, ok, err, warn, skip, RepoInputSchema, OnboardOptsSchema } from "./types";

// Modes
export type { Mode, ModeConfig, SecretStatus } from "./modes";
export {
  getMode,
  getModeConfig,
  setMode,
  isDemo,
  isProd,
  isFeatureEnabled,
  checkSecrets,
  validateMode,
  transitionTo,
  getMock,
  MOCK_RESPONSES,
  ModeSchema,
} from "./modes";

// Context
export { createContext, saveState, setPhase, logAction, getCurrentBranch, isProtectedBranch, ensureSafeBranch } from "./context";

// Onboard
export {
  onboardCmds,
  onboardClone,
  onboardAnalyze,
  onboardGit,
  onboardDeps,
  onboardBackup,
  onboardFull,
} from "./onboard";

// Audit
export {
  auditCmds,
  auditSecurity,
  auditPerformance,
  auditQuality,
  auditDeps,
  auditConfig,
  auditFull,
} from "./audit";

// Cleanup
export {
  cleanupCmds,
  fixGitignore,
  fixEnvFiles,
  fixNpmAudit,
  fixTsconfig,
  fixPrettier,
  fixNodeVersion,
  fixEditorconfig,
  fixPackageJson,
  fixCiWorkflow,
  cleanupAuto,
  cleanupCommit,
} from "./cleanup";

// Branch
export {
  branchCmds,
  branchCreate,
  branchSwitch,
  branchList,
  branchDelete,
  branchCommit,
  branchPush,
  branchPull,
  branchMerge,
  branchWork,
  branchSync,
  branchGuard,
} from "./branch";

// Orchestrator
export {
  orchestratorCmds,
  takeover,
  work,
  status,
  precommit,
  commit,
  health,
  reaudit,
  report,
} from "./orchestrator";

// Self-Healing
export {
  healingCmds,
  healDetect,
  healAuto,
  healOne,
  healDeepClean,
  healRecover,
} from "./healing";

// Code Review
export {
  reviewCmds,
  reviewStaged,
  reviewFile,
  reviewBranch,
  reviewReport,
} from "./review";

// Release Management
export {
  releaseCmds,
  releaseVersion,
  releaseNext,
  releaseBump,
  releaseChangelog,
  releaseWriteChangelog,
  releaseCreate,
  releaseList,
  releaseNotes,
} from "./release";

// Standards Enforcement
export {
  standardsCmds,
  standardsCheck,
  standardsFix,
  standardsReport,
} from "./standards";

// Production Readiness
export {
  productionCmds,
  prodReady,
  prodActivate,
  prodReport,
  prodChecklist,
} from "./production";

// CLI
export { createCLI, parseArgs, main } from "./cli";
export type { CLIOptions } from "./cli";
