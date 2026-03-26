import { SupabaseClient } from '@supabase/supabase-js';
import type { UserHealthProfile } from '@/types/nutrition';

export async function getHealthProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<UserHealthProfile | null> {
  const { data, error } = await supabase
    .from('user_health_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upsertHealthProfile(
  supabase: SupabaseClient,
  userId: string,
  profile: Partial<UserHealthProfile>
): Promise<UserHealthProfile> {
  const profileData = {
    ...profile,
    user_id: userId,
    // Auto-calculate protein target from weight if weight provided
    ...(profile.weight_kg && !profile.protein_target_g
      ? { protein_target_g: Math.round(profile.weight_kg * 1.6 * 10) / 10 }
      : {}),
  };

  const { data, error } = await supabase
    .from('user_health_profiles')
    .upsert(profileData, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function computeProteinTarget(weightKg: number): number {
  return Math.round(weightKg * 1.6 * 10) / 10;
}
