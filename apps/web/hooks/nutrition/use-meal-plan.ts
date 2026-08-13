'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { MealPlan, MealSlot } from '@/types/nutrition';
import { getWeekStartDate } from '@/lib/nutrition/meal-plans';

export function useMealPlan() {
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [weekStart, setWeekStart] = useState(getWeekStartDate());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchPlan = useCallback(async (ws: string) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/nutrition/meal-plans?week_start=${ws}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (requestId === requestIdRef.current) setPlan(json.data);
    } catch (e) {
      if (requestId === requestIdRef.current) setError(e as Error);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchPlan(weekStart), 0);
    return () => {
      window.clearTimeout(timeoutId);
      requestIdRef.current += 1;
    };
  }, [weekStart, fetchPlan]);

  const ensurePlan = useCallback(async (): Promise<string> => {
    if (plan?.id) return plan.id;
    const res = await fetch('/api/nutrition/meal-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_start_date: weekStart }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    setPlan(json.data);
    return json.data.id;
  }, [plan, weekStart]);

  const addEntry = useCallback(
    async (dayOfWeek: number, mealSlot: MealSlot, recipeId: string, servings?: number) => {
      try {
        const planId = await ensurePlan();
        const res = await fetch(`/api/nutrition/meal-plans/${planId}/entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            day_of_week: dayOfWeek,
            meal_slot: mealSlot,
            recipe_id: recipeId,
            servings: servings || 1,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        await fetchPlan(weekStart);
        return json.data;
      } catch (e) {
        setError(e as Error);
        throw e;
      }
    },
    [ensurePlan, fetchPlan, weekStart]
  );

  const removeEntry = useCallback(
    async (entryId: string) => {
      if (!plan?.id) return;
      try {
        const res = await fetch(`/api/nutrition/meal-plans/${plan.id}/entries`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entry_id: entryId }),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error);
        }
        await fetchPlan(weekStart);
      } catch (e) {
        setError(e as Error);
        throw e;
      }
    },
    [plan, fetchPlan, weekStart]
  );

  const navigateWeek = useCallback(
    (direction: 'prev' | 'next') => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + (direction === 'next' ? 7 : -7));
      setWeekStart(d.toISOString().split('T')[0]);
    },
    [weekStart]
  );

  return {
    plan,
    weekStart,
    loading,
    error,
    addEntry,
    removeEntry,
    navigateWeek,
    refetch: () => fetchPlan(weekStart),
  };
}
