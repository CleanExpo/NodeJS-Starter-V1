import { SupabaseClient } from '@supabase/supabase-js';
import type { SymptomLog, SymptomCorrelation } from '@/types/nutrition';

export async function getSymptomLogs(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<SymptomLog[]> {
  const { data, error } = await supabase
    .from('symptom_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('symptom_date', startDate)
    .lte('symptom_date', endDate)
    .order('symptom_date', { ascending: false })
    .order('symptom_time', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSymptomLogsByDate(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<SymptomLog[]> {
  const { data, error } = await supabase
    .from('symptom_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('symptom_date', date)
    .order('symptom_time', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createSymptomLog(
  supabase: SupabaseClient,
  log: Omit<SymptomLog, 'id' | 'created_at' | 'updated_at'>
): Promise<SymptomLog> {
  const { data, error } = await supabase.from('symptom_logs').insert(log).select().single();

  if (error) throw error;
  return data;
}

export async function updateSymptomLog(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<SymptomLog>
): Promise<SymptomLog> {
  const { data, error } = await supabase
    .from('symptom_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSymptomLog(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('symptom_logs').delete().eq('id', id);

  if (error) throw error;
}

export async function getSymptomCorrelations(
  supabase: SupabaseClient,
  userId: string,
  days: number = 30
): Promise<SymptomCorrelation[]> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  // Get symptoms that are food-related
  const { data: symptoms, error: sympError } = await supabase
    .from('symptom_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('food_related', true)
    .gte('symptom_date', startDate)
    .lte('symptom_date', endDate);

  if (sympError) throw sympError;

  // Get diary entries with triggers
  const { data: diaryEntries, error: diaryError } = await supabase
    .from('food_diary_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('contains_triggers', true)
    .gte('entry_date', startDate)
    .lte('entry_date', endDate);

  if (diaryError) throw diaryError;

  // Build correlations from trigger foods and symptom patterns
  const triggerDates = new Map<string, Set<string>>();
  for (const entry of diaryEntries || []) {
    if (entry.trigger_notes) {
      if (!triggerDates.has(entry.trigger_notes)) {
        triggerDates.set(entry.trigger_notes, new Set());
      }
      triggerDates.get(entry.trigger_notes)!.add(entry.entry_date);
    }
  }

  const correlations: SymptomCorrelation[] = [];
  for (const [trigger, dates] of triggerDates) {
    const relatedSymptoms = (symptoms || []).filter((s) => dates.has(s.symptom_date));
    if (relatedSymptoms.length > 0) {
      const avgSeverity =
        relatedSymptoms.reduce((sum, s) => sum + s.severity, 0) / relatedSymptoms.length;
      const symptomCounts = relatedSymptoms.reduce<Record<string, number>>((acc, s) => {
        acc[s.symptom_name] = (acc[s.symptom_name] || 0) + 1;
        return acc;
      }, {});
      const mostCommon = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0];

      correlations.push({
        trigger,
        avg_severity: Math.round(avgSeverity * 10) / 10,
        occurrence_count: relatedSymptoms.length,
        most_common_symptom: mostCommon[0],
      });
    }
  }

  return correlations.sort((a, b) => b.occurrence_count - a.occurrence_count);
}
