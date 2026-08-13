'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Recipe, RecipeFilters } from '@/types/nutrition';

export function useRecipes(initialFilters?: RecipeFilters) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filters, setFilters] = useState<RecipeFilters>(initialFilters || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchRecipes = useCallback(async (f: RecipeFilters) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (f.meal_type) params.set('meal_type', f.meal_type);
      if (f.max_time) params.set('max_time', String(f.max_time));
      if (f.min_protein) params.set('min_protein', String(f.min_protein));
      if (f.difficulty) params.set('difficulty', f.difficulty);
      if (f.search) params.set('search', f.search);
      if (f.dietary_tags?.length) params.set('dietary_tags', f.dietary_tags.join(','));
      if (f.trigger_free?.length) params.set('trigger_free', f.trigger_free.join(','));

      const res = await fetch(`/api/nutrition/recipes?${params}`, { signal: controller.signal });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (requestId === requestIdRef.current) {
        setRecipes(json.data);
        setError(null);
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      if (requestId === requestIdRef.current) setError(e as Error);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchRecipes(filters), 0);
    return () => {
      window.clearTimeout(timeoutId);
      controllerRef.current?.abort();
      requestIdRef.current += 1;
    };
  }, [filters, fetchRecipes]);

  const updateFilters = useCallback((newFilters: Partial<RecipeFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return { recipes, filters, loading, error, updateFilters, clearFilters };
}
