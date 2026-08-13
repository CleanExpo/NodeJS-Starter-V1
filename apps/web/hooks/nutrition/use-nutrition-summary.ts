'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  DailyNutritionSummary,
  NutrientGoalProgress,
  UserHealthProfile,
} from '@/types/nutrition';

export function useNutritionSummary(profile: UserHealthProfile | null) {
  const [weeklySummary, setWeeklySummary] = useState<DailyNutritionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchWeekly = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];
      const res = await fetch(
        `/api/nutrition/diary/summary?start_date=${startDate}&end_date=${endDate}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (requestId === requestIdRef.current) setWeeklySummary(json.data);
    } catch (e) {
      if (requestId === requestIdRef.current) setError(e as Error);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchWeekly(), 0);
    return () => {
      window.clearTimeout(timeoutId);
      requestIdRef.current += 1;
    };
  }, [fetchWeekly]);

  const todaySummary = weeklySummary.find((s) => s.date === new Date().toISOString().split('T')[0]);

  const goalProgress: NutrientGoalProgress[] = profile
    ? [
        {
          nutrient: 'protein',
          label: 'Protein',
          current: todaySummary?.total_protein_g || 0,
          target: profile.protein_target_g || 100,
          unit: 'g',
          percentage: Math.min(
            100,
            Math.round(
              ((todaySummary?.total_protein_g || 0) / (profile.protein_target_g || 100)) * 100
            )
          ),
        },
        {
          nutrient: 'magnesium',
          label: 'Magnesium',
          current: todaySummary?.total_magnesium_mg || 0,
          target: profile.magnesium_target_mg,
          unit: 'mg',
          percentage: Math.min(
            100,
            Math.round(
              ((todaySummary?.total_magnesium_mg || 0) / profile.magnesium_target_mg) * 100
            )
          ),
        },
        {
          nutrient: 'vitamin_d',
          label: 'Vitamin D',
          current: todaySummary?.total_vitamin_d_iu || 0,
          target: profile.vitamin_d_target_iu,
          unit: 'IU',
          percentage: Math.min(
            100,
            Math.round(
              ((todaySummary?.total_vitamin_d_iu || 0) / profile.vitamin_d_target_iu) * 100
            )
          ),
        },
        {
          nutrient: 'calcium',
          label: 'Calcium',
          current: todaySummary?.total_calcium_mg || 0,
          target: profile.calcium_target_mg,
          unit: 'mg',
          percentage: Math.min(
            100,
            Math.round(((todaySummary?.total_calcium_mg || 0) / profile.calcium_target_mg) * 100)
          ),
        },
        {
          nutrient: 'omega3',
          label: 'Omega-3',
          current: todaySummary?.total_omega3_g || 0,
          target: profile.omega3_target_g,
          unit: 'g',
          percentage: Math.min(
            100,
            Math.round(((todaySummary?.total_omega3_g || 0) / profile.omega3_target_g) * 100)
          ),
        },
        {
          nutrient: 'b12',
          label: 'Vitamin B12',
          current: todaySummary?.total_b12_mcg || 0,
          target: profile.b12_target_mcg,
          unit: 'mcg',
          percentage: Math.min(
            100,
            Math.round(((todaySummary?.total_b12_mcg || 0) / profile.b12_target_mcg) * 100)
          ),
        },
      ]
    : [];

  return {
    weeklySummary,
    todaySummary,
    goalProgress,
    loading,
    error,
    refetch: fetchWeekly,
  };
}
