'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMealPlan } from '@/hooks/nutrition/use-meal-plan';
import { MealPlanGrid } from '@/components/nutrition/meal-plan-grid';
import { MealSlotPicker } from '@/components/nutrition/meal-slot-picker';
import { ShoppingListPanel } from '@/components/nutrition/shopping-list-panel';
import type { MealSlot } from '@/types/nutrition';

export default function MealPlanPage() {
  const { plan, weekStart, loading, addEntry, removeEntry, navigateWeek } = useMealPlan();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('breakfast');

  const handleSlotClick = (dayOfWeek: number, mealSlot: MealSlot) => {
    setSelectedDay(dayOfWeek);
    setSelectedSlot(mealSlot);
    setPickerOpen(true);
  };

  const handleRecipeSelect = async (recipeId: string) => {
    await addEntry(selectedDay, selectedSlot, recipeId);
  };

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meal Plan</h1>
        <p className="text-muted-foreground mt-1">
          Plan your weekly meals and generate shopping lists.
        </p>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Prev
        </Button>
        <span className="font-medium">
          {formatDate(weekStart)} - {formatDate(weekEnd)}
        </span>
        <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <MealPlanGrid plan={plan} onSlotClick={handleSlotClick} onRemoveEntry={removeEntry} />
      )}

      <ShoppingListPanel planId={plan?.id || null} />

      <MealSlotPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        dayOfWeek={selectedDay}
        mealSlot={selectedSlot}
        onSelect={handleRecipeSelect}
      />
    </div>
  );
}
