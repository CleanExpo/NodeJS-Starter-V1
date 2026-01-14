/**
 * Context Management System
 *
 * Based on OpenAI Agents SDK patterns:
 * - https://openai.github.io/openai-agents-js/guides/context/
 *
 * Context is a dependency-injection object that:
 * - Gets passed to every tool, guardrail, and handoff
 * - Can store state, services, user metadata, feature flags
 * - Is generic to support any shape of context data
 */

// ============================================================================
// Base Context Interface
// ============================================================================

/**
 * Base context that all contexts should extend
 */
export interface BaseContext {
  /** Unique identifier for the current run */
  runId: string;
  /** User ID if authenticated */
  userId?: string;
  /** Session ID for tracking */
  sessionId?: string;
  /** Request metadata */
  metadata?: Record<string, unknown>;
  /** Feature flags */
  features?: Record<string, boolean>;
  /** Services (database, cache, etc.) */
  services?: Record<string, unknown>;
}

// ============================================================================
// Context Factory
// ============================================================================

export interface CreateContextOptions<T extends BaseContext> {
  /** Initial context values */
  initial?: Partial<T>;
  /** User ID */
  userId?: string;
  /** Session ID */
  sessionId?: string;
  /** Feature flags */
  features?: Record<string, boolean>;
  /** Services to inject */
  services?: Record<string, unknown>;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Generate a unique run ID
 */
function generateRunId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `run_${timestamp}_${random}`;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `sess_${timestamp}_${random}`;
}

/**
 * Create a new context object
 *
 * @example
 * ```typescript
 * interface MyContext extends BaseContext {
 *   db: DatabaseClient;
 *   user: { id: string; name: string };
 * }
 *
 * const ctx = createContext<MyContext>({
 *   userId: "user_123",
 *   services: { db: databaseClient },
 *   initial: { user: { id: "user_123", name: "John" } },
 * });
 * ```
 */
export function createContext<T extends BaseContext>(
  options: CreateContextOptions<T> = {}
): T {
  const { initial, userId, sessionId, features, services, metadata } = options;

  const context: BaseContext = {
    runId: generateRunId(),
    userId,
    sessionId: sessionId || generateSessionId(),
    metadata: metadata || {},
    features: features || {},
    services: services || {},
  };

  return {
    ...context,
    ...initial,
  } as T;
}

// ============================================================================
// Context Utilities
// ============================================================================

/**
 * Clone a context with modifications
 */
export function withContext<T extends BaseContext>(
  ctx: T,
  updates: Partial<T>
): T {
  return {
    ...ctx,
    ...updates,
    metadata: {
      ...ctx.metadata,
      ...updates.metadata,
    },
    features: {
      ...ctx.features,
      ...updates.features,
    },
    services: {
      ...ctx.services,
      ...updates.services,
    },
  };
}

/**
 * Create a new run context (new runId, same session)
 */
export function newRunContext<T extends BaseContext>(ctx: T): T {
  return withContext(ctx, {
    runId: generateRunId(),
  } as Partial<T>);
}

/**
 * Check if a feature flag is enabled
 */
export function hasFeature<T extends BaseContext>(
  ctx: T,
  feature: string
): boolean {
  return ctx.features?.[feature] === true;
}

/**
 * Get a service from context
 */
export function getService<T extends BaseContext, S>(
  ctx: T,
  serviceName: string
): S | undefined {
  return ctx.services?.[serviceName] as S | undefined;
}

/**
 * Set metadata on context
 */
export function setMetadata<T extends BaseContext>(
  ctx: T,
  key: string,
  value: unknown
): T {
  return withContext(ctx, {
    metadata: {
      ...ctx.metadata,
      [key]: value,
    },
  } as Partial<T>);
}

// ============================================================================
// Context Wrapper Class
// ============================================================================

/**
 * A mutable context wrapper for scenarios where mutation is needed
 */
export class ContextWrapper<T extends BaseContext> {
  private _ctx: T;
  private _history: T[] = [];

  constructor(initial: T) {
    this._ctx = initial;
  }

  /**
   * Get the current context
   */
  get current(): T {
    return this._ctx;
  }

  /**
   * Update the context
   */
  update(updates: Partial<T>): void {
    this._history.push(this._ctx);
    this._ctx = withContext(this._ctx, updates);
  }

  /**
   * Set a metadata value
   */
  setMeta(key: string, value: unknown): void {
    this.update({
      metadata: {
        ...this._ctx.metadata,
        [key]: value,
      },
    } as Partial<T>);
  }

  /**
   * Get a metadata value
   */
  getMeta<V>(key: string): V | undefined {
    return this._ctx.metadata?.[key] as V | undefined;
  }

  /**
   * Enable a feature flag
   */
  enableFeature(feature: string): void {
    this.update({
      features: {
        ...this._ctx.features,
        [feature]: true,
      },
    } as Partial<T>);
  }

