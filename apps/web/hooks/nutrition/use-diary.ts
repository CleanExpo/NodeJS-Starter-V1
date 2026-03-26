'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FoodDiaryEntry, DailyNutritionSummary } from '@/types/nutrition';

export function useDiary(initialDate?: string) {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<FoodDiaryEntry[]>([]);
  const [summary, setSummary] = useState<DailyNutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntries = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const [entriesRes, summaryRes] = await Promise.all([
        fetch(`/api/nutrition/diary?date=${d}`),
        fetch(`/api/nutrition/diary/summary?date=${d}`),
      ]);
      const entriesJson = await entriesRes.json();
      const summaryJson = await summaryRes.json();
      if (!entriesRes.ok) throw new Error(entriesJson.error);
      if (!summaryRes.ok) throw new Error(summaryJson.error);
      setEntries(entriesJson.data);
      setSummary(summaryJson.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries(date);
  }, [date, fetchEntries]);

  const addEntry = useCallback(
    async (entry: Partial<FoodDiaryEntry>) => {
      try {
        const res = await fetch('/api/nutrition/diary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...entry, entry_date: date }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        await fetchEntries(date);
        return json.data;
      } catch (e) {
        setError(e as Error);
        throw e;
      }
    },
    [date, fetchEntries]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/nutrition/diary/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error);
        }
        await fetchEntries(date);
      } catch (e) {
        setError(e as Error);
        throw e;
      }
    },
    [date, fetchEntries]
  );

  return {
    date,
    setDate,
    entries,
    summary,
    loading,
    error,
    addEntry,
    deleteEntry,
    refetch: () => fetchEntries(date),
  };
}
