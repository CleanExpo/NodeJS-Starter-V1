'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SymptomLog } from '@/types/nutrition';

export function useSymptoms(initialDate?: string) {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState<SymptomLog[]>([]);
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

  const updateDate = useCallback((nextDate: string) => {
    dateRef.current = nextDate;
    setDate(nextDate);
  }, []);

  const fetchLogs = useCallback(
    async (d: string) => {
      if (!mountedRef.current || d !== dateRef.current) return;
      const { controller, requestId } = beginOperation();
      if (isCurrentOperation(requestId, d)) {
        setLoading(true);
        setError(null);
      }
      try {
        const res = await fetch(`/api/nutrition/symptoms?date=${d}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        if (isCurrentOperation(requestId, d)) {
          setLogs(json.data);
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
    const timeoutId = window.setTimeout(() => void fetchLogs(date), 0);
    return () => {
      window.clearTimeout(timeoutId);
      controllerRef.current?.abort();
      requestIdRef.current += 1;
    };
  }, [date, fetchLogs]);

  const addLog = useCallback(
    async (log: Partial<SymptomLog>) => {
      const mutationDate = date;
      const { controller, requestId } = beginOperation();
      if (isCurrentOperation(requestId, mutationDate)) setError(null);
      try {
        const res = await fetch('/api/nutrition/symptoms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...log, symptom_date: mutationDate }),
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        if (isCurrentOperation(requestId, mutationDate)) await fetchLogs(mutationDate);
        return json.data;
      } catch (e) {
        if (isCurrentOperation(requestId, mutationDate)) setError(e as Error);
        throw e;
      } finally {
        if (isCurrentOperation(requestId, mutationDate)) setLoading(false);
      }
    },
    [beginOperation, date, fetchLogs, isCurrentOperation]
  );

  const deleteLog = useCallback(
    async (id: string) => {
      const mutationDate = date;
      const { controller, requestId } = beginOperation();
      if (isCurrentOperation(requestId, mutationDate)) setError(null);
      try {
        const res = await fetch(`/api/nutrition/symptoms/${id}`, {
          method: 'DELETE',
          signal: controller.signal,
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error);
        }
        if (isCurrentOperation(requestId, mutationDate)) await fetchLogs(mutationDate);
      } catch (e) {
        if (isCurrentOperation(requestId, mutationDate)) setError(e as Error);
        throw e;
      } finally {
        if (isCurrentOperation(requestId, mutationDate)) setLoading(false);
      }
    },
    [beginOperation, date, fetchLogs, isCurrentOperation]
  );

  return {
    date,
    setDate: updateDate,
    logs,
    loading,
    error,
    addLog,
    deleteLog,
    refetch: () => fetchLogs(date),
  };
}
