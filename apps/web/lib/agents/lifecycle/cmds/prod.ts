/**
 * prod - Production phase commands
 */

import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { Cmd } from "../types";
import { ok, err } from "../types";

const execAsync = promisify(exec);

interface DeployConfig {
  provider: "vercel" | "docker" | "k8s" | "custom";
  region?: string;
  env: "staging" | "production";
  vars: Record<string, string>;
}

interface HealthStatus {
  url: string;
  status: number;
  latency: number;
  ok: boolean;
}

// prod:deploy - Deploy to production
export const prodDeploy: Cmd<{ provider?: string; env?: string }, { deployed: boolean; url?: string }> = {
  name: "prod:deploy",
  phase: ["prod"],
  schema: z.object({
    provider: z.string().optional(),
    env: z.enum(["staging", "production"]).optional(),
  }),
  async exec({ provider = "vercel", env = "production" }, ctx) {
    const start = Date.now();

    try {
      let cmd: string;
      let url: string | undefined;

      switch (provider) {
        case "vercel":
          cmd = env === "production" ? "npx vercel --prod" : "npx vercel";
          break;
        case "docker":
          cmd = "docker compose -f docker-compose.prod.yml up -d --build";
          break;
        case "k8s":
          cmd = `kubectl apply -f k8s/${env}/`;
          break;
        default:
          cmd = `pnpm run deploy:${env}`;
      }

      const { stdout } = await execAsync(cmd, { cwd: ctx.cwd, timeout: 600000 });

      // Extract URL from vercel output
      const urlMatch = stdout.match(/https:\/\/[\w.-]+\.vercel\.app/);
      if (urlMatch) url = urlMatch[0];

      await ctx.mem.set("prod:last-deploy", {
        ts: Date.now(),
        duration: Date.now() - start,
        provider,
        env,
        url,
      }, { type: "state" });

      return ok({ deployed: true, url });
    } catch (e) {
      return err("prod:deploy-failed", { error: String(e) });
    }
  },
};

// prod:health - Check production health
export const prodHealth: Cmd<{ url: string }, HealthStatus> = {
  name: "prod:health",
  phase: ["prod"],
  schema: z.object({ url: z.string().url() }),
  async exec({ url }, ctx) {
    const start = Date.now();

    try {
      const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(10000) });
      const latency = Date.now() - start;

      const status: HealthStatus = {
        url,
        status: res.status,
        latency,
        ok: res.ok,
      };

      await ctx.mem.set(`prod:health:${new URL(url).hostname}`, status, { type: "cache", ttl: 60000 });

      return ok(status);
    } catch (e) {
      return ok({ url, status: 0, latency: Date.now() - start, ok: false });
    }
  },
};

// prod:rollback - Rollback deployment
export const prodRollback: Cmd<{ version?: string }, { rolledBack: boolean }> = {
  name: "prod:rollback",
  phase: ["prod"],
  schema: z.object({ version: z.string().optional() }),
  async exec({ version }, ctx) {
    try {
      const cmd = version
        ? `npx vercel rollback ${version}`
        : "npx vercel rollback";

      await execAsync(cmd, { cwd: ctx.cwd });

      await ctx.mem.set("prod:rollback", { ts: Date.now(), version }, { type: "log" });

      return ok({ rolledBack: true });
    } catch (e) {
      return err("prod:rollback-failed", { error: String(e) });
    }
  },
};

// prod:env:set - Set environment variable
export const prodEnvSet: Cmd<{ key: string; value: string; env?: string }, { set: boolean }> = {
  name: "prod:env:set",
  phase: ["prod"],
  schema: z.object({
    key: z.string(),
    value: z.string(),
    env: z.enum(["development", "preview", "production"]).optional(),
  }),
  async exec({ key, value, env = "production" }, ctx) {
    try {
      await execAsync(`npx vercel env add ${key} ${env}`, {
        cwd: ctx.cwd,
        env: { ...process.env, VERCEL_ENV_VALUE: value },
      });

      return ok({ set: true });
    } catch (e) {
      return err("prod:env-failed", { error: String(e) });
    }
  },
};

// prod:env:list - List environment variables
export const prodEnvList: Cmd<{ env?: string }, { vars: string[] }> = {
  name: "prod:env:list",
  phase: ["prod"],
  schema: z.object({ env: z.string().optional() }),
  async exec({ env = "production" }, ctx) {
    try {
      const { stdout } = await execAsync(`npx vercel env ls ${env}`, { cwd: ctx.cwd });
      const vars = stdout.split("\n").filter((l) => l.trim() && !l.includes("Environment"));

      return ok({ vars });
    } catch (e) {
      return err("prod:env-list-failed", { error: String(e) });
    }
  },
};

