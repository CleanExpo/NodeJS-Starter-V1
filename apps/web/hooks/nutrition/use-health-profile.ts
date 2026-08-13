'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserHealthProfile } from '@/types/nutrition';

export function useHealthProfile() {
  const [profile, setProfile] = useState<UserHealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);

  const isCurrentOperation = useCallback(
    (requestId: number) => mountedRef.current && requestId === requestIdRef.current,
    []
  );

  const beginOperation = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return { controller, requestId: ++requestIdRef.current };
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!mountedRef.current) return;
    const { controller, requestId } = beginOperation();
    if (isCurrentOperation(requestId)) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await fetch('/api/nutrition/profile', { signal: controller.signal });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (isCurrentOperation(requestId)) {
        setProfile(json.data);
        setError(null);
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      if (isCurrentOperation(requestId)) setError(e as Error);
    } finally {
      if (isCurrentOperation(requestId)) setLoading(false);
    }
  }, [beginOperation, isCurrentOperation]);

  const updateProfile = useCallback(
    async (updates: Partial<UserHealthProfile>) => {
      const { controller, requestId } = beginOperation();
      if (isCurrentOperation(requestId)) setError(null);
      try {
        const res = await fetch('/api/nutrition/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        if (isCurrentOperation(requestId)) {
          setProfile(json.data);
          setError(null);
        }
        return json.data;
      } catch (e) {
        if (isCurrentOperation(requestId)) setError(e as Error);
        throw e;
      } finally {
        if (isCurrentOperation(requestId)) setLoading(false);
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
    const timeoutId = window.setTimeout(() => void fetchProfile(), 0);
    return () => {
      window.clearTimeout(timeoutId);
      controllerRef.current?.abort();
      requestIdRef.current += 1;
    };
  }, [fetchProfile]);

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
