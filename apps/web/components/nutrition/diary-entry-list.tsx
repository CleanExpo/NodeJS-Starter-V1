'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TriggerFoodBadge } from './trigger-food-badge';
import { MEAL_SLOT_LABELS } from '@/types/nutrition';
import type { FoodDiaryEntry, MealSlotExtended } from '@/types/nutrition';

interface DiaryEntryListProps {
  entries: FoodDiaryEntry[];
  onDelete: (id: string) => void;
}

export function DiaryEntryList({ entries, onDelete }: DiaryEntryListProps) {
  const grouped = entries.reduce(
    (acc, entry) => {
      const slot = entry.meal_slot;
      if (!acc[slot]) acc[slot] = [];
      acc[slot].push(entry);
      return acc;
    },
    {} as Record<string, FoodDiaryEntry[]>
  );

  if (entries.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No meals logged today. Use the form above to log your first meal.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([slot, slotEntries]) => (
        <div key={slot}>
          <h4 className="text-muted-foreground mb-2 text-sm font-medium">
            {MEAL_SLOT_LABELS[slot as MealSlotExtended]}
          </h4>
          <div className="space-y-2">
            {slotEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {entry.recipe?.name || entry.custom_food_name || 'Meal'}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {entry.calories && (
                      <span className="text-muted-foreground text-xs">
                        {Math.round(entry.calories)} cal
                      </span>
                    )}
                    {entry.protein_g && (
                      <Badge variant="outline" className="h-5 text-xs">
                        {Math.round(entry.protein_g)}g protein
                      </Badge>
                    )}
                    {entry.contains_triggers && <TriggerFoodBadge />}
                    {entry.servings_consumed !== 1 && (
                      <span className="text-muted-foreground text-xs">
                        x{entry.servings_consumed}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => onDelete(entry.id)}>
                  <Trash2 className="text-muted-foreground h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
