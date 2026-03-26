'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MEAL_SLOT_LABELS } from '@/types/nutrition';
import type { Recipe, MealSlotExtended } from '@/types/nutrition';

interface DiaryEntryFormProps {
  onSubmit: (entry: {
    meal_slot: MealSlotExtended;
    recipe_id?: string;
    custom_food_name?: string;
    servings_consumed: number;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    contains_triggers?: boolean;
    trigger_notes?: string;
    magnesium_mg?: number;
    vitamin_d_iu?: number;
    calcium_mg?: number;
    omega3_g?: number;
    b12_mcg?: number;
  }) => Promise<void>;
}

export function DiaryEntryForm({ onSubmit }: DiaryEntryFormProps) {
  const [mealSlot, setMealSlot] = useState<MealSlotExtended>('breakfast');
  const [mode, setMode] = useState<'recipe' | 'custom'>('recipe');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [servings, setServings] = useState(1);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/nutrition/recipes')
      .then((r) => r.json())
      .then((json) => setRecipes(json.data || []));
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const recipe = recipes.find((r) => r.id === selectedRecipe);

      if (mode === 'recipe' && recipe) {
        await onSubmit({
          meal_slot: mealSlot,
          recipe_id: recipe.id,
          servings_consumed: servings,
          calories: (recipe.calories_per_serving || 0) * servings,
          protein_g: (recipe.protein_g || 0) * servings,
          carbs_g: (recipe.carbs_g || 0) * servings,
          fat_g: (recipe.fat_g || 0) * servings,
          magnesium_mg: (recipe.magnesium_mg || 0) * servings,
          vitamin_d_iu: (recipe.vitamin_d_iu || 0) * servings,
          calcium_mg: (recipe.calcium_mg || 0) * servings,
          omega3_g: (recipe.omega3_g || 0) * servings,
          b12_mcg: (recipe.b12_mcg || 0) * servings,
        });
      } else {
        await onSubmit({
          meal_slot: mealSlot,
          custom_food_name: customName,
          servings_consumed: servings,
          calories: calories ? Number(calories) : undefined,
          protein_g: protein ? Number(protein) : undefined,
        });
      }

      setSelectedRecipe('');
      setCustomName('');
      setServings(1);
      setCalories('');
      setProtein('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="grid grid-cols-2 gap-3">
        <Select value={mealSlot} onValueChange={(v) => setMealSlot(v as MealSlotExtended)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MEAL_SLOT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1">
          <Button
            variant={mode === 'recipe' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('recipe')}
          >
            Recipe
          </Button>
          <Button
            variant={mode === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('custom')}
          >
            Custom
          </Button>
        </div>
      </div>

      {mode === 'recipe' ? (
        <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
          <SelectTrigger>
            <SelectValue placeholder="Select a recipe..." />
          </SelectTrigger>
          <SelectContent>
            {recipes.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name} ({r.protein_g}g protein)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="Food name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Protein (g)"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-muted-foreground text-sm">Servings:</label>
          <Input
            type="number"
            min={0.5}
            step={0.5}
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="w-20"
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={submitting || (mode === 'recipe' ? !selectedRecipe : !customName)}
          loading={submitting}
          className="ml-auto"
        >
          Log Meal
        </Button>
      </div>
    </div>
  );
}
