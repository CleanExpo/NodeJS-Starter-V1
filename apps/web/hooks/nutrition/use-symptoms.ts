'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SymptomLog } from '@/types/nutrition';

export function useSymptoms(initialDate?: string) {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/nutrition/symptoms?date=${d}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setLogs(json.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(date);
  }, [date, fetchLogs]);

  const addLog = useCallback(
    async (log: Partial<SymptomLog>) => {
      try {
        const res = await fetch('/api/nutrition/symptoms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...log, symptom_date: date }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        await fetchLogs(date);
        return json.data;
      } catch (e) {
        setError(e as Error);
        throw e;
      }
    },
    [date, fetchLogs]
  );

  const deleteLog = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/nutrition/symptoms/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error);
        }
        await fetchLogs(date);
      } catch (e) {
        setError(e as Error);
        throw e;
      }
    },
    [date, fetchLogs]
  );

  return {
    date,
    setDate,
    logs,
    loading,
    error,
    addLog,
    deleteLog,
    refetch: () => fetchLogs(date),
  };
}
