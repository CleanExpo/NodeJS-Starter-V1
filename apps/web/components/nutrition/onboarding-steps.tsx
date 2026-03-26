'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DIETARY_RESTRICTION_OPTIONS,
  FND_SYMPTOM_OPTIONS,
  HEALTH_GOAL_OPTIONS,
  TRIGGER_FOOD_OPTIONS,
} from '@/types/nutrition';
import { computeProteinTarget } from '@/lib/nutrition/health-profile';
import type { UserHealthProfile } from '@/types/nutrition';

interface OnboardingStepsProps {
  onComplete: (profile: Partial<UserHealthProfile>) => Promise<void>;
}

export function OnboardingSteps({ onComplete }: OnboardingStepsProps) {
  const [step, setStep] = useState(0);
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [sex, setSex] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(['dairy_free']);
  const [fndSymptoms, setFndSymptoms] = useState<string[]>([]);
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [knownTriggers, setKnownTriggers] = useState<string[]>(['dairy']);
  const [submitting, setSubmitting] = useState(false);

  const toggleItem = (list: string[], setter: (v: string[]) => void, item: string) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const proteinTarget = weightKg ? computeProteinTarget(Number(weightKg)) : 0;

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await onComplete({
        weight_kg: weightKg ? Number(weightKg) : null,
        height_cm: heightCm ? Number(heightCm) : null,
        sex: sex || null,
        protein_target_g: proteinTarget || null,
        dietary_restrictions: dietaryRestrictions,
        fnd_symptoms: fndSymptoms,
        health_goals: healthGoals,
        known_triggers: knownTriggers,
        onboarding_completed: true,
      } as Partial<UserHealthProfile>);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: 'About You',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Weight (kg)</label>
              <Input
                type="number"
                placeholder="65"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Height (cm)</label>
              <Input
                type="number"
                placeholder="165"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Sex</label>
            <Select value={sex} onValueChange={setSex}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="non_binary">Non-binary</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {proteinTarget > 0 && (
            <p className="text-muted-foreground text-sm">
              Recommended protein target:{' '}
              <span className="font-semibold">{proteinTarget}g/day</span> (1.6g/kg for neurological
              support)
            </p>
          )}
        </div>
      ),
    },
    {
      title: 'Dietary Restrictions',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Select all that apply. Dairy-free is pre-selected.
          </p>
          <div className="flex flex-wrap gap-2">
            {DIETARY_RESTRICTION_OPTIONS.map((opt) => (
              <Badge
                key={opt.value}
                variant={dietaryRestrictions.includes(opt.value) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleItem(dietaryRestrictions, setDietaryRestrictions, opt.value)}
              >
                {opt.label}
              </Badge>
            ))}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Health Goals</p>
            <div className="flex flex-wrap gap-2">
              {HEALTH_GOAL_OPTIONS.map((opt) => (
                <Badge
                  key={opt.value}
                  variant={healthGoals.includes(opt.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleItem(healthGoals, setHealthGoals, opt.value)}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'FND Symptoms',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Which FND symptoms do you experience? This helps us recommend the most beneficial
            recipes.
          </p>
          <div className="flex flex-wrap gap-2">
            {FND_SYMPTOM_OPTIONS.map((opt) => (
              <Badge
                key={opt.value}
                variant={fndSymptoms.includes(opt.value) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleItem(fndSymptoms, setFndSymptoms, opt.value)}
              >
                {opt.label}
              </Badge>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Trigger Foods',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Which foods tend to trigger or worsen your symptoms? We&apos;ll flag these in recipes.
          </p>
          <div className="flex flex-wrap gap-2">
            {TRIGGER_FOOD_OPTIONS.map((opt) => (
              <Badge
                key={opt.value}
                variant={knownTriggers.includes(opt.value) ? 'destructive' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleItem(knownTriggers, setKnownTriggers, opt.value)}
              >
                {opt.label}
              </Badge>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <div className="mb-2 flex items-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors',
                i <= step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
        <CardTitle>
          Step {step + 1}: {steps[step].title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {steps[step].content}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>Next</Button>
          ) : (
            <Button onClick={handleFinish} loading={submitting} disabled={submitting}>
              Complete Setup
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
