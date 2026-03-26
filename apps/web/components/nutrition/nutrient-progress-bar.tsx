'use client';

import { cn } from '@/lib/utils';
import type { NutrientGoalProgress } from '@/types/nutrition';

interface NutrientProgressBarProps {
  progress: NutrientGoalProgress;
  className?: string;
}

export function NutrientProgressBar({ progress, className }: NutrientProgressBarProps) {
  const getColor = (pct: number) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 50) return 'bg-yellow-500';
    return 'bg-red-400';
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-sm">
        <span className="font-medium">{progress.label}</span>
        <span className="text-muted-foreground">
          {Math.round(progress.current)}/{progress.target} {progress.unit}
        </span>
      </div>
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            getColor(progress.percentage)
          )}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
}
