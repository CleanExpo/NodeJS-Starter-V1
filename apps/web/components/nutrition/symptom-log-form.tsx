'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SYMPTOM_TYPE_LABELS } from '@/types/nutrition';
import type { SymptomType } from '@/types/nutrition';

interface SymptomLogFormProps {
  onSubmit: (log: {
    symptom_type: SymptomType;
    symptom_name: string;
    severity: number;
    energy_level?: number;
    duration_minutes?: number;
    food_related?: boolean;
    notes?: string;
  }) => Promise<void>;
}

export function SymptomLogForm({ onSubmit }: SymptomLogFormProps) {
  const [symptomType, setSymptomType] = useState<SymptomType>('fatigue');
  const [symptomName, setSymptomName] = useState('');
  const [severity, setSeverity] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [foodRelated, setFoodRelated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!symptomName) return;
    setSubmitting(true);
    try {
      await onSubmit({
        symptom_type: symptomType,
        symptom_name: symptomName,
        severity,
        energy_level: energyLevel,
        food_related: foodRelated,
      });
      setSymptomName('');
      setSeverity(5);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="grid grid-cols-2 gap-3">
        <Select value={symptomType} onValueChange={(v) => setSymptomType(v as SymptomType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SYMPTOM_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Symptom name (e.g. brain fog)"
          value={symptomName}
          onChange={(e) => setSymptomName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">Severity (1-10)</label>
          <Input
            type="number"
            min={1}
            max={10}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">Energy (1-5)</label>
          <Input
            type="number"
            min={1}
            max={5}
            value={energyLevel}
            onChange={(e) => setEnergyLevel(Number(e.target.value))}
          />
        </div>
        <div className="flex items-end">
          <Button
            variant={foodRelated ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFoodRelated(!foodRelated)}
            className="w-full"
          >
            {foodRelated ? 'Food Related' : 'Not Food Related'}
          </Button>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={submitting || !symptomName}
        loading={submitting}
        className="w-full"
      >
        Log Symptom
      </Button>
    </div>
  );
}
