import { TriggerFoodBadge } from './trigger-food-badge';
import type { RecipeIngredient } from '@/types/nutrition';

interface RecipeIngredientListProps {
  ingredients: RecipeIngredient[];
}

export function RecipeIngredientList({ ingredients }: RecipeIngredientListProps) {
  const sorted = [...ingredients].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <ul className="space-y-2">
      {sorted.map((ing) => (
        <li key={ing.id} className="flex items-start justify-between gap-2 py-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {ing.quantity && (
                <span className="font-medium">
                  {ing.quantity} {ing.unit}{' '}
                </span>
              )}
              {ing.ingredient_name}
              {ing.is_optional && <span className="text-muted-foreground"> (optional)</span>}
            </span>
            {ing.is_trigger_food && <TriggerFoodBadge />}
          </div>
          {ing.nutrition_note && (
            <span className="text-muted-foreground shrink-0 text-xs">{ing.nutrition_note}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
