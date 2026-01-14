/**
 * Orchestrator CLI
 *
 * Command-line interface for the orchestrator system.
 *
 * Usage:
 *   orchestrator takeover --url=https://github.com/user/repo
 *   orchestrator takeover --path=/local/repo
 *   orchestrator work "add user authentication"
 *   orchestrator commit "feat: add login form"
 *   orchestrator status
 *   orchestrator health
 *   orchestrator report
 */

import { createContext } from "./context";
import type { Cmd, OrchestratorCtx, Res } from "./types";
import { CODE } from "./types";

// Import all commands
import { onboardCmds } from "./onboard";
import { auditCmds } from "./audit";
import { cleanupCmds } from "./cleanup";
import { branchCmds } from "./branch";
import { orchestratorCmds } from "./orchestrator";

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
 *
 * Examples:
 *   takeover --url=https://github.com/user/repo
 *   work "add authentication"
 *   commit "feat: add login" --skipChecks
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
      // Short flag
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
}

/**
 * Create CLI runner
 */
export function createCLI(opts: CLIOptions = {}) {
  const cwd = opts.cwd || process.cwd();
  const ctx = createContext(cwd);

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

      // Handle help
      if (command === "help" || command === "--help" || command === "-h") {
        return {
          code: CODE.OK,
          data: this.getHelp(),
          ts: Date.now(),
        };
      }

      // Handle list
      if (command === "list" || command === "commands") {
        return {
          code: CODE.OK,
          data: this.listCommands(),
          ts: Date.now(),
        };
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
      return `
╔═══════════════════════════════════════════════════════════════════╗
║                        ORCHESTRATOR CLI                           ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  QUICK START                                                      ║
║  -----------                                                      ║
║  orchestrator takeover --url=https://github.com/user/repo         ║
║  orchestrator takeover /path/to/local/repo                        ║
║                                                                   ║
║  WORKFLOW                                                         ║
║  --------                                                         ║
║  orchestrator work "add user authentication"                      ║
║  orchestrator commit "feat: add login form"                       ║
║  orchestrator status                                              ║
║  orchestrator health                                              ║
║  orchestrator report                                              ║
║                                                                   ║
║  COMMANDS                                                         ║
║  --------                                                         ║
║  takeover      Full repository takeover and cleanup               ║
║  work          Start new task on safe branch                      ║
║  commit        Commit with validation                             ║
║  status        Current orchestrator status                        ║
║  health        Quick health check                                 ║
║  reaudit       Run fresh audit                                    ║
║  report        Generate summary report                            ║
║                                                                   ║
║  AUDIT                                                            ║
║  -----                                                            ║
║  audit:full       Complete audit                                  ║
║  audit:security   Security checks                                 ║
║  audit:quality    Code quality                                    ║
║  audit:deps       Dependencies                                    ║
║                                                                   ║
║  BRANCH                                                           ║
║  ------                                                           ║
║  branch:create --type=feature --description="..."                 ║
║  branch:switch --name=feature/xyz                                 ║
║  branch:list                                                      ║
║  branch:push                                                      ║
║  branch:sync                                                      ║
║                                                                   ║
║  CLEANUP                                                          ║
║  -------                                                          ║
║  cleanup:auto     Auto-fix all issues                             ║
║  fix:gitignore    Fix .gitignore                                  ║
║  fix:tsconfig     Enable strict TS                                ║
║  fix:prettier     Add Prettier config                             ║
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
