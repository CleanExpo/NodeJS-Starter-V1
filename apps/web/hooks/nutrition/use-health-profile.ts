'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserHealthProfile } from '@/types/nutrition';

export function useHealthProfile() {
  const [profile, setProfile] = useState<UserHealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nutrition/profile');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setProfile(json.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
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
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
