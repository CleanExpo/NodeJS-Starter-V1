/**
 * spec - Specification phase commands
 */

import { z } from "zod";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { Cmd, LifecycleCtx } from "../types";
import { ok, err } from "../types";

const SPEC_DIR = "docs/specs";

interface SpecDoc {
  id: string;
  title: string;
  status: "draft" | "review" | "approved" | "implemented";
  version: string;
  created: number;
  updated: number;
  sections: Record<string, unknown>;
}

// spec:new - Create new spec
export const specNew: Cmd<{ id: string; title: string }, { path: string }> = {
  name: "spec:new",
  phase: ["spec"],
  schema: z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string(),
  }),
  async exec({ id, title }, ctx) {
    const dir = join(ctx.cwd, SPEC_DIR);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const path = join(dir, `${id}.json`);
    if (existsSync(path)) return err(`spec:exists:${id}`);

    const spec: SpecDoc = {
      id,
      title,
      status: "draft",
      version: "0.1.0",
      created: Date.now(),
      updated: Date.now(),
      sections: {
        overview: null,
        requirements: [],
        constraints: [],
        interfaces: [],
        acceptance: [],
      },
    };

    writeFileSync(path, JSON.stringify(spec, null, 2));
    await ctx.mem.set(`spec:${id}`, { path, status: "draft" }, { type: "spec" });

    return ok({ path });
  },
};

// spec:get - Get spec
export const specGet: Cmd<{ id: string }, SpecDoc> = {
  name: "spec:get",
  phase: ["spec"],
  schema: z.object({ id: z.string() }),
  async exec({ id }, ctx) {
    const path = join(ctx.cwd, SPEC_DIR, `${id}.json`);
    if (!existsSync(path)) return err(`spec:not-found:${id}`);

    try {
      const spec = JSON.parse(readFileSync(path, "utf-8"));
      return ok(spec);
    } catch {
      return err(`spec:parse-error:${id}`);
    }
  },
};

// spec:set - Update spec section
export const specSet: Cmd<{ id: string; section: string; value: unknown }, { updated: boolean }> = {
  name: "spec:set",
  phase: ["spec"],
  schema: z.object({
    id: z.string(),
    section: z.string(),
    value: z.unknown(),
  }),
  async exec({ id, section, value }, ctx) {
    const path = join(ctx.cwd, SPEC_DIR, `${id}.json`);
    if (!existsSync(path)) return err(`spec:not-found:${id}`);

    const spec: SpecDoc = JSON.parse(readFileSync(path, "utf-8"));
    spec.sections[section] = value;
    spec.updated = Date.now();

    writeFileSync(path, JSON.stringify(spec, null, 2));
    return ok({ updated: true });
  },
};

// spec:status - Update spec status
export const specStatus: Cmd<{ id: string; status: SpecDoc["status"] }, { prev: string; curr: string }> = {
  name: "spec:status",
  phase: ["spec"],
  schema: z.object({
    id: z.string(),
    status: z.enum(["draft", "review", "approved", "implemented"]),
  }),
  async exec({ id, status }, ctx) {
    const path = join(ctx.cwd, SPEC_DIR, `${id}.json`);
    if (!existsSync(path)) return err(`spec:not-found:${id}`);

    const spec: SpecDoc = JSON.parse(readFileSync(path, "utf-8"));
    const prev = spec.status;
    spec.status = status;
    spec.updated = Date.now();

    writeFileSync(path, JSON.stringify(spec, null, 2));
    await ctx.mem.set(`spec:${id}`, { path, status }, { type: "spec" });

    return ok({ prev, curr: status });
  },
};

// spec:list - List all specs
export const specList: Cmd<{ status?: SpecDoc["status"] }, { specs: Array<{ id: string; title: string; status: string }> }> = {
  name: "spec:list",
  phase: ["spec"],
  schema: z.object({ status: z.enum(["draft", "review", "approved", "implemented"]).optional() }),
  async exec({ status }, ctx) {
    const dir = join(ctx.cwd, SPEC_DIR);
    if (!existsSync(dir)) return ok({ specs: [] });

    const { readdirSync } = await import("fs");
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

    const specs = files
      .map((f) => {
        try {
          const spec: SpecDoc = JSON.parse(readFileSync(join(dir, f), "utf-8"));
          return { id: spec.id, title: spec.title, status: spec.status };
        } catch {
          return null;
        }
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .filter((s) => !status || s.status === status);

    return ok({ specs });
  },
};

// spec:validate - Validate spec completeness
export const specValidate: Cmd<{ id: string }, { valid: boolean; missing: string[] }> = {
  name: "spec:validate",
  phase: ["spec"],
  schema: z.object({ id: z.string() }),
  async exec({ id }, ctx) {
    const path = join(ctx.cwd, SPEC_DIR, `${id}.json`);
    if (!existsSync(path)) return err(`spec:not-found:${id}`);

    const spec: SpecDoc = JSON.parse(readFileSync(path, "utf-8"));
    const required = ["overview", "requirements", "acceptance"];
    const missing = required.filter((r) => {
      const val = spec.sections[r];
      return !val || (Array.isArray(val) && val.length === 0);
    });

    return ok({ valid: missing.length === 0, missing });
  },
};

// spec:export - Export spec to markdown
export const specExport: Cmd<{ id: string }, { md: string }> = {
  name: "spec:export",
  phase: ["spec"],
  schema: z.object({ id: z.string() }),
  async exec({ id }, ctx) {
    const path = join(ctx.cwd, SPEC_DIR, `${id}.json`);
    if (!existsSync(path)) return err(`spec:not-found:${id}`);

    const spec: SpecDoc = JSON.parse(readFileSync(path, "utf-8"));

    let md = `# ${spec.title}\n\n`;
    md += `**ID:** ${spec.id}\n`;
    md += `**Status:** ${spec.status}\n`;
    md += `**Version:** ${spec.version}\n\n`;

    for (const [section, content] of Object.entries(spec.sections)) {
      md += `## ${section.charAt(0).toUpperCase() + section.slice(1)}\n\n`;
      if (Array.isArray(content)) {
        content.forEach((item, i) => {
          md += `${i + 1}. ${typeof item === "string" ? item : JSON.stringify(item)}\n`;
        });
      } else if (content) {
        md += `${typeof content === "string" ? content : JSON.stringify(content, null, 2)}\n`;
      } else {
        md += `_Not specified_\n`;
      }
      md += "\n";
    }

    return ok({ md });
  },
};

export const specCmds = [specNew, specGet, specSet, specStatus, specList, specValidate, specExport];
