import { SupabaseClient } from '@supabase/supabase-js';
import type { FoodDiaryEntry, DailyNutritionSummary } from '@/types/nutrition';

export async function getDiaryEntries(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<FoodDiaryEntry[]> {
  const { data, error } = await supabase
    .from('food_diary_entries')
    .select('*, recipe:recipes(name, slug)')
    .eq('user_id', userId)
    .eq('entry_date', date)
    .order('created_at');

  if (error) throw error;
  return data || [];
}

export async function createDiaryEntry(
  supabase: SupabaseClient,
  entry: Omit<FoodDiaryEntry, 'id' | 'created_at' | 'updated_at' | 'recipe'>
): Promise<FoodDiaryEntry> {
  const { data, error } = await supabase
    .from('food_diary_entries')
    .insert(entry)
    .select('*, recipe:recipes(name, slug)')
    .single();

  if (error) throw error;
  return data;
}

export async function updateDiaryEntry(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<FoodDiaryEntry>
): Promise<FoodDiaryEntry> {
  const { data, error } = await supabase
    .from('food_diary_entries')
    .update(updates)
    .eq('id', id)
    .select('*, recipe:recipes(name, slug)')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDiaryEntry(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('food_diary_entries').delete().eq('id', id);

  if (error) throw error;
}

export async function getDailySummary(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<DailyNutritionSummary> {
  const entries = await getDiaryEntries(supabase, userId, date);

  return {
    date,
    total_calories: sumField(entries, 'calories'),
    total_protein_g: sumField(entries, 'protein_g'),
    total_carbs_g: sumField(entries, 'carbs_g'),
    total_fat_g: sumField(entries, 'fat_g'),
    total_fiber_g: sumField(entries, 'fiber_g'),
    total_magnesium_mg: sumField(entries, 'magnesium_mg'),
    total_vitamin_d_iu: sumField(entries, 'vitamin_d_iu'),
    total_calcium_mg: sumField(entries, 'calcium_mg'),
    total_omega3_g: sumField(entries, 'omega3_g'),
    total_b12_mcg: sumField(entries, 'b12_mcg'),
    entry_count: entries.length,
    has_trigger_foods: entries.some((e) => e.contains_triggers),
  };
}

export async function getWeeklySummary(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyNutritionSummary[]> {
  const { data, error } = await supabase
    .from('food_diary_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('entry_date', startDate)
    .lte('entry_date', endDate)
    .order('entry_date');

  if (error) throw error;

  const grouped = ((data as FoodDiaryEntry[]) || []).reduce<Record<string, FoodDiaryEntry[]>>(
    (acc, entry) => {
      if (!acc[entry.entry_date]) acc[entry.entry_date] = [];
      acc[entry.entry_date].push(entry);
      return acc;
    },
    {}
  );

  return Object.entries(grouped).map(([date, entries]) => ({
    date,
    total_calories: sumField(entries, 'calories'),
    total_protein_g: sumField(entries, 'protein_g'),
    total_carbs_g: sumField(entries, 'carbs_g'),
    total_fat_g: sumField(entries, 'fat_g'),
    total_fiber_g: sumField(entries, 'fiber_g'),
    total_magnesium_mg: sumField(entries, 'magnesium_mg'),
    total_vitamin_d_iu: sumField(entries, 'vitamin_d_iu'),
    total_calcium_mg: sumField(entries, 'calcium_mg'),
    total_omega3_g: sumField(entries, 'omega3_g'),
    total_b12_mcg: sumField(entries, 'b12_mcg'),
    entry_count: entries.length,
    has_trigger_foods: entries.some((e) => e.contains_triggers),
  }));
}

function sumField(entries: FoodDiaryEntry[], field: keyof FoodDiaryEntry): number {
  return entries.reduce((sum, e) => sum + (Number(e[field]) || 0), 0);
}
