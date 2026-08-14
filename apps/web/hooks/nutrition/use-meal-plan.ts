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
  const controllerRef = useRef<AbortController | null>(null);
  const weekStartRef = useRef(weekStart);
  const mountedRef = useRef(false);

  const isCurrentOperation = useCallback(
    (requestId: number, operationWeek: string) =>
      mountedRef.current &&
      requestId === requestIdRef.current &&
      operationWeek === weekStartRef.current,
    []
  );

  const beginOperation = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return { controller, requestId: ++requestIdRef.current };
  }, []);

  const beginMutation = useCallback(() => {
    // Reads are safe to cancel. Writes are not: the server may commit after a
    // client abort, so mutations only invalidate stale UI publication.
    controllerRef.current?.abort();
    controllerRef.current = null;
    return ++requestIdRef.current;
  }, []);

  const fetchPlan = useCallback(
    async (ws: string) => {
      if (!mountedRef.current || ws !== weekStartRef.current) return;
      const { controller, requestId } = beginOperation();
      if (isCurrentOperation(requestId, ws)) {
        setLoading(true);
        setError(null);
      }
      try {
        const res = await fetch(`/api/nutrition/meal-plans?week_start=${ws}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        if (isCurrentOperation(requestId, ws)) {
          setPlan(json.data);
          setError(null);
        }
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        if (isCurrentOperation(requestId, ws)) setError(e as Error);
      } finally {
        if (isCurrentOperation(requestId, ws)) setLoading(false);
      }
    },
    [beginOperation, isCurrentOperation]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      requestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchPlan(weekStart), 0);
    return () => {
      window.clearTimeout(timeoutId);
      controllerRef.current?.abort();
      requestIdRef.current += 1;
    };
  }, [weekStart, fetchPlan]);

  const ensurePlan = useCallback(
    async (existingPlan: MealPlan | null, planWeek: string, requestId: number): Promise<string> => {
      if (existingPlan?.id && existingPlan.week_start_date === planWeek) return existingPlan.id;
      const res = await fetch('/api/nutrition/meal-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week_start_date: planWeek }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (isCurrentOperation(requestId, planWeek)) {
        setPlan(json.data);
        setError(null);
      }
      return json.data.id;
    },
    [isCurrentOperation]
  );

  const addEntry = useCallback(
    async (dayOfWeek: number, mealSlot: MealSlot, recipeId: string, servings?: number) => {
      const mutationWeek = weekStart;
      const mutationPlan = plan;
      const requestId = beginMutation();
      if (isCurrentOperation(requestId, mutationWeek)) setError(null);
      try {
        const planId = await ensurePlan(mutationPlan, mutationWeek, requestId);
        // Finish the requested write even if the visible week changes while the
        // plan is being created. Only the subsequent UI publication is scoped.
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
        if (isCurrentOperation(requestId, mutationWeek)) await fetchPlan(mutationWeek);
        return json.data;
      } catch (e) {
        if (isCurrentOperation(requestId, mutationWeek)) setError(e as Error);
        throw e;
      } finally {
        if (isCurrentOperation(requestId, mutationWeek)) setLoading(false);
      }
    },
    [beginMutation, ensurePlan, fetchPlan, isCurrentOperation, plan, weekStart]
  );

  const removeEntry = useCallback(
    async (entryId: string) => {
      if (!plan?.id) return;
      const mutationWeek = weekStart;
      const planId = plan.id;
      const requestId = beginMutation();
      if (isCurrentOperation(requestId, mutationWeek)) setError(null);
      try {
        const res = await fetch(`/api/nutrition/meal-plans/${planId}/entries`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entry_id: entryId }),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error);
        }
        if (isCurrentOperation(requestId, mutationWeek)) await fetchPlan(mutationWeek);
      } catch (e) {
        if (isCurrentOperation(requestId, mutationWeek)) setError(e as Error);
        throw e;
      } finally {
        if (isCurrentOperation(requestId, mutationWeek)) setLoading(false);
      }
    },
    [beginMutation, fetchPlan, isCurrentOperation, plan, weekStart]
  );

  const navigateWeek = useCallback(
    (direction: 'prev' | 'next') => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + (direction === 'next' ? 7 : -7));
      const nextWeek = d.toISOString().split('T')[0];
      weekStartRef.current = nextWeek;
      setPlan(null);
      setWeekStart(nextWeek);
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
