import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const BENEFIT_LABELS: Record<string, string> = {
  reduces_inflammation: 'Anti-inflammatory',
  omega3_source: 'Omega-3 Rich',
  magnesium_rich: 'Magnesium Rich',
  calcium_rich: 'Calcium Rich',
  vitamin_d_source: 'Vitamin D',
  b_vitamin_source: 'B Vitamins',
  gut_health: 'Gut Health',
  complete_protein: 'Complete Protein',
  iron_rich: 'Iron Rich',
  bone_health: 'Bone Health',
  brain_health: 'Brain Health',
  immune_support: 'Immune Support',
  sustained_energy: 'Sustained Energy',
  no_cook: 'No Cook',
  low_effort: 'Low Effort',
  probiotics: 'Probiotics',
  choline_rich: 'Choline Rich',
  high_protein: 'High Protein',
  fiber_rich: 'Fibre Rich',
  zinc_source: 'Zinc',
  iodine_source: 'Iodine',
};

interface FndBenefitBadgeProps {
  benefit: string;
  className?: string;
}

export function FndBenefitBadge({ benefit, className }: FndBenefitBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'border-teal-200 bg-teal-100 text-teal-800 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
        className
      )}
    >
      {BENEFIT_LABELS[benefit] || benefit}
    </Badge>
  );
}
