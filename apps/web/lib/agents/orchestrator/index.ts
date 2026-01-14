/**
 * Orchestrator
 *
 * Autonomous codebase management system that operates like a professional A+ grade engineer.
 *
 * Features:
 * - Repository takeover with full health analysis
 * - Automatic issue detection and fixing
 * - Safe branch workflow (never touches main)
 * - Pre-commit validation pipeline
 * - Continuous quality monitoring
 *
 * Quick Start:
 * ```typescript
 * import { createCLI } from '@/lib/agents/orchestrator';
 *
 * // Take over a GitHub repo
 * const cli = createCLI();
 * await cli.run('takeover', { url: 'https://github.com/user/repo' });
 *
 * // Start working on a feature
 * await cli.run('work', { task: 'add user authentication' });
 *
 * // Commit with validation
 * await cli.run('commit', { message: 'feat: add login form' });
 * ```
 *
 * CLI Usage:
 * ```bash
 * orchestrator takeover --url=https://github.com/user/repo
 * orchestrator work "add authentication"
 * orchestrator commit "feat: add login"
 * orchestrator status
 * orchestrator health
 * ```
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

// CLI
export { createCLI, parseArgs, main } from "./cli";
export type { CLIOptions } from "./cli";
