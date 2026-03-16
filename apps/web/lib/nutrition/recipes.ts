import { SupabaseClient } from '@supabase/supabase-js';
import type { Recipe, RecipeFilters } from '@/types/nutrition';

export async function getRecipes(
  supabase: SupabaseClient,
  filters?: RecipeFilters
): Promise<Recipe[]> {
  let query = supabase.from('recipes').select('*, recipe_ingredients(*)').order('name');

  if (filters?.meal_type) {
    query = query.eq('meal_type', filters.meal_type);
  }
  if (filters?.max_time) {
    query = query.lte('total_time_minutes', filters.max_time);
  }
  if (filters?.min_protein) {
    query = query.gte('protein_g', filters.min_protein);
  }
  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  if (filters?.dietary_tags?.length) {
    query = query.contains('dietary_tags', filters.dietary_tags);
  }
  if (filters?.trigger_free?.length) {
    query = query.contains('trigger_free', filters.trigger_free);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getRecipeBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, recipe_ingredients(*)')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getRecipeById(supabase: SupabaseClient, id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, recipe_ingredients(*)')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getAllRecipeSlugs(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase.from('recipes').select('slug').eq('is_seed', true);

  if (error) throw error;
  return (data || []).map((r) => r.slug);
}
