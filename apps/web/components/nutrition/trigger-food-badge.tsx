import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TriggerFoodBadgeProps {
  className?: string;
  label?: string;
}

export function TriggerFoodBadge({ className, label = 'Contains Trigger' }: TriggerFoodBadgeProps) {
  return (
    <Badge variant="destructive" className={cn('text-xs', className)}>
      {label}
    </Badge>
  );
}
