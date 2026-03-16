'use client';

import { useRecipes } from '@/hooks/nutrition/use-recipes';
import { RecipeCard } from '@/components/nutrition/recipe-card';
import { RecipeFilterPanel } from '@/components/nutrition/recipe-filter-panel';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecipesPage() {
  const { recipes, filters, loading, updateFilters, clearFilters } = useRecipes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recipes</h1>
        <p className="text-muted-foreground mt-1">
          Dairy-free, FND-friendly recipes with 5 or fewer ingredients and simple prep.
        </p>
      </div>

      <RecipeFilterPanel filters={filters} onUpdate={updateFilters} onClear={clearFilters} />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">
          No recipes found matching your filters.
        </p>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
