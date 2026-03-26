import { cn } from '@/lib/utils';

interface EnergyLevelIndicatorProps {
  level: number;
  className?: string;
}

export function EnergyLevelIndicator({ level, className }: EnergyLevelIndicatorProps) {
  const getColor = (i: number) => {
    if (i <= level) {
      if (level <= 2) return 'bg-red-500';
      if (level <= 3) return 'bg-yellow-500';
      return 'bg-green-500';
    }
    return 'bg-muted';
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={cn('h-3 w-2 rounded-sm transition-colors', getColor(i))} />
      ))}
      <span className="text-muted-foreground ml-1 text-xs">{level}/5</span>
    </div>
  );
}
