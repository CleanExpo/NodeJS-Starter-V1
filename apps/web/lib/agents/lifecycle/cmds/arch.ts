/**
 * arch - Architecture phase commands
 */

import { z } from "zod";
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import type { Cmd } from "../types";
import { ok, err } from "../types";

const ARCH_DIR = "docs/architecture";

interface ArchDecision {
  id: string;
  title: string;
  status: "proposed" | "accepted" | "deprecated" | "superseded";
  context: string;
  decision: string;
  consequences: string[];
  date: string;
  supersedes?: string;
}

interface Module {
  name: string;
  path: string;
  type: "lib" | "app" | "service" | "shared";
  deps: string[];
  exports: string[];
}

interface Layer {
  name: string;
  modules: string[];
  deps: string[];
}

// arch:adr:new - Create Architecture Decision Record
export const archAdrNew: Cmd<{ id: string; title: string; context: string; decision: string; consequences: string[] }, { path: string }> = {
  name: "arch:adr:new",
  phase: ["arch"],
  schema: z.object({
    id: z.string().regex(/^\d{4}$/),
    title: z.string(),
    context: z.string(),
    decision: z.string(),
    consequences: z.array(z.string()),
  }),
  async exec({ id, title, context, decision, consequences }, ctx) {
    const dir = join(ctx.cwd, ARCH_DIR, "decisions");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const adr: ArchDecision = {
      id,
      title,
      status: "proposed",
      context,
      decision,
      consequences,
      date: new Date().toISOString().split("T")[0],
    };

    const path = join(dir, `${id}-${title.toLowerCase().replace(/\s+/g, "-")}.json`);
    writeFileSync(path, JSON.stringify(adr, null, 2));

    await ctx.mem.set(`arch:adr:${id}`, adr, { type: "ref", tags: ["arch", "adr"] });

    return ok({ path });
  },
};

// arch:adr:list - List ADRs
export const archAdrList: Cmd<{ status?: ArchDecision["status"] }, { decisions: Array<{ id: string; title: string; status: string }> }> = {
  name: "arch:adr:list",
  phase: ["arch"],
  schema: z.object({ status: z.enum(["proposed", "accepted", "deprecated", "superseded"]).optional() }),
  async exec({ status }, ctx) {
    const dir = join(ctx.cwd, ARCH_DIR, "decisions");
    if (!existsSync(dir)) return ok({ decisions: [] });

    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    const decisions = files
      .map((f) => {
        const adr: ArchDecision = JSON.parse(readFileSync(join(dir, f), "utf-8"));
        return { id: adr.id, title: adr.title, status: adr.status };
      })
      .filter((d) => !status || d.status === status)
      .sort((a, b) => a.id.localeCompare(b.id));

    return ok({ decisions });
  },
};

// arch:module:scan - Scan codebase for modules
export const archModuleScan: Cmd<{ root?: string }, { modules: Module[] }> = {
  name: "arch:module:scan",
  phase: ["arch"],
  schema: z.object({ root: z.string().optional() }),
  async exec({ root = "." }, ctx) {
    const modules: Module[] = [];
    const scanDir = join(ctx.cwd, root);

    // Check common patterns
    const patterns = [
      { path: "apps", type: "app" as const },
      { path: "packages", type: "lib" as const },
      { path: "libs", type: "lib" as const },
      { path: "services", type: "service" as const },
      { path: "shared", type: "shared" as const },
    ];

    for (const { path: pattern, type } of patterns) {
      const dir = join(scanDir, pattern);
      if (!existsSync(dir)) continue;

      for (const name of readdirSync(dir)) {
        const modPath = join(dir, name);
        if (!statSync(modPath).isDirectory()) continue;

        const pkgPath = join(modPath, "package.json");
        let deps: string[] = [];
        let exports: string[] = [];

        if (existsSync(pkgPath)) {
          const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
          deps = Object.keys(pkg.dependencies || {}).filter((d) => d.startsWith("@") || !d.includes("/"));
          if (pkg.exports) {
            exports = Object.keys(pkg.exports);
          }
        }

        modules.push({
          name,
          path: `${pattern}/${name}`,
          type,
          deps,
          exports,
        });
      }
    }

    await ctx.mem.set("arch:modules", modules, { type: "cache", ttl: 3600000 });

    return ok({ modules });
  },
};

