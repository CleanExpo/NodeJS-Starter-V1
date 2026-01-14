/**
 * Orchestrator CLI
 *
 * Command-line interface for the orchestrator system.
 * Starts in DEMO mode by default (no API keys required).
 *
 * Usage:
 *   orchestrator takeover https://github.com/user/repo
 *   orchestrator work "add user authentication"
 *   orchestrator commit "feat: add login form"
 *   orchestrator review:staged
 *   orchestrator release:create
 *   orchestrator prod:ready
 */

import { createContext } from "./context";
import type { Cmd, OrchestratorCtx, Res } from "./types";
import { CODE } from "./types";
import { getMode, setMode } from "./modes";

// Import all commands
import { onboardCmds } from "./onboard";
import { auditCmds } from "./audit";
import { cleanupCmds } from "./cleanup";
import { branchCmds } from "./branch";
import { orchestratorCmds } from "./orchestrator";
import { healingCmds } from "./healing";
import { reviewCmds } from "./review";
import { releaseCmds } from "./release";
import { standardsCmds } from "./standards";
import { productionCmds } from "./production";

// ============================================================================
// Command Registry
// ============================================================================

type AnyCmd = Cmd<unknown, unknown>;

const allCmds: AnyCmd[] = [
  ...onboardCmds,
  ...auditCmds,
  ...cleanupCmds,
  ...branchCmds,
  ...orchestratorCmds,
  ...healingCmds,
  ...reviewCmds,
  ...releaseCmds,
  ...standardsCmds,
  ...productionCmds,
];

const registry = new Map<string, AnyCmd>();
for (const cmd of allCmds) {
  registry.set(cmd.name, cmd);
}

// ============================================================================
// CLI Parser
// ============================================================================

interface ParsedArgs {
  command: string;
  positional: string[];
  options: Record<string, unknown>;
}

/**
 * Parse CLI arguments
 */
export function parseArgs(args: string[]): ParsedArgs {
  const command = args[0] || "help";
  const positional: string[] = [];
  const options: Record<string, unknown> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--")) {
      const [key, ...rest] = arg.slice(2).split("=");
      const value = rest.join("=");

      if (value === "" || value === "true") {
        options[key] = true;
      } else if (value === "false") {
        options[key] = false;
      } else if (/^\d+$/.test(value)) {
        options[key] = parseInt(value, 10);
      } else {
        options[key] = value;
      }
    } else if (arg.startsWith("-")) {
      options[arg.slice(1)] = true;
    } else {
      positional.push(arg);
    }
  }

  return { command, positional, options };
}

// ============================================================================
// CLI Runner
// ============================================================================

export interface CLIOptions {
  cwd?: string;
  silent?: boolean;
  mode?: "demo" | "dev" | "staging" | "prod";
}

/**
 * Create CLI runner
 */
