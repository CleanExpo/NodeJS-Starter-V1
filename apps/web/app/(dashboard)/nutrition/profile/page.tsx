'use client';

import { useRouter } from 'next/navigation';
import { useHealthProfile } from '@/hooks/nutrition/use-health-profile';
import { OnboardingSteps } from '@/components/nutrition/onboarding-steps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import type { UserHealthProfile, NutrientGoalProgress } from '@/types/nutrition';
import {
  DIETARY_RESTRICTION_OPTIONS,
  FND_SYMPTOM_OPTIONS,
  TRIGGER_FOOD_OPTIONS,
} from '@/types/nutrition';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, updateProfile } = useHealthProfile();
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState<Partial<UserHealthProfile>>({});

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!profile?.onboarding_completed) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Set Up Your Profile</h1>
          <p className="text-muted-foreground mt-1">
            Let&apos;s personalise your nutrition plan for FND.
          </p>
        </div>
        <OnboardingSteps
          onComplete={async (data) => {
            await updateProfile(data);
            router.push('/nutrition');
          }}
        />
      </div>
    );
  }

  const nutrientTargets: NutrientGoalProgress[] = [
    {
      nutrient: 'protein',
      label: 'Protein Target',
      current: 0,
      target: profile.protein_target_g || 100,
      unit: 'g/day',
      percentage: 0,
    },
    {
      nutrient: 'magnesium',
      label: 'Magnesium Target',
      current: 0,
      target: profile.magnesium_target_mg,
      unit: 'mg/day',
      percentage: 0,
    },
    {
      nutrient: 'vitamin_d',
      label: 'Vitamin D Target',
      current: 0,
      target: profile.vitamin_d_target_iu,
      unit: 'IU/day',
      percentage: 0,
    },
    {
      nutrient: 'calcium',
      label: 'Calcium Target',
      current: 0,
      target: profile.calcium_target_mg,
      unit: 'mg/day',
      percentage: 0,
    },
    {
      nutrient: 'omega3',
      label: 'Omega-3 Target',
      current: 0,
      target: profile.omega3_target_g,
      unit: 'g/day',
      percentage: 0,
    },
    {
      nutrient: 'b12',
      label: 'B12 Target',
      current: 0,
      target: profile.b12_target_mcg,
      unit: 'mcg/day',
      percentage: 0,
    },
  ];

  const handleSave = async () => {
    await updateProfile(editValues);
    setEditing(false);
    setEditValues({});
  };

  const getLabelForValue = (options: { value: string; label: string }[], value: string) =>
    options.find((o) => o.value === value)?.label || value;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Health Profile</h1>
          <p className="text-muted-foreground mt-1">Your personalised FND nutrition targets.</p>
        </div>
        {!editing ? (
          <Button variant="outline" onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditing(false);
                setEditValues({});
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle as="h3">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Weight (kg)</label>
                  <Input
                    type="number"
                    defaultValue={profile.weight_kg || ''}
                    onChange={(e) =>
                      setEditValues((v) => ({
                        ...v,
                        weight_kg: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Height (cm)</label>
                  <Input
                    type="number"
                    defaultValue={profile.height_cm || ''}
                    onChange={(e) =>
                      setEditValues((v) => ({
                        ...v,
                        height_cm: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weight</span>
                  <span>{profile.weight_kg ? `${profile.weight_kg} kg` : 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Height</span>
                  <span>{profile.height_cm ? `${profile.height_cm} cm` : 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sex</span>
                  <span className="capitalize">{profile.sex?.replace('_', ' ') || 'Not set'}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h3">Nutrient Targets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nutrientTargets.map((t) => (
              <div key={t.nutrient} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.label}</span>
                <span className="font-medium">
                  {t.target} {t.unit}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h3">Dietary & Symptoms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Dietary Restrictions</p>
              <div className="flex flex-wrap gap-1">
                {profile.dietary_restrictions.map((r) => (
                  <Badge key={r} variant="secondary">
                    {getLabelForValue(DIETARY_RESTRICTION_OPTIONS, r)}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">FND Symptoms</p>
              <div className="flex flex-wrap gap-1">
                {profile.fnd_symptoms.map((s) => (
                  <Badge key={s} variant="secondary">
                    {getLabelForValue(FND_SYMPTOM_OPTIONS, s)}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Known Triggers</p>
              <div className="flex flex-wrap gap-1">
                {profile.known_triggers.map((t) => (
                  <Badge key={t} variant="destructive">
                    {getLabelForValue(TRIGGER_FOOD_OPTIONS, t)}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
