export type TaskCategory =
  | 'reasoning'
  | 'orchestration'
  | 'fast-image-generation'
  | 'image-editing'
  | 'branding-visual'
  | 'logo-render';

export interface RouteDecision {
  category: TaskCategory;
  provider: 'google' | 'anthropic' | 'nano-banana';
  modelId: string;
  rationale: string;
}

const ROUTING_TABLE: Record<TaskCategory, RouteDecision> = {
  reasoning: {
    category: 'reasoning',
    provider: 'google',
    modelId: 'gemini-2.5-pro-preview',
    rationale: 'Complex reasoning requires highest-capability model',
  },
  orchestration: {
    category: 'orchestration',
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-6',
    rationale: 'Agent coordination uses Claude for instruction following',
  },
  'fast-image-generation': {
    category: 'fast-image-generation',
    provider: 'google',
    modelId: 'gemini-2.5-flash-image',
    rationale: 'Fast iteration cycles require low-latency image model',
  },
  'image-editing': {
    category: 'image-editing',
    provider: 'nano-banana',
    modelId: 'nano-banana-pro',
    rationale: 'Image editing with context uses Nano Banana',
  },
  'branding-visual': {
    category: 'branding-visual',
    provider: 'google',
    modelId: 'imagen-4',
    rationale: 'High-fidelity branding requires Imagen 4 quality',
  },
  'logo-render': {
    category: 'logo-render',
    provider: 'google',
    modelId: 'imagen-4',
    rationale: '3D logo renders require Imagen 4 quality',
  },
};

export function routeTask(category: TaskCategory): RouteDecision {
  return ROUTING_TABLE[category];
}

export function getAllRoutes(): RouteDecision[] {
  return Object.values(ROUTING_TABLE);
}
