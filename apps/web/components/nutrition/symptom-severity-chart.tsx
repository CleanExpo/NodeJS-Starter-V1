'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SymptomLog } from '@/types/nutrition';

interface SymptomSeverityChartProps {
  days?: number;
}

const TYPE_COLORS: Record<string, string> = {
  motor: '#ef4444',
  fatigue: '#f59e0b',
  cognitive: '#3b82f6',
  sensory: '#8b5cf6',
  mood: '#ec4899',
  pain: '#f97316',
  seizure: '#dc2626',
  speech: '#06b6d4',
  other: '#6b7280',
};

export function SymptomSeverityChart({ days = 14 }: SymptomSeverityChartProps) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    fetch(`/api/nutrition/symptoms?start_date=${startDate}&end_date=${endDate}`)
      .then((r) => r.json())
      .then((json) => {
        const logs: SymptomLog[] = json.data || [];
        const uniqueTypes = [...new Set(logs.map((l) => l.symptom_type))];
        setTypes(uniqueTypes);

        const byDate = new Map<string, Record<string, number[]>>();
        for (const log of logs) {
          if (!byDate.has(log.symptom_date)) byDate.set(log.symptom_date, {});
          const dateGroup = byDate.get(log.symptom_date)!;
          if (!dateGroup[log.symptom_type]) dateGroup[log.symptom_type] = [];
          dateGroup[log.symptom_type].push(log.severity);
        }

        const chartData = Array.from(byDate.entries())
          .sort()
          .map(([date, typeData]) => {
            const point: Record<string, unknown> = {
              date: date.slice(5), // MM-DD
            };
            for (const type of uniqueTypes) {
              const vals = typeData[type];
              point[type] = vals
                ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
                : null;
            }
            return point;
          });

        setData(chartData);
      });
  }, [days]);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle as="h3" className="text-lg">
          Symptom Severity ({days} days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend />
              {types.map((type) => (
                <Line
                  key={type}
                  type="monotone"
                  dataKey={type}
                  stroke={TYPE_COLORS[type] || '#6b7280'}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