// arch:deps:graph - Generate dependency graph
export const archDepsGraph: Cmd<Record<string, never>, { nodes: string[]; edges: Array<[string, string]> }> = {
  name: "arch:deps:graph",
  phase: ["arch"],
  schema: z.object({}),
  async exec(_, ctx) {
    const modules = await ctx.mem.get<Module[]>("arch:modules") || [];

    const nodes = modules.map((m) => m.name);
    const edges: Array<[string, string]> = [];

    for (const mod of modules) {
      for (const dep of mod.deps) {
        const target = modules.find((m) => dep.includes(m.name));
        if (target) {
          edges.push([mod.name, target.name]);
        }
      }
    }

    return ok({ nodes, edges });
  },
};

// arch:layer:define - Define architectural layer
export const archLayerDefine: Cmd<{ name: string; modules: string[]; deps: string[] }, { defined: boolean }> = {
  name: "arch:layer:define",
  phase: ["arch"],
  schema: z.object({
    name: z.string(),
    modules: z.array(z.string()),
    deps: z.array(z.string()),
  }),
  async exec({ name, modules, deps }, ctx) {
    const dir = join(ctx.cwd, ARCH_DIR);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const path = join(dir, "layers.json");
    let layers: Layer[] = [];

    if (existsSync(path)) {
      layers = JSON.parse(readFileSync(path, "utf-8"));
    }

    const idx = layers.findIndex((l) => l.name === name);
    const layer: Layer = { name, modules, deps };

    if (idx >= 0) {
      layers[idx] = layer;
    } else {
      layers.push(layer);
    }

    writeFileSync(path, JSON.stringify(layers, null, 2));
    await ctx.mem.set(`arch:layer:${name}`, layer, { type: "ref", tags: ["arch", "layer"] });

    return ok({ defined: true });
  },
};

// arch:layer:validate - Validate layer dependencies
export const archLayerValidate: Cmd<Record<string, never>, { valid: boolean; violations: Array<{ from: string; to: string; rule: string }> }> = {
  name: "arch:layer:validate",
  phase: ["arch"],
  schema: z.object({}),
  async exec(_, ctx) {
    const layersPath = join(ctx.cwd, ARCH_DIR, "layers.json");
    if (!existsSync(layersPath)) return err("arch:no-layers");

    const layers: Layer[] = JSON.parse(readFileSync(layersPath, "utf-8"));
    const modules = await ctx.mem.get<Module[]>("arch:modules") || [];
    const violations: Array<{ from: string; to: string; rule: string }> = [];

    for (const layer of layers) {
      const allowedDeps = new Set(layer.deps);
      const layerModules = modules.filter((m) => layer.modules.includes(m.name));

      for (const mod of layerModules) {
        for (const dep of mod.deps) {
          // Find which layer the dep belongs to
          const depLayer = layers.find((l) => l.modules.some((m) => dep.includes(m)));
          if (depLayer && !allowedDeps.has(depLayer.name) && depLayer.name !== layer.name) {
            violations.push({
              from: `${layer.name}/${mod.name}`,
              to: `${depLayer.name}/${dep}`,
              rule: `${layer.name} cannot depend on ${depLayer.name}`,
            });
          }
        }
      }
    }

    return ok({ valid: violations.length === 0, violations });
  },
};

// arch:stats - Get codebase statistics
export const archStats: Cmd<Record<string, never>, { files: number; lines: number; byExt: Record<string, number> }> = {
  name: "arch:stats",
  phase: ["arch"],
  schema: z.object({}),
  async exec(_, ctx) {
    let files = 0;
    let lines = 0;
    const byExt: Record<string, number> = {};

    const scan = (dir: string) => {
      if (!existsSync(dir)) return;
      if (dir.includes("node_modules") || dir.includes(".next") || dir.includes(".git")) return;

      for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        const stat = statSync(path);

        if (stat.isDirectory()) {
          scan(path);
        } else {
          const ext = extname(entry);
          if ([".ts", ".tsx", ".js", ".jsx", ".py", ".json", ".css", ".scss"].includes(ext)) {
            files++;
            byExt[ext] = (byExt[ext] || 0) + 1;
            try {
              lines += readFileSync(path, "utf-8").split("\n").length;
            } catch {}
          }
        }
      }
    };

    scan(ctx.cwd);

    await ctx.mem.set("arch:stats", { files, lines, byExt, ts: Date.now() }, { type: "cache", ttl: 3600000 });

    return ok({ files, lines, byExt });
  },
};

export const archCmds = [archAdrNew, archAdrList, archModuleScan, archDepsGraph, archLayerDefine, archLayerValidate, archStats];