// prod:logs - Get production logs
export const prodLogs: Cmd<{ lines?: number; filter?: string }, { logs: string[] }> = {
  name: "prod:logs",
  phase: ["prod"],
  schema: z.object({
    lines: z.number().optional(),
    filter: z.string().optional(),
  }),
  async exec({ lines = 100, filter }, ctx) {
    try {
      let cmd = `npx vercel logs --limit ${lines}`;
      const { stdout } = await execAsync(cmd, { cwd: ctx.cwd });

      let logs = stdout.split("\n").filter(Boolean);
      if (filter) {
        const pattern = new RegExp(filter, "i");
        logs = logs.filter((l) => pattern.test(l));
      }

      return ok({ logs });
    } catch (e) {
      return err("prod:logs-failed", { error: String(e) });
    }
  },
};

// prod:scale - Scale deployment
export const prodScale: Cmd<{ instances: number }, { scaled: boolean }> = {
  name: "prod:scale",
  phase: ["prod"],
  schema: z.object({ instances: z.number().min(0).max(100) }),
  async exec({ instances }, ctx) {
    try {
      // This would vary by provider - example for k8s
      await execAsync(`kubectl scale deployment app --replicas=${instances}`, { cwd: ctx.cwd });

      await ctx.mem.set("prod:scale", { ts: Date.now(), instances }, { type: "state" });

      return ok({ scaled: true });
    } catch (e) {
      return err("prod:scale-failed", { error: String(e) });
    }
  },
};

// prod:metrics - Get production metrics
export const prodMetrics: Cmd<Record<string, never>, { requests: number; errors: number; latency: number }> = {
  name: "prod:metrics",
  phase: ["prod"],
  schema: z.object({}),
  async exec(_, ctx) {
    try {
      // Fetch from Vercel Analytics API or similar
      const { stdout } = await execAsync("npx vercel inspect --json 2>/dev/null | head -50", { cwd: ctx.cwd });

      // Parse basic metrics from output
      const data = JSON.parse(stdout || "{}");

      return ok({
        requests: data.requests || 0,
        errors: data.errors || 0,
        latency: data.latency || 0,
      });
    } catch {
      // Return cached or zero metrics
      const cached = await ctx.mem.get<{ requests: number; errors: number; latency: number }>("prod:metrics");
      return ok(cached || { requests: 0, errors: 0, latency: 0 });
    }
  },
};

// prod:ssl - Check SSL certificate
export const prodSsl: Cmd<{ domain: string }, { valid: boolean; expires?: string; issuer?: string }> = {
  name: "prod:ssl",
  phase: ["prod"],
  schema: z.object({ domain: z.string() }),
  async exec({ domain }) {
    try {
      const { stdout } = await execAsync(
        `echo | openssl s_client -servername ${domain} -connect ${domain}:443 2>/dev/null | openssl x509 -noout -dates -issuer`
      );

      const expiresMatch = stdout.match(/notAfter=(.+)/);
      const issuerMatch = stdout.match(/issuer=(.+)/);

      return ok({
        valid: true,
        expires: expiresMatch?.[1],
        issuer: issuerMatch?.[1],
      });
    } catch {
      return ok({ valid: false });
    }
  },
};

// prod:domain:add - Add custom domain
export const prodDomainAdd: Cmd<{ domain: string }, { added: boolean }> = {
  name: "prod:domain:add",
  phase: ["prod"],
  schema: z.object({ domain: z.string() }),
  async exec({ domain }, ctx) {
    try {
      await execAsync(`npx vercel domains add ${domain}`, { cwd: ctx.cwd });
      return ok({ added: true });
    } catch (e) {
      return err("prod:domain-failed", { error: String(e) });
    }
  },
};

// prod:config:save - Save deployment config
export const prodConfigSave: Cmd<DeployConfig, { path: string }> = {
  name: "prod:config:save",
  phase: ["prod"],
  schema: z.object({
    provider: z.enum(["vercel", "docker", "k8s", "custom"]),
    region: z.string().optional(),
    env: z.enum(["staging", "production"]),
    vars: z.record(z.string()),
  }),
  async exec(config, ctx) {
    const dir = join(ctx.cwd, ".deploy");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const path = join(dir, `${config.env}.json`);
    writeFileSync(path, JSON.stringify(config, null, 2));

    await ctx.mem.set(`prod:config:${config.env}`, config, { type: "ref" });

    return ok({ path });
  },
};

// prod:config:load - Load deployment config
export const prodConfigLoad: Cmd<{ env: string }, DeployConfig | null> = {
  name: "prod:config:load",
  phase: ["prod"],
  schema: z.object({ env: z.string() }),
  async exec({ env }, ctx) {
    const path = join(ctx.cwd, ".deploy", `${env}.json`);
    if (!existsSync(path)) return ok(null);

    const config: DeployConfig = JSON.parse(readFileSync(path, "utf-8"));
    return ok(config);
  },
};

export const prodCmds = [
  prodDeploy, prodHealth, prodRollback,
  prodEnvSet, prodEnvList,
  prodLogs, prodScale, prodMetrics,
  prodSsl, prodDomainAdd,
  prodConfigSave, prodConfigLoad,
];
