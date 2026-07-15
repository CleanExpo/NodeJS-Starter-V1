import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getRecipeBySlug, getAllRecipeSlugs } from '@/lib/nutrition/recipes';
import { RecipeIngredientList } from '@/components/nutrition/recipe-ingredient-list';
import { RecipeInstructions } from '@/components/nutrition/recipe-instructions';
import { FndBenefitBadge } from '@/components/nutrition/fnd-benefit-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, Flame, ArrowLeft } from 'lucide-react';

export async function generateStaticParams() {
  // Without Supabase config (e.g. template CI builds) there is nothing to
  // prerender — pages fall back to dynamic rendering at request time.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  const supabase = await createClient();
  const slugs = await getAllRecipeSlugs(supabase);
  return slugs.map((slug) => ({ slug }));
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const recipe = await getRecipeBySlug(supabase, slug);

  if (!recipe) notFound();

  const nutrients = [
    { label: 'Calories', value: recipe.calories_per_serving, unit: 'kcal' },
    { label: 'Protein', value: recipe.protein_g, unit: 'g' },
    { label: 'Carbs', value: recipe.carbs_g, unit: 'g' },
    { label: 'Fat', value: recipe.fat_g, unit: 'g' },
    { label: 'Fibre', value: recipe.fiber_g, unit: 'g' },
    { label: 'Magnesium', value: recipe.magnesium_mg, unit: 'mg' },
    { label: 'Vitamin D', value: recipe.vitamin_d_iu, unit: 'IU' },
    { label: 'Calcium', value: recipe.calcium_mg, unit: 'mg' },
    { label: 'Omega-3', value: recipe.omega3_g, unit: 'g' },
    { label: 'B12', value: recipe.b12_mcg, unit: 'mcg' },
  ].filter((n) => n.value && n.value > 0);

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/nutrition/recipes"
        className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to recipes
      </Link>

      <div>
        <h1 className="text-3xl font-bold">{recipe.name}</h1>
        <p className="text-muted-foreground mt-2">{recipe.description}</p>
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-muted-foreground flex items-center gap-1 text-sm">
          <Clock className="h-4 w-4" />
          {recipe.prep_time_minutes}m prep + {recipe.cook_time_minutes}m cook
        </span>
        <span className="text-muted-foreground flex items-center gap-1 text-sm">
          <Users className="h-4 w-4" />
          {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
        </span>
        {recipe.calories_per_serving && (
          <span className="text-muted-foreground flex items-center gap-1 text-sm">
            <Flame className="h-4 w-4" />
            {Math.round(recipe.calories_per_serving)} cal/serving
          </span>
        )}
        <Badge variant="secondary" className="capitalize">
          {recipe.difficulty}
        </Badge>
        <Badge variant="outline" className="capitalize">
          {recipe.meal_type}
        </Badge>
      </div>

      {/* FND benefits */}
      {recipe.fnd_benefits.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.fnd_benefits.map((b) => (
            <FndBenefitBadge key={b} benefit={b} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Ingredients */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle as="h3" className="text-lg">
              Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <RecipeIngredientList ingredients={recipe.ingredients} />
            ) : (
              <p className="text-muted-foreground text-sm">No ingredients listed.</p>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle as="h3" className="text-lg">
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecipeInstructions instructions={recipe.instructions} fndNotes={recipe.fnd_notes} />
          </CardContent>
        </Card>
      </div>

      {/* Nutrition panel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle as="h3" className="text-lg">
            Nutrition per Serving
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {nutrients.map((n) => (
              <div key={n.label} className="text-center">
                <p className="text-xl font-bold">
                  {Math.round(n.value!)}
                  <span className="text-muted-foreground ml-0.5 text-xs font-normal">{n.unit}</span>
                </p>
                <p className="text-muted-foreground text-xs">{n.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/nutrition/diary">
          <Button>Log This Meal</Button>
        </Link>
        <Link href="/nutrition/meal-plan">
          <Button variant="outline">Add to Meal Plan</Button>
        </Link>
      </div>
    </div>
  );
}
