/**
 * Local Memory System
 * File-based persistent memory to prevent context bloat
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";
import type { MemStore, MemEntry, MemOpts, MemFilter, MemType } from "./types";
import { ok, err } from "./types";

const MEM_DIR = ".agent-memory";
const INDEX_FILE = "_index.json";

// Generate unique ID
const uid = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

// Memory index for fast lookups
interface MemIndex {
  entries: Record<string, { file: string; type: MemType; tags: string[]; created: number }>;
  updated: number;
}

/**
 * Create local file-based memory store
 */
export function createMemStore(basePath: string = process.cwd()): MemStore {
  const memPath = join(basePath, MEM_DIR);

  // Ensure directory exists
  if (!existsSync(memPath)) {
    mkdirSync(memPath, { recursive: true });
  }

  // Load or create index
  const indexPath = join(memPath, INDEX_FILE);
  let index: MemIndex = { entries: {}, updated: Date.now() };

  if (existsSync(indexPath)) {
    try {
      index = JSON.parse(readFileSync(indexPath, "utf-8"));
    } catch {
      index = { entries: {}, updated: Date.now() };
    }
  }

  const saveIndex = () => {
    index.updated = Date.now();
    writeFileSync(indexPath, JSON.stringify(index, null, 2));
  };

  const keyToFile = (key: string) => {
    const safe = key.replace(/[^a-zA-Z0-9_-]/g, "_");
    return `${safe}.json`;
  };

  return {
    async get<T>(key: string): Promise<T | null> {
      const entry = index.entries[key];
      if (!entry) return null;

      const filePath = join(memPath, entry.file);
      if (!existsSync(filePath)) {
        delete index.entries[key];
        saveIndex();
        return null;
      }

      try {
        const data: MemEntry = JSON.parse(readFileSync(filePath, "utf-8"));

        // Check TTL
        if (data.ttl && Date.now() > data.created + data.ttl) {
          unlinkSync(filePath);
          delete index.entries[key];
          saveIndex();
          return null;
        }

        return data.val as T;
      } catch {
        return null;
      }
    },

    async set(key: string, val: unknown, opts: MemOpts = {}): Promise<void> {
      const now = Date.now();
      const existing = index.entries[key];
      const file = existing?.file || keyToFile(key);

      const entry: MemEntry = {
        id: existing ? key : uid(),
        type: opts.type || "ctx",
        key,
        val,
        ttl: opts.ttl,
        created: existing ? (await this.get(key) as MemEntry)?.created || now : now,
        updated: now,
        refs: opts.refs,
        tags: opts.tags,
      };

      writeFileSync(join(memPath, file), JSON.stringify(entry, null, 2));

      index.entries[key] = {
        file,
        type: entry.type,
        tags: entry.tags || [],
        created: entry.created,
      };
      saveIndex();
    },

    async del(key: string): Promise<boolean> {
      const entry = index.entries[key];
      if (!entry) return false;

      const filePath = join(memPath, entry.file);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }

      delete index.entries[key];
      saveIndex();
      return true;
    },

    async list(prefix?: string): Promise<string[]> {
      const keys = Object.keys(index.entries);
      if (!prefix) return keys;
      return keys.filter((k) => k.startsWith(prefix));
    },

    async query(filter: MemFilter): Promise<MemEntry[]> {
      const results: MemEntry[] = [];

      for (const [key, meta] of Object.entries(index.entries)) {
        // Type filter
        if (filter.type && meta.type !== filter.type) continue;

        // Tags filter
        if (filter.tags && !filter.tags.some((t) => meta.tags.includes(t))) continue;

        // Since filter
        if (filter.since && meta.created < filter.since) continue;

        // Load full entry
        const filePath = join(memPath, meta.file);
        if (!existsSync(filePath)) continue;

        try {
          const entry: MemEntry = JSON.parse(readFileSync(filePath, "utf-8"));
          results.push(entry);
        } catch {
          continue;
        }

        // Limit
        if (filter.limit && results.length >= filter.limit) break;
      }

      return results;
    },

    async clear(prefix?: string): Promise<number> {
      let count = 0;
      const keys = prefix
        ? Object.keys(index.entries).filter((k) => k.startsWith(prefix))
        : Object.keys(index.entries);

      for (const key of keys) {
        if (await this.del(key)) count++;
      }

      return count;
    },
  };
}

