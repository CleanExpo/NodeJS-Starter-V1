import { SupabaseClient } from '@supabase/supabase-js';
import type { MealPlan, MealPlanEntry } from '@/types/nutrition';

export async function getMealPlan(
  supabase: SupabaseClient,
  userId: string,
  weekStartDate: string
): Promise<MealPlan | null> {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*, meal_plan_entries(*, recipe:recipes(*))')
    .eq('user_id', userId)
    .eq('week_start_date', weekStartDate)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createMealPlan(
  supabase: SupabaseClient,
  userId: string,
  weekStartDate: string,
  name?: string
): Promise<MealPlan> {
  const { data, error } = await supabase
    .from('meal_plans')
    .upsert(
      { user_id: userId, week_start_date: weekStartDate, name },
      { onConflict: 'user_id,week_start_date' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addMealPlanEntry(
  supabase: SupabaseClient,
  entry: Omit<MealPlanEntry, 'id' | 'created_at' | 'updated_at' | 'recipe'>
): Promise<MealPlanEntry> {
  const { data, error } = await supabase
    .from('meal_plan_entries')
    .insert(entry)
    .select('*, recipe:recipes(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function removeMealPlanEntry(
  supabase: SupabaseClient,
  entryId: string
): Promise<void> {
  const { error } = await supabase.from('meal_plan_entries').delete().eq('id', entryId);

  if (error) throw error;
}

export async function deleteMealPlan(supabase: SupabaseClient, planId: string): Promise<void> {
  const { error } = await supabase.from('meal_plans').delete().eq('id', planId);

  if (error) throw error;
}

export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}
