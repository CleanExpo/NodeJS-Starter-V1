'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailyNutritionSummary } from '@/types/nutrition';

interface DiaryDaySummaryProps {
  summary: DailyNutritionSummary | null;
}

export function DiaryDaySummary({ summary }: DiaryDaySummaryProps) {
  if (!summary || summary.entry_count === 0) {
    return null;
  }

  const macroData = [
    {
      name: 'Protein',
      value: Math.round(summary.total_protein_g),
      color: '#3b82f6',
    },
    {
      name: 'Carbs',
      value: Math.round(summary.total_carbs_g),
      color: '#f59e0b',
    },
    { name: 'Fat', value: Math.round(summary.total_fat_g), color: '#ef4444' },
    {
      name: 'Fibre',
      value: Math.round(summary.total_fiber_g),
      color: '#22c55e',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle as="h3" className="text-lg">
          Daily Summary
        </CardTitle>
        <p className="text-2xl font-bold">{Math.round(summary.total_calories)} kcal</p>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={macroData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`${value}g`, '']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {macroData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
