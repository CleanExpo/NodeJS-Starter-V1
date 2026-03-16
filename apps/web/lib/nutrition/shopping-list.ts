import { SupabaseClient } from '@supabase/supabase-js';

export interface ShoppingListItem {
  ingredient_name: string;
  total_quantity: number | null;
  unit: string | null;
  recipes: string[];
}

export async function generateShoppingList(
  supabase: SupabaseClient,
  mealPlanId: string
): Promise<ShoppingListItem[]> {
  const { data, error } = await supabase
    .from('meal_plan_entries')
    .select('servings, recipe:recipes(name, recipe_ingredients(*))')
    .eq('meal_plan_id', mealPlanId);

  if (error) throw error;

  const ingredientMap = new Map<string, ShoppingListItem>();

  for (const entry of data || []) {
    const recipe = entry.recipe as unknown as {
      name: string;
      recipe_ingredients: {
        ingredient_name: string;
        quantity: number | null;
        unit: string | null;
      }[];
    } | null;
    if (!recipe?.recipe_ingredients) continue;

    const servingsMultiplier = Number(entry.servings) || 1;

    for (const ing of recipe.recipe_ingredients) {
      const key = `${ing.ingredient_name.toLowerCase()}_${ing.unit || ''}`;
      const existing = ingredientMap.get(key);

      if (existing) {
        if (existing.total_quantity !== null && ing.quantity !== null) {
          existing.total_quantity += ing.quantity * servingsMultiplier;
        }
        if (!existing.recipes.includes(recipe.name)) {
          existing.recipes.push(recipe.name);
        }
      } else {
        ingredientMap.set(key, {
          ingredient_name: ing.ingredient_name,
          total_quantity: ing.quantity ? ing.quantity * servingsMultiplier : null,
          unit: ing.unit,
          recipes: [recipe.name],
        });
      }
    }
  }

  return Array.from(ingredientMap.values()).sort((a, b) =>
    a.ingredient_name.localeCompare(b.ingredient_name)
  );
}
