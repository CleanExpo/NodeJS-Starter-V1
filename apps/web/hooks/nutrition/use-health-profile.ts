'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserHealthProfile } from '@/types/nutrition';

export function useHealthProfile() {
  const [profile, setProfile] = useState<UserHealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchProfile = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res = await fetch('/api/nutrition/profile');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (requestId === requestIdRef.current) setProfile(json.data);
    } catch (e) {
      if (requestId === requestIdRef.current) setError(e as Error);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserHealthProfile>) => {
    try {
      const res = await fetch('/api/nutrition/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setProfile(json.data);
      return json.data;
    } catch (e) {
      setError(e as Error);
      throw e;
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchProfile(), 0);
    return () => {
      window.clearTimeout(timeoutId);
      requestIdRef.current += 1;
    };
  }, [fetchProfile]);

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
