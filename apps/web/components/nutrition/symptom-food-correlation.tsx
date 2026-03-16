'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SymptomCorrelation } from '@/types/nutrition';

export function SymptomFoodCorrelation() {
  const [correlations, setCorrelations] = useState<SymptomCorrelation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/nutrition/symptoms/correlations?days=30')
      .then((r) => r.json())
      .then((json) => setCorrelations(json.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (correlations.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle as="h3" className="text-lg">
            Food-Symptom Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Log more food diary entries with trigger notes and mark symptoms as food-related to see
            patterns here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle as="h3" className="text-lg">
          Food-Symptom Patterns (30 days)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {correlations.map((c) => (
          <div
            key={c.trigger}
            className="bg-muted/50 flex items-center justify-between rounded-md p-3"
          >
            <div>
              <p className="text-sm font-medium">{c.trigger}</p>
              <p className="text-muted-foreground text-xs">Most common: {c.most_common_symptom}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{c.occurrence_count}x</Badge>
              <Badge variant={c.avg_severity > 6 ? 'destructive' : 'secondary'}>
                Avg severity: {c.avg_severity}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
