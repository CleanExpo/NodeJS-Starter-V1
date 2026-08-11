'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SymptomLog } from '@/types/nutrition';

export function useSymptoms(initialDate?: string) {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchLogs = useCallback(async (d: string) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/nutrition/symptoms?date=${d}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (requestId === requestIdRef.current) setLogs(json.data);
    } catch (e) {
      if (requestId === requestIdRef.current) setError(e as Error);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchLogs(date), 0);
    return () => {
      window.clearTimeout(timeoutId);
      requestIdRef.current += 1;
    };
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
