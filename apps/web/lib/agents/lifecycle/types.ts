/**
 * Lifecycle Agent Types
 * Minimal, machine-optimized type definitions
 */

import type { z } from "zod";

// Command response codes
export type Code = 0 | 1 | 2 | 3;
export const OK = 0;
export const ERR = 1;
export const WARN = 2;
export const SKIP = 3;

// Response format
export interface Res<T = unknown> {
  code: Code;
  data?: T;
  msg?: string;
  ts: number;
}

export const ok = <T>(data?: T, msg?: string): Res<T> => ({
  code: OK,
  data,
  msg,
  ts: Date.now(),
});

export const err = (msg: string, data?: unknown): Res => ({
  code: ERR,
  msg,
  data,
  ts: Date.now(),
});

// Memory types
export interface MemEntry {
  id: string;
  type: MemType;
  key: string;
  val: unknown;
  ttl?: number;
  created: number;
  updated: number;
  refs?: string[];
  tags?: string[];
}

export type MemType =
  | "ctx"      // context
  | "spec"    // specification
  | "task"    // task/todo
  | "log"     // log entry
  | "cache"   // cached result
  | "state"   // state snapshot
  | "ref"     // reference
  | "cfg";    // config

// Agent phases
export type Phase =
  | "dev"
  | "spec"
  | "build"
  | "design"
  | "arch"
  | "test"
  | "prod"
  | "ops";

// Task status
export type Status = "pending" | "active" | "done" | "fail" | "skip";

// Task definition
export interface Task {
  id: string;
  phase: Phase;
  cmd: string;
  args?: Record<string, unknown>;
  status: Status;
  deps?: string[];
  out?: unknown;
  err?: string;
  started?: number;
  ended?: number;
}

// Context for lifecycle agents
export interface LifecycleCtx {
  runId: string;
  phase: Phase;
  cwd: string;
  env: "dev" | "stage" | "prod";
  mem: MemStore;
  tasks: Task[];
  cfg: Record<string, unknown>;
}

// Memory store interface
export interface MemStore {
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, val: unknown, opts?: MemOpts) => Promise<void>;
  del: (key: string) => Promise<boolean>;
  list: (prefix?: string) => Promise<string[]>;
  query: (filter: MemFilter) => Promise<MemEntry[]>;
  clear: (prefix?: string) => Promise<number>;
}

export interface MemOpts {
  type?: MemType;
  ttl?: number;
  refs?: string[];
  tags?: string[];
}

export interface MemFilter {
  type?: MemType;
  tags?: string[];
  since?: number;
  limit?: number;
}

// Command definition
export interface Cmd<I = unknown, O = unknown> {
  name: string;
  phase: Phase[];
  schema: z.ZodType<I>;
  exec: (input: I, ctx: LifecycleCtx) => Promise<Res<O>>;
}
