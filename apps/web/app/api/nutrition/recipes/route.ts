import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRecipes } from '@/lib/nutrition/recipes';
import type { RecipeFilters } from '@/types/nutrition';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = request.nextUrl.searchParams;
    const filters: RecipeFilters = {};

    if (params.get('meal_type'))
      filters.meal_type = params.get('meal_type') as RecipeFilters['meal_type'];
    if (params.get('max_time')) filters.max_time = Number(params.get('max_time'));
    if (params.get('min_protein')) filters.min_protein = Number(params.get('min_protein'));
    if (params.get('difficulty'))
      filters.difficulty = params.get('difficulty') as RecipeFilters['difficulty'];
    if (params.get('search')) filters.search = params.get('search')!;
    if (params.get('dietary_tags')) filters.dietary_tags = params.get('dietary_tags')!.split(',');
    if (params.get('trigger_free')) filters.trigger_free = params.get('trigger_free')!.split(',');

    const recipes = await getRecipes(supabase, filters);
    return NextResponse.json({ data: recipes });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