  /**
   * Disable a feature flag
   */
  disableFeature(feature: string): void {
    this.update({
      features: {
        ...this._ctx.features,
        [feature]: false,
      },
    } as Partial<T>);
  }

  /**
   * Get the context history
   */
  getHistory(): T[] {
    return [...this._history];
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    if (this._history.length > 0) {
      this._ctx = this._history[0];
      this._history = [];
    }
  }

  /**
   * Create a snapshot
   */
  snapshot(): T {
    return { ...this._ctx };
  }
}

/**
 * Create a mutable context wrapper
 */
export function wrapContext<T extends BaseContext>(ctx: T): ContextWrapper<T> {
  return new ContextWrapper(ctx);
}

// ============================================================================
// Typed Context Builders
// ============================================================================

/**
 * Builder pattern for creating contexts
 */
export class ContextBuilder<T extends BaseContext> {
  private ctx: Partial<T> = {};

  /**
   * Set user ID
   */
  withUserId(userId: string): this {
    this.ctx.userId = userId;
    return this;
  }

  /**
   * Set session ID
   */
  withSessionId(sessionId: string): this {
    this.ctx.sessionId = sessionId;
    return this;
  }

  /**
   * Add metadata
   */
  withMetadata(key: string, value: unknown): this {
    this.ctx.metadata = {
      ...this.ctx.metadata,
      [key]: value,
    };
    return this;
  }

  /**
   * Add multiple metadata entries
   */
  withMetadataObject(metadata: Record<string, unknown>): this {
    this.ctx.metadata = {
      ...this.ctx.metadata,
      ...metadata,
    };
    return this;
  }

  /**
   * Enable feature flags
   */
  withFeatures(features: Record<string, boolean>): this {
    this.ctx.features = {
      ...this.ctx.features,
      ...features,
    };
    return this;
  }

  /**
   * Add a service
   */
  withService(name: string, service: unknown): this {
    this.ctx.services = {
      ...this.ctx.services,
      [name]: service,
    };
    return this;
  }

  /**
   * Add additional context properties
   */
  with(props: Partial<T>): this {
    this.ctx = { ...this.ctx, ...props };
    return this;
  }

  /**
   * Build the final context
   */
  build(): T {
    return createContext<T>({
      initial: this.ctx as Partial<T>,
      userId: this.ctx.userId,
      sessionId: this.ctx.sessionId,
      features: this.ctx.features,
      services: this.ctx.services,
      metadata: this.ctx.metadata,
    });
  }
}

/**
 * Create a context builder
 */
export function contextBuilder<T extends BaseContext>(): ContextBuilder<T> {
  return new ContextBuilder<T>();
}

// ============================================================================
// Pre-built Context Types
// ============================================================================

/**
 * Context for web requests
 */
export interface WebRequestContext extends BaseContext {
  /** HTTP request details */
  request: {
    method: string;
    path: string;
    headers: Record<string, string>;
    query: Record<string, string>;
  };
  /** Response helpers */
  response?: {
    setHeader: (name: string, value: string) => void;
    setStatus: (code: number) => void;
  };
}

/**
 * Context for chat applications
 */
export interface ChatContext extends BaseContext {
  /** Conversation ID */
  conversationId: string;
  /** Message history */
  messageHistory: Array<{ role: string; content: string }>;
  /** User preferences */
  userPreferences?: {
    language: string;
    timezone: string;
    format: string;
  };
}

/**
 * Context for task processing
 */
export interface TaskContext extends BaseContext {
  /** Task ID */
  taskId: string;
  /** Task type */
  taskType: string;
  /** Priority level */
  priority: "low" | "medium" | "high" | "critical";
  /** Deadline if any */
  deadline?: Date;
  /** Dependencies */
  dependencies?: string[];
}

/**
 * Context for Australian locale
 */
export interface AustralianContext extends BaseContext {
  /** Australian state */
  state?: "QLD" | "NSW" | "VIC" | "SA" | "WA" | "TAS" | "NT" | "ACT";
  /** Timezone (defaults to Australia/Brisbane) */
  timezone: string;
  /** Date format (DD/MM/YYYY) */
  dateFormat: string;
  /** Currency (AUD) */
  currency: string;
  /** GST rate (10%) */
  gstRate: number;
}

/**
 * Create an Australian-locale context
 */
export function createAustralianContext(
  options: Omit<CreateContextOptions<AustralianContext>, "initial"> & {
    state?: AustralianContext["state"];
  } = {}
): AustralianContext {
  return createContext<AustralianContext>({
    ...options,
    initial: {
      state: options.state || "QLD",
      timezone: "Australia/Brisbane",
      dateFormat: "DD/MM/YYYY",
      currency: "AUD",
      gstRate: 0.1,
    },
  });
}
