'use client';

import Link from 'next/link';
import { Clock, Users, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FndBenefitBadge } from './fnd-benefit-badge';
import type { Recipe } from '@/types/nutrition';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/nutrition/recipes/${recipe.slug}`}>
      <Card variant="interactive" className="h-full">
        <CardContent className="space-y-3 p-4">
          <div>
            <h3 className="text-base leading-tight font-semibold">{recipe.name}</h3>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{recipe.description}</p>
          </div>

          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {recipe.total_time_minutes}min
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {recipe.servings}
            </span>
            {recipe.calories_per_serving && (
              <span className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5" />
                {Math.round(recipe.calories_per_serving)}cal
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {recipe.protein_g && (
              <Badge variant="outline" className="text-xs">
                {recipe.protein_g}g protein
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs capitalize">
              {recipe.meal_type}
            </Badge>
          </div>

          {recipe.fnd_benefits.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipe.fnd_benefits.slice(0, 2).map((b) => (
                <FndBenefitBadge key={b} benefit={b} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