export function createCLI(opts: CLIOptions = {}) {
  const cwd = opts.cwd || process.cwd();
  const ctx = createContext(cwd);

  // Set initial mode
  if (opts.mode) {
    setMode(opts.mode);
  }

  return {
    ctx,

    /**
     * Run command by name
     */
    async run<O>(name: string, input: unknown = {}): Promise<Res<O>> {
      const cmd = registry.get(name);
      if (!cmd) {
        return {
          code: CODE.ERR,
          msg: `Unknown command: ${name}`,
          ts: Date.now(),
        };
      }

      const parsed = cmd.schema.safeParse(input);
      if (!parsed.success) {
        return {
          code: CODE.ERR,
          msg: `Invalid input: ${parsed.error.message}`,
          ts: Date.now(),
        };
      }

      return cmd.exec(parsed.data, ctx) as Promise<Res<O>>;
    },

    /**
     * Run from CLI args
     */
    async runArgs(args: string[]): Promise<Res<unknown>> {
      const { command, positional, options } = parseArgs(args);

      // Handle mode switch
      if (options.mode) {
        setMode(options.mode as "demo" | "dev" | "staging" | "prod");
        delete options.mode;
      }

      // Handle help
      if (command === "help" || command === "--help" || command === "-h") {
        return { code: CODE.OK, data: this.getHelp(), ts: Date.now() };
      }

      // Handle list
      if (command === "list" || command === "commands") {
        return { code: CODE.OK, data: this.listCommands(), ts: Date.now() };
      }

      // Handle mode
      if (command === "mode") {
        if (positional[0]) {
          setMode(positional[0] as "demo" | "dev" | "staging" | "prod");
        }
        return { code: CODE.OK, data: { mode: getMode() }, ts: Date.now() };
      }

      // Build input from positional and options
      const input: Record<string, unknown> = { ...options };

      // Map positional args based on command
      if (command === "work" && positional[0]) {
        input.task = positional[0];
      } else if (command === "commit" && positional[0]) {
        input.message = positional[0];
      } else if (command === "takeover") {
        if (positional[0]?.startsWith("http")) {
          input.url = positional[0];
        } else if (positional[0]) {
          input.path = positional[0];
        }
      } else if (command === "review:file" && positional[0]) {
        input.path = positional[0];
      } else if (command === "release:bump" && positional[0]) {
        input.type = positional[0];
      }

      return this.run(command, input);
    },

    /**
     * List available commands
     */
    listCommands(): Array<{ name: string; description: string }> {
      return allCmds.map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
      }));
    },

    /**
     * Get help text
     */
    getHelp(): string {
      const mode = getMode();
      return `
╔═══════════════════════════════════════════════════════════════════╗
║                        ORCHESTRATOR CLI                           ║
║                    Mode: ${mode.toUpperCase().padEnd(41)}║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  QUICK START (Demo mode - no API keys needed)                     ║
║  --------------------------------------------                     ║
║  orchestrator takeover https://github.com/user/repo               ║
║  orchestrator work "add user authentication"                      ║
║  orchestrator commit "feat: add login form"                       ║
║                                                                   ║
║  MODE CONTROL                                                     ║
║  ------------                                                     ║
║  orchestrator mode demo      Switch to demo mode                  ║
║  orchestrator mode dev       Switch to dev mode                   ║
║  orchestrator mode prod      Switch to production mode            ║
║                                                                   ║
║  CORE WORKFLOW                                                    ║
║  -------------                                                    ║
║  takeover      Full repository takeover                           ║
║  work          Start new task (creates safe branch)               ║
║  commit        Commit with pre-commit validation                  ║
║  status        Current orchestrator status                        ║
║  health        Quick health check                                 ║
║  report        Generate summary report                            ║
║                                                                   ║
║  CODE REVIEW                                                      ║
║  -----------                                                      ║
║  review:staged    Review staged changes                           ║
║  review:branch    Review branch vs main                           ║
║  review:file      Review specific file                            ║
║  review:report    Generate review report                          ║
║                                                                   ║
║  RELEASE MANAGEMENT                                               ║
║  ------------------                                               ║
║  release:version     Get current version                          ║
║  release:next        Calculate next version                       ║
║  release:bump        Bump version (major/minor/patch)             ║
║  release:changelog   Generate changelog                           ║
║  release:create      Create release with tag                      ║
║                                                                   ║
║  SELF-HEALING                                                     ║
║  ------------                                                     ║
║  heal:detect      Detect healable issues                          ║
║  heal:auto        Auto-fix all issues                             ║
║  heal:recover     Full recovery attempt                           ║
║  heal:deep-clean  Aggressive cache cleanup                        ║
║                                                                   ║
║  STANDARDS & QUALITY                                              ║
║  -------------------                                              ║
║  standards:check    Check all standards                           ║
║  standards:fix      Fix fixable violations                        ║
║  standards:report   Generate compliance report                    ║
║  audit:full         Complete audit                                ║
║                                                                   ║
║  PRODUCTION                                                       ║
║  ----------                                                       ║
║  prod:ready       Production readiness check                      ║
║  prod:activate    Activate production mode                        ║
║  prod:report      Production readiness report                     ║
║  prod:checklist   Pre-deployment checklist                        ║
║                                                                   ║
║  BRANCH OPERATIONS                                                ║
║  -----------------                                                ║
║  branch:create    Create new branch                               ║
║  branch:switch    Switch to branch                                ║
║  branch:list      List branches                                   ║
║  branch:push      Push to remote                                  ║
║  branch:sync      Sync with remote                                ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`;
    },
  };
}

/**
 * Main entry point
 */
export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
  const cli = createCLI();
  const result = await cli.runArgs(args);

  if (result.code === CODE.OK) {
    if (typeof result.data === "string") {
      console.log(result.data);
    } else if (result.data) {
      console.log(JSON.stringify(result.data, null, 2));
    }
  } else {
    console.error(`Error: ${result.msg}`);
    if (result.data) {
      console.error(JSON.stringify(result.data, null, 2));
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
