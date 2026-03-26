# Standards — Scientific Luxury code conventions

Code conventions specific to the NodeJS-Starter-V1 project. These standards apply alongside the general rules in `SKILL.md` and add project-specific naming patterns, domain vocabulary, and structural conventions tied to the Scientific Luxury design system.


## Project structure conventions

The monorepo enforces strict boundaries between the frontend and backend applications. Each boundary has its own naming dialect, and code must not cross these boundaries through direct imports.

### Frontend (`apps/web/`)

React components use PascalCase filenames matching the component name: `AgentDashboard.tsx` exports the `AgentDashboard` component. This convention allows file-system-based routing and co-location tools to function correctly.

Hooks follow the `use{Domain}{Action}` pattern. The domain prefix groups hooks by the bounded context they serve: `useAgentStatus` queries agent state, `useAuthSession` manages authentication, `useNutritionEntries` fetches nutrition data. Hooks without a domain prefix (`useToggle`, `useDebounce`) belong in `lib/hooks/` as generic utilities.

Utility modules use kebab-case: `format-currency.ts`, `parse-agent-response.ts`, `design-tokens.ts`. This distinguishes utilities (kebab-case) from components (PascalCase) in directory listings and imports.

### Backend (`apps/backend/`)

Python modules use snake_case exclusively: `agent_executor.py`, `nutrition_service.py`, `jwt_handler.py`. Functions, variables, and method names follow the same convention.

All public function signatures require type hints. Internal helper functions should also have type hints, but this is enforced at review time rather than by a linter. Return types are mandatory — a function without a return type annotation is incomplete.

FastAPI route handlers follow the `verb_resource` pattern: `create_agent`, `get_nutrition_entries`, `update_user_profile`, `delete_session`. The verb matches the HTTP method's semantic intent, not the method name itself.

### Domain prefixes

Variables and functions should use domain prefixes that map to the project's bounded contexts. These prefixes act as namespaces within flat module structures and make grep searches effective across the codebase.

| Domain | Prefix (Python) | Prefix (TypeScript) | Examples |
|--------|-----------------|--------------------|---------|
| AI agents | `agent_` | `agent` | `agent_executor`, `agentExecutionResult`, `AgentState` |
| Authentication | `auth_` | `auth` | `auth_token`, `authSession`, `AuthProvider` |
| Session management | `session_` | `session` | `session_store`, `sessionTimeout`, `SessionConfig` |
| LangGraph | `graph_` | `graph` | `graph_state`, `graphExecution`, `GraphNode` |
| Nutrition (if applicable) | `nutrition_` | `nutrition` | `nutrition_entry`, `nutritionSummary`, `NutritionEntry` |
| Database | `db_` | `db` | `db_connection`, `dbPoolConfig`, `DatabaseConfig` |


## Scientific Luxury code patterns

Code produced for this project reflects the Scientific Luxury aesthetic in its structure — precision, minimal surface area, and deliberate choices at every level.

### Component structure

React components follow a consistent internal ordering:

1. Type definitions (props interface, local types)
2. Constants (animation variants, configuration values)
3. Component function declaration
4. State and ref declarations
5. Effects and callbacks
6. Early returns for loading/error states
7. Main render

This ordering matches the reader's mental model: types tell them what the component accepts, constants tell them what configuration exists, and the function body tells them what the component does.

### Animation conventions

All animations use Framer Motion. CSS transitions and `@keyframes` are banned. Animation variants are defined as named constants outside the component function, using the approved easing curves from the design system:

```typescript
const FADE_IN_VARIANT: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};
```

The easing array `[0.4, 0, 0.2, 1]` corresponds to `--ease-smooth` from the design system. Never use `'ease-in'`, `'ease-out'`, or `'linear'` — these generic easings produce mechanical-feeling animations.

### Colour references

Colour values in code must reference design tokens, never raw hex values. The design tokens are defined in `apps/web/lib/design-tokens.ts` and the approved spectral palette is:

- Cyan `#00F5FF` — active states, interactive elements
- Emerald `#00FF88` — success states, confirmations
- Amber `#FFB800` — warning states, attention required
- Red `#FF4444` — error states, destructive actions
- Magenta `#FF00FF` — escalation states, human intervention required

Background surfaces use `#050505` (OLED Black). Never use pure white `#FFFFFF` for text — use `text-white/90` for primary text, `text-white/60` for secondary, `text-white/40` for tertiary.

### Border radius

All interactive elements use `rounded-sm` exclusively. No `rounded-md`, `rounded-lg`, `rounded-full`, or custom border-radius values. This constraint is non-negotiable — it is the single most recognisable visual signature of the Scientific Luxury system.


## Error handling patterns

### Frontend

Errors propagate through React Error Boundaries at the page level and through `try/catch` at the data-fetching level. User-facing error messages use the toast system with spectral colour coding: Amber for recoverable warnings, Red for failures.

Error messages must be specific and actionable: "Failed to load agent status — check your network connection" rather than "Something went wrong".

### Backend

FastAPI routes catch domain exceptions and translate them to structured JSON responses with appropriate HTTP status codes. The response shape is consistent:

```python
{"error": {"code": "AGENT_TIMEOUT", "message": "Agent execution exceeded the 30-second timeout", "details": {"agent_id": "abc-123", "timeout_ms": 30000}}}
```

Never return bare string errors. Never expose stack traces in production responses. The `code` field uses SCREAMING_SNAKE_CASE and is machine-readable. The `message` field is human-readable and uses en-AU spelling.


## Logging conventions

### Frontend

No `console.log` in production code. Development-only logging uses a structured logger that is tree-shaken from production builds. The logger accepts a context object alongside the message.

### Backend

Python logging uses the `structlog` pattern with bound context:

```python
logger = structlog.get_logger(__name__)
logger.info("agent_execution_started", agent_id=agent_id, input_length=len(input_text))
```

Log event names use `snake_case` and describe what happened, not what will happen: `agent_execution_completed` rather than `completing_agent_execution`.
