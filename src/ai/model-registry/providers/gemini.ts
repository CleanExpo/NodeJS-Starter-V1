export type ModelTier = 'reasoning' | 'fast-image' | 'branding-image';

export interface ModelConfig {
  id: string;
  name: string;
  tier: ModelTier;
  approved: boolean;
  approvedAt: string;
  replacedBy?: string;
}

export const GEMINI_APPROVED_MODELS: Record<ModelTier, ModelConfig> = {
  reasoning: {
    id: 'gemini-2.5-pro-preview',
    name: 'Gemini 2.5 Pro Preview',
    tier: 'reasoning',
    approved: true,
    approvedAt: '2026-03-06',
  },
  'fast-image': {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    tier: 'fast-image',
    approved: true,
    approvedAt: '2026-03-06',
  },
  'branding-image': {
    id: 'imagen-4',
    name: 'Imagen 4',
    tier: 'branding-image',
    approved: true,
    approvedAt: '2026-03-06',
  },
};

export function checkModelCurrency(
  configuredId: string,
  tier: ModelTier
): 'CURRENT' | 'OUTDATED' | 'UNAPPROVED' {
  const approved = GEMINI_APPROVED_MODELS[tier];
  if (!approved) return 'UNAPPROVED';
  if (configuredId === approved.id) return 'CURRENT';
  if (approved.replacedBy === configuredId) return 'CURRENT';
  return 'OUTDATED';
}
