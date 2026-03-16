'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import type { RecipeFilters } from '@/types/nutrition';

interface RecipeFilterPanelProps {
  filters: RecipeFilters;
  onUpdate: (filters: Partial<RecipeFilters>) => void;
  onClear: () => void;
}

export function RecipeFilterPanel({ filters, onUpdate, onClear }: RecipeFilterPanelProps) {
  const hasFilters =
    filters.meal_type ||
    filters.max_time ||
    filters.min_protein ||
    filters.difficulty ||
    filters.search;

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search recipes..."
        value={filters.search || ''}
        onChange={(e) => onUpdate({ search: e.target.value || undefined })}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Select
          value={filters.meal_type || 'all'}
          onValueChange={(v) =>
            onUpdate({
              meal_type: v === 'all' ? undefined : (v as RecipeFilters['meal_type']),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Meal type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All meals</SelectItem>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
            <SelectItem value="dessert">Dessert</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.max_time ? String(filters.max_time) : 'any'}
          onValueChange={(v) => onUpdate({ max_time: v === 'any' ? undefined : Number(v) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Max time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any time</SelectItem>
            <SelectItem value="10">10 min or less</SelectItem>
            <SelectItem value="20">20 min or less</SelectItem>
            <SelectItem value="30">30 min or less</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.min_protein ? String(filters.min_protein) : 'any'}
          onValueChange={(v) => onUpdate({ min_protein: v === 'any' ? undefined : Number(v) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Min protein" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any protein</SelectItem>
            <SelectItem value="15">15g+</SelectItem>
            <SelectItem value="20">20g+</SelectItem>
            <SelectItem value="25">25g+</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.difficulty || 'any'}
          onValueChange={(v) =>
            onUpdate({
              difficulty: v === 'any' ? undefined : (v as RecipeFilters['difficulty']),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any difficulty</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="mr-1 h-3 w-3" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
