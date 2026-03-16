import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getHealthProfile } from '@/lib/nutrition/health-profile';
import { getDailySummary } from '@/lib/nutrition/diary';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, CalendarDays, ClipboardList, User, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Nutrition | FND Health',
  description: 'FND nutrition tracking, recipes, and meal planning',
};

export default async function NutritionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const profile = await getHealthProfile(supabase, user.id);

  if (!profile?.onboarding_completed) {
    redirect('/nutrition/profile');
  }

  const today = new Date().toISOString().split('T')[0];
  const todaySummary = await getDailySummary(supabase, user.id, today);

  const quickActions = [
    {
      title: 'Recipes',
      description: 'Browse 27 FND-friendly recipes',
      href: '/nutrition/recipes',
      icon: BookOpen,
    },
    {
      title: 'Meal Plan',
      description: 'Plan your weekly meals',
      href: '/nutrition/meal-plan',
      icon: CalendarDays,
    },
    {
      title: 'Diary',
      description: 'Log food and symptoms',
      href: '/nutrition/diary',
      icon: ClipboardList,
    },
    {
      title: 'Health Profile',
      description: 'Update your targets',
      href: '/nutrition/profile',
      icon: User,
    },
  ];

  const nutrients = [
    {
      label: 'Protein',
      current: todaySummary.total_protein_g,
      target: profile.protein_target_g || 100,
      unit: 'g',
    },
    {
      label: 'Magnesium',
      current: todaySummary.total_magnesium_mg,
      target: profile.magnesium_target_mg,
      unit: 'mg',
    },
    {
      label: 'Calcium',
      current: todaySummary.total_calcium_mg,
      target: profile.calcium_target_mg,
      unit: 'mg',
    },
    {
      label: 'Omega-3',
      current: todaySummary.total_omega3_g,
      target: profile.omega3_target_g,
      unit: 'g',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nutrition</h1>
        <p className="text-muted-foreground mt-1">
          Your FND nutrition hub - track food, symptoms, and nutrient targets.
        </p>
      </div>

      {/* Today's nutrient summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {nutrients.map((n) => {
          const pct = Math.min(100, Math.round((n.current / n.target) * 100));
          return (
            <Card key={n.label}>
              <CardContent className="p-4">
                <p className="text-muted-foreground text-sm font-medium">{n.label}</p>
                <p className="mt-1 text-2xl font-bold">
                  {Math.round(n.current)}
                  <span className="text-muted-foreground text-sm font-normal">
                    /{n.target}
                    {n.unit}
                  </span>
                </p>
                <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's calorie count */}
      {todaySummary.entry_count > 0 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-sm">
                Today: {todaySummary.entry_count} meals logged
              </p>
              <p className="text-xl font-bold">{Math.round(todaySummary.total_calories)} kcal</p>
            </div>
            <Link href="/nutrition/diary">
              <Button variant="outline" size="sm">
                View Diary
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card variant="interactive" className="h-full">
              <CardHeader className="pb-2">
                <action.icon className="text-primary mb-1 h-5 w-5" />
                <CardTitle as="h3" className="text-base">
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription>{action.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
