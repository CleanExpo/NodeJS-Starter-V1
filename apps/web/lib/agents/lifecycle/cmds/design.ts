/**
 * design - Design phase commands
 */

import { z } from "zod";
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";
import type { Cmd } from "../types";
import { ok, err } from "../types";

const DESIGN_DIR = "docs/design";
const TOKENS_FILE = "design-tokens.json";

interface DesignToken {
  name: string;
  type: "color" | "spacing" | "font" | "radius" | "shadow" | "motion";
  value: string;
  desc?: string;
}

interface Component {
  id: string;
  name: string;
  category: "atom" | "molecule" | "organism" | "template";
  status: "draft" | "ready" | "deprecated";
  props: Array<{ name: string; type: string; required: boolean; default?: string }>;
  variants: string[];
  path?: string;
}

// design:token:set - Define design token
export const designTokenSet: Cmd<{ name: string; type: DesignToken["type"]; value: string; desc?: string }, { set: boolean }> = {
  name: "design:token:set",
  phase: ["design"],
  schema: z.object({
    name: z.string(),
    type: z.enum(["color", "spacing", "font", "radius", "shadow", "motion"]),
    value: z.string(),
    desc: z.string().optional(),
  }),
  async exec({ name, type, value, desc }, ctx) {
    const path = join(ctx.cwd, DESIGN_DIR, TOKENS_FILE);
    const dir = join(ctx.cwd, DESIGN_DIR);

    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    let tokens: DesignToken[] = [];
    if (existsSync(path)) {
      tokens = JSON.parse(readFileSync(path, "utf-8"));
    }

    const idx = tokens.findIndex((t) => t.name === name);
    const token: DesignToken = { name, type, value, desc };

    if (idx >= 0) {
      tokens[idx] = token;
    } else {
      tokens.push(token);
    }

    writeFileSync(path, JSON.stringify(tokens, null, 2));
    await ctx.mem.set(`design:token:${name}`, token, { type: "ref", tags: ["design", type] });

    return ok({ set: true });
  },
};

// design:token:get - Get design token
export const designTokenGet: Cmd<{ name: string }, DesignToken | null> = {
  name: "design:token:get",
  phase: ["design"],
  schema: z.object({ name: z.string() }),
  async exec({ name }, ctx) {
    const path = join(ctx.cwd, DESIGN_DIR, TOKENS_FILE);
    if (!existsSync(path)) return ok(null);

    const tokens: DesignToken[] = JSON.parse(readFileSync(path, "utf-8"));
    const token = tokens.find((t) => t.name === name);

    return ok(token || null);
  },
};

// design:token:list - List all tokens
export const designTokenList: Cmd<{ type?: DesignToken["type"] }, { tokens: DesignToken[] }> = {
  name: "design:token:list",
  phase: ["design"],
  schema: z.object({ type: z.enum(["color", "spacing", "font", "radius", "shadow", "motion"]).optional() }),
  async exec({ type }, ctx) {
    const path = join(ctx.cwd, DESIGN_DIR, TOKENS_FILE);
    if (!existsSync(path)) return ok({ tokens: [] });

    let tokens: DesignToken[] = JSON.parse(readFileSync(path, "utf-8"));
    if (type) tokens = tokens.filter((t) => t.type === type);

    return ok({ tokens });
  },
};

// design:comp:new - Register component
export const designCompNew: Cmd<Omit<Component, "status">, { id: string }> = {
  name: "design:comp:new",
  phase: ["design"],
  schema: z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum(["atom", "molecule", "organism", "template"]),
    props: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      default: z.string().optional(),
    })),
    variants: z.array(z.string()),
    path: z.string().optional(),
  }),
  async exec(input, ctx) {
    const dir = join(ctx.cwd, DESIGN_DIR, "components");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const comp: Component = { ...input, status: "draft" };
    const path = join(dir, `${input.id}.json`);

    writeFileSync(path, JSON.stringify(comp, null, 2));
    await ctx.mem.set(`design:comp:${input.id}`, comp, { type: "ref", tags: ["design", "component", input.category] });

    return ok({ id: input.id });
  },
};

// design:comp:get - Get component
export const designCompGet: Cmd<{ id: string }, Component | null> = {
  name: "design:comp:get",
  phase: ["design"],
  schema: z.object({ id: z.string() }),
  async exec({ id }, ctx) {
    const path = join(ctx.cwd, DESIGN_DIR, "components", `${id}.json`);
    if (!existsSync(path)) return ok(null);

    const comp: Component = JSON.parse(readFileSync(path, "utf-8"));
    return ok(comp);
  },
};

// design:comp:list - List components
export const designCompList: Cmd<{ category?: Component["category"] }, { components: Array<{ id: string; name: string; category: string; status: string }> }> = {
  name: "design:comp:list",
  phase: ["design"],
  schema: z.object({ category: z.enum(["atom", "molecule", "organism", "template"]).optional() }),
  async exec({ category }, ctx) {
    const dir = join(ctx.cwd, DESIGN_DIR, "components");
    if (!existsSync(dir)) return ok({ components: [] });

    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    const components = files
      .map((f) => {
        const comp: Component = JSON.parse(readFileSync(join(dir, f), "utf-8"));
        return { id: comp.id, name: comp.name, category: comp.category, status: comp.status };
      })
      .filter((c) => !category || c.category === category);

    return ok({ components });
  },
};

// design:export:css - Export tokens to CSS
export const designExportCss: Cmd<Record<string, never>, { css: string }> = {
  name: "design:export:css",
  phase: ["design"],
  schema: z.object({}),
  async exec(_, ctx) {
    const path = join(ctx.cwd, DESIGN_DIR, TOKENS_FILE);
    if (!existsSync(path)) return err("design:no-tokens");

    const tokens: DesignToken[] = JSON.parse(readFileSync(path, "utf-8"));

    let css = ":root {\n";
    for (const token of tokens) {
      const varName = `--${token.name.replace(/\./g, "-")}`;
      css += `  ${varName}: ${token.value};${token.desc ? ` /* ${token.desc} */` : ""}\n`;
    }
    css += "}\n";

    return ok({ css });
  },
};

// design:export:tailwind - Export tokens to Tailwind config
export const designExportTailwind: Cmd<Record<string, never>, { config: Record<string, unknown> }> = {
  name: "design:export:tailwind",
  phase: ["design"],
  schema: z.object({}),
  async exec(_, ctx) {
    const path = join(ctx.cwd, DESIGN_DIR, TOKENS_FILE);
    if (!existsSync(path)) return err("design:no-tokens");

    const tokens: DesignToken[] = JSON.parse(readFileSync(path, "utf-8"));

    const config: Record<string, Record<string, string>> = {
      colors: {},
      spacing: {},
      fontFamily: {},
      borderRadius: {},
      boxShadow: {},
    };

    for (const token of tokens) {
      const key = token.name.split(".").pop() || token.name;
      switch (token.type) {
        case "color": config.colors[key] = token.value; break;
        case "spacing": config.spacing[key] = token.value; break;
        case "font": config.fontFamily[key] = token.value; break;
        case "radius": config.borderRadius[key] = token.value; break;
        case "shadow": config.boxShadow[key] = token.value; break;
      }
    }

    return ok({ config });
  },
};

export const designCmds = [
  designTokenSet, designTokenGet, designTokenList,
  designCompNew, designCompGet, designCompList,
  designExportCss, designExportTailwind,
];
