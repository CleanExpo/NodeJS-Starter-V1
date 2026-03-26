'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnergyLevelIndicator } from './energy-level-indicator';
import { SYMPTOM_TYPE_LABELS } from '@/types/nutrition';
import type { SymptomLog } from '@/types/nutrition';
import { cn } from '@/lib/utils';

interface SymptomLogListProps {
  logs: SymptomLog[];
  onDelete: (id: string) => void;
}

function getSeverityColor(severity: number): string {
  if (severity <= 3) return 'text-green-600 dark:text-green-400';
  if (severity <= 6) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function SymptomLogList({ logs, onDelete }: SymptomLogListProps) {
  if (logs.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">No symptoms logged today.</p>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start justify-between rounded-md border p-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={cn('text-lg font-bold', getSeverityColor(log.severity))}>
                {log.severity}
              </span>
              <span className="text-sm font-medium">{log.symptom_name}</span>
              <Badge variant="secondary" className="text-xs">
                {SYMPTOM_TYPE_LABELS[log.symptom_type]}
              </Badge>
              {log.food_related && (
                <Badge variant="outline" className="text-xs">
                  Food related
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              {log.symptom_time && (
                <span className="text-muted-foreground text-xs">{log.symptom_time}</span>
              )}
              {log.energy_level && <EnergyLevelIndicator level={log.energy_level} />}
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => onDelete(log.id)}>
            <Trash2 className="text-muted-foreground h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
