'use client';

import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDiary } from '@/hooks/nutrition/use-diary';
import { useSymptoms } from '@/hooks/nutrition/use-symptoms';
import { DiaryEntryForm } from '@/components/nutrition/diary-entry-form';
import { DiaryEntryList } from '@/components/nutrition/diary-entry-list';
import { DiaryDaySummary } from '@/components/nutrition/diary-day-summary';
import { SymptomLogForm } from '@/components/nutrition/symptom-log-form';
import { SymptomLogList } from '@/components/nutrition/symptom-log-list';
import { SymptomSeverityChart } from '@/components/nutrition/symptom-severity-chart';
import { SymptomFoodCorrelation } from '@/components/nutrition/symptom-food-correlation';
import { Skeleton } from '@/components/ui/skeleton';

export default function DiaryPage() {
  const {
    date,
    setDate,
    entries,
    summary,
    loading: diaryLoading,
    addEntry,
    deleteEntry,
  } = useDiary();

  const { logs, loading: symptomsLoading, addLog, deleteLog } = useSymptoms(date);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Diary</h1>
          <p className="text-muted-foreground mt-1">Track your meals and FND symptoms together.</p>
        </div>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-auto"
        />
      </div>

      <Tabs defaultValue="food">
        <TabsList>
          <TabsTrigger value="food">Food ({entries.length})</TabsTrigger>
          <TabsTrigger value="symptoms">Symptoms ({logs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="food" className="mt-4 space-y-4">
          <DiaryEntryForm onSubmit={addEntry} />

          {diaryLoading ? (
            <Skeleton className="h-48 rounded-xl" />
          ) : (
            <>
              <DiaryEntryList entries={entries} onDelete={deleteEntry} />
              <DiaryDaySummary summary={summary} />
            </>
          )}
        </TabsContent>

        <TabsContent value="symptoms" className="mt-4 space-y-4">
          <SymptomLogForm onSubmit={addLog} />

          {symptomsLoading ? (
            <Skeleton className="h-48 rounded-xl" />
          ) : (
            <SymptomLogList logs={logs} onDelete={deleteLog} />
          )}

          <SymptomSeverityChart />
          <SymptomFoodCorrelation />
        </TabsContent>
      </Tabs>
    </div>
  );
}
