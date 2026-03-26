'use client';

import { MealPlanSlot } from './meal-plan-slot';
import type { MealPlan, MealSlot, MealPlanEntry } from '@/types/nutrition';
import { DAY_LABELS, MEAL_SLOT_LABELS } from '@/types/nutrition';

const MEAL_SLOTS: MealSlot[] = ['breakfast', 'snack_am', 'lunch', 'snack_pm', 'dinner'];

interface MealPlanGridProps {
  plan: MealPlan | null;
  onSlotClick: (dayOfWeek: number, mealSlot: MealSlot) => void;
  onRemoveEntry: (entryId: string) => void;
}

export function MealPlanGrid({ plan, onSlotClick, onRemoveEntry }: MealPlanGridProps) {
  const getEntry = (dayOfWeek: number, mealSlot: MealSlot): MealPlanEntry | undefined => {
    return plan?.entries?.find((e) => e.day_of_week === dayOfWeek && e.meal_slot === mealSlot);
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header row */}
        <div className="mb-1 grid grid-cols-8 gap-1">
          <div className="text-muted-foreground p-2 text-xs font-medium" />
          {DAY_LABELS.map((day, i) => (
            <div key={i} className="bg-muted rounded-md p-2 text-center text-xs font-semibold">
              {day}
            </div>
          ))}
        </div>

        {/* Meal rows */}
        {MEAL_SLOTS.map((slot) => (
          <div key={slot} className="mb-1 grid grid-cols-8 gap-1">
            <div className="text-muted-foreground flex items-center p-2 text-xs font-medium">
              {MEAL_SLOT_LABELS[slot]}
            </div>
            {Array.from({ length: 7 }, (_, dayIdx) => {
              const entry = getEntry(dayIdx, slot);
              return (
                <MealPlanSlot
                  key={`${dayIdx}-${slot}`}
                  entry={entry}
                  onClick={() => onSlotClick(dayIdx, slot)}
                  onRemove={entry ? () => onRemoveEntry(entry.id) : undefined}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
