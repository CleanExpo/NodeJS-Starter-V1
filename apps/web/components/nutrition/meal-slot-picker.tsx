'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';
import type { Recipe, MealSlot } from '@/types/nutrition';
import { DAY_LABELS, MEAL_SLOT_LABELS } from '@/types/nutrition';

interface MealSlotPickerProps {
  open: boolean;
  onClose: () => void;
  dayOfWeek: number;
  mealSlot: MealSlot;
  onSelect: (recipeId: string) => void;
}

export function MealSlotPicker({
  open,
  onClose,
  dayOfWeek,
  mealSlot,
  onSelect,
}: MealSlotPickerProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRecipes = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      const r = await fetch(`/api/nutrition/recipes?${params}`);
      const json = await r.json();
      setRecipes(json.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    // Spinner state must flip on synchronously before the awaited fetch;
    // the rule can't see that this render is the loading state itself.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRecipes(search);
  }, [open, search, fetchRecipes]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[80vh] max-w-lg flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {DAY_LABELS[dayOfWeek]} - {MEAL_SLOT_LABELS[mealSlot]}
          </DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />

        <div className="flex-1 space-y-1 overflow-y-auto">
          {loading && (
            <p className="text-muted-foreground p-4 text-center text-sm">Loading recipes...</p>
          )}
          {!loading && recipes.length === 0 && (
            <p className="text-muted-foreground p-4 text-center text-sm">No recipes found.</p>
          )}
          {recipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => {
                onSelect(recipe.id);
                onClose();
              }}
              className="hover:bg-muted w-full rounded-md p-3 text-left transition-colors"
            >
              <p className="text-sm font-medium">{recipe.name}</p>
              <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recipe.total_time_minutes}min
                </span>
                {recipe.protein_g && <span>{recipe.protein_g}g protein</span>}
                <span>{Math.round(recipe.calories_per_serving || 0)}cal</span>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
