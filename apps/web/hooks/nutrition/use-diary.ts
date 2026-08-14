'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { FoodDiaryEntry, DailyNutritionSummary } from '@/types/nutrition';

export function useDiary(initialDate?: string) {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<FoodDiaryEntry[]>([]);
  const [summary, setSummary] = useState<DailyNutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const dateRef = useRef(date);
  const mountedRef = useRef(false);

  const isCurrentOperation = useCallback(
    (requestId: number, operationDate: string) =>
      mountedRef.current && requestId === requestIdRef.current && operationDate === dateRef.current,
    []
  );

  const beginOperation = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return { controller, requestId: ++requestIdRef.current };
  }, []);

  const beginMutation = useCallback(() => {
    // Cancel the stale read, not the write. A dispatched write can commit even
    // if fetch is aborted, which would leave the caller with an ambiguous result.
    controllerRef.current?.abort();
    controllerRef.current = null;
    return ++requestIdRef.current;
  }, []);

  const updateDate = useCallback((nextDate: string) => {
    dateRef.current = nextDate;
    setDate(nextDate);
  }, []);

  const fetchEntries = useCallback(
    async (d: string) => {
      if (!mountedRef.current || d !== dateRef.current) return;
      const { controller, requestId } = beginOperation();
      if (isCurrentOperation(requestId, d)) {
        setLoading(true);
        setError(null);
      }
      try {
        const [entriesRes, summaryRes] = await Promise.all([
          fetch(`/api/nutrition/diary?date=${d}`, { signal: controller.signal }),
          fetch(`/api/nutrition/diary/summary?date=${d}`, { signal: controller.signal }),
        ]);
        const entriesJson = await entriesRes.json();
        const summaryJson = await summaryRes.json();
        if (!entriesRes.ok) throw new Error(entriesJson.error);
        if (!summaryRes.ok) throw new Error(summaryJson.error);
        if (isCurrentOperation(requestId, d)) {
          setEntries(entriesJson.data);
          setSummary(summaryJson.data);
          setError(null);
        }
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        if (isCurrentOperation(requestId, d)) setError(e as Error);
      } finally {
        if (isCurrentOperation(requestId, d)) setLoading(false);
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
    const timeoutId = window.setTimeout(() => void fetchEntries(date), 0);
    return () => {
      window.clearTimeout(timeoutId);
      controllerRef.current?.abort();
      requestIdRef.current += 1;
    };
  }, [date, fetchEntries]);

  const addEntry = useCallback(
    async (entry: Partial<FoodDiaryEntry>) => {
      const mutationDate = date;
      const requestId = beginMutation();
      if (isCurrentOperation(requestId, mutationDate)) setError(null);
      try {
        const res = await fetch('/api/nutrition/diary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...entry, entry_date: mutationDate }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        if (isCurrentOperation(requestId, mutationDate)) await fetchEntries(mutationDate);
        return json.data;
      } catch (e) {
        if (isCurrentOperation(requestId, mutationDate)) setError(e as Error);
        throw e;
      } finally {
        if (isCurrentOperation(requestId, mutationDate)) setLoading(false);
      }
    },
    [beginMutation, date, fetchEntries, isCurrentOperation]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const mutationDate = date;
      const requestId = beginMutation();
      if (isCurrentOperation(requestId, mutationDate)) setError(null);
      try {
        const res = await fetch(`/api/nutrition/diary/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error);
        }
        if (isCurrentOperation(requestId, mutationDate)) await fetchEntries(mutationDate);
      } catch (e) {
        if (isCurrentOperation(requestId, mutationDate)) setError(e as Error);
        throw e;
      } finally {
        if (isCurrentOperation(requestId, mutationDate)) setLoading(false);
      }
    },
    [beginMutation, date, fetchEntries, isCurrentOperation]
  );

  return {
    date,
    setDate: updateDate,
    entries,
    summary,
    loading,
    error,
    addEntry,
    deleteEntry,
    refetch: () => fetchEntries(date),
  };
}