// Memory commands for agents
export const memCmds = {
  // ctx:set <key> <value>
  ctxSet: async (mem: MemStore, key: string, val: unknown) => {
    await mem.set(`ctx:${key}`, val, { type: "ctx" });
    return ok(null, `ctx:${key} set`);
  },

  // ctx:get <key>
  ctxGet: async <T>(mem: MemStore, key: string) => {
    const val = await mem.get<T>(`ctx:${key}`);
    return val ? ok(val) : err(`ctx:${key} not found`);
  },

  // ctx:del <key>
  ctxDel: async (mem: MemStore, key: string) => {
    const deleted = await mem.del(`ctx:${key}`);
    return deleted ? ok(null, `ctx:${key} deleted`) : err(`ctx:${key} not found`);
  },

  // cache:set <key> <value> <ttl_ms>
  cacheSet: async (mem: MemStore, key: string, val: unknown, ttl = 3600000) => {
    await mem.set(`cache:${key}`, val, { type: "cache", ttl });
    return ok(null, `cache:${key} set (ttl: ${ttl}ms)`);
  },

  // cache:get <key>
  cacheGet: async <T>(mem: MemStore, key: string) => {
    const val = await mem.get<T>(`cache:${key}`);
    return val ? ok(val) : err(`cache miss: ${key}`);
  },

  // state:save <name>
  stateSave: async (mem: MemStore, name: string, state: unknown) => {
    await mem.set(`state:${name}`, state, { type: "state" });
    return ok(null, `state:${name} saved`);
  },

  // state:load <name>
  stateLoad: async <T>(mem: MemStore, name: string) => {
    const val = await mem.get<T>(`state:${name}`);
    return val ? ok(val) : err(`state:${name} not found`);
  },

  // log:add <phase> <msg> [data]
  logAdd: async (mem: MemStore, phase: string, msg: string, data?: unknown) => {
    const id = `log:${phase}:${Date.now()}`;
    await mem.set(id, { msg, data, phase, ts: Date.now() }, { type: "log", tags: [phase] });
    return ok(id);
  },

  // log:list <phase> [limit]
  logList: async (mem: MemStore, phase: string, limit = 50) => {
    const entries = await mem.query({ type: "log", tags: [phase], limit });
    return ok(entries.map((e) => e.val));
  },

  // ref:set <name> <path>
  refSet: async (mem: MemStore, name: string, path: string) => {
    await mem.set(`ref:${name}`, path, { type: "ref" });
    return ok(null, `ref:${name} -> ${path}`);
  },

  // ref:get <name>
  refGet: async (mem: MemStore, name: string) => {
    const val = await mem.get<string>(`ref:${name}`);
    return val ? ok(val) : err(`ref:${name} not found`);
  },

  // mem:stats
  memStats: async (mem: MemStore) => {
    const all = await mem.list();
    const byType: Record<string, number> = {};

    for (const key of all) {
      const type = key.split(":")[0];
      byType[type] = (byType[type] || 0) + 1;
    }

    return ok({ total: all.length, byType });
  },

  // mem:gc [maxAge_ms]
  memGc: async (mem: MemStore, maxAge = 86400000 * 7) => {
    const cutoff = Date.now() - maxAge;
    const entries = await mem.query({ type: "log" });
    let cleared = 0;

    for (const entry of entries) {
      if (entry.created < cutoff) {
        await mem.del(entry.key);
        cleared++;
      }
    }

    return ok({ cleared });
  },
};
