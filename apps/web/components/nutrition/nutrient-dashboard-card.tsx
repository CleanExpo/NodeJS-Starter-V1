'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NutrientProgressBar } from './nutrient-progress-bar';
import type { NutrientGoalProgress } from '@/types/nutrition';

interface NutrientDashboardCardProps {
  goalProgress: NutrientGoalProgress[];
  totalCalories?: number;
}

export function NutrientDashboardCard({ goalProgress, totalCalories }: NutrientDashboardCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle as="h3" className="text-lg">
          Today&apos;s Nutrients
        </CardTitle>
        {totalCalories !== undefined && (
          <p className="text-foreground text-2xl font-bold">{Math.round(totalCalories)} kcal</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {goalProgress.map((p) => (
          <NutrientProgressBar key={p.nutrient} progress={p} />
        ))}
        {goalProgress.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Complete your health profile to see nutrient targets.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
