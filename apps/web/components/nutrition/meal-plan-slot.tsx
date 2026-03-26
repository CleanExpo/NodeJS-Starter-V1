'use client';

import { Plus, X } from 'lucide-react';
import type { MealPlanEntry } from '@/types/nutrition';

interface MealPlanSlotProps {
  entry?: MealPlanEntry;
  onClick: () => void;
  onRemove?: () => void;
}

export function MealPlanSlot({ entry, onClick, onRemove }: MealPlanSlotProps) {
  if (!entry) {
    return (
      <button
        onClick={onClick}
        className="border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 flex min-h-[60px] items-center justify-center rounded-md border border-dashed p-2 transition-colors"
      >
        <Plus className="text-muted-foreground h-4 w-4" />
      </button>
    );
  }

  const name = entry.recipe?.name || entry.custom_entry_name || 'Meal';

  return (
    <div className="group bg-primary/5 border-primary/20 hover:border-primary/40 relative min-h-[60px] rounded-md border p-2 transition-colors">
      <p className="line-clamp-2 text-xs leading-tight font-medium">{name}</p>
      {entry.recipe?.protein_g && (
        <p className="text-muted-foreground mt-0.5 text-[10px]">
          {entry.recipe.protein_g}g protein
        </p>
      )}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="bg-destructive text-destructive-foreground absolute top-1 right-1 hidden h-4 w-4 items-center justify-center rounded-full group-hover:flex"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
