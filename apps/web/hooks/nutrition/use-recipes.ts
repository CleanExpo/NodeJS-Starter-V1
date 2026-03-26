'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Recipe, RecipeFilters } from '@/types/nutrition';

export function useRecipes(initialFilters?: RecipeFilters) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filters, setFilters] = useState<RecipeFilters>(initialFilters || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecipes = useCallback(async (f: RecipeFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.meal_type) params.set('meal_type', f.meal_type);
      if (f.max_time) params.set('max_time', String(f.max_time));
      if (f.min_protein) params.set('min_protein', String(f.min_protein));
      if (f.difficulty) params.set('difficulty', f.difficulty);
      if (f.search) params.set('search', f.search);
      if (f.dietary_tags?.length) params.set('dietary_tags', f.dietary_tags.join(','));
      if (f.trigger_free?.length) params.set('trigger_free', f.trigger_free.join(','));

      const res = await fetch(`/api/nutrition/recipes?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setRecipes(json.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes(filters);
  }, [filters, fetchRecipes]);

  const updateFilters = useCallback((newFilters: Partial<RecipeFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return { recipes, filters, loading, error, updateFilters, clearFilters };
}
