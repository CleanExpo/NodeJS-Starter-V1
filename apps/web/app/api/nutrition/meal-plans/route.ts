import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMealPlan, createMealPlan } from '@/lib/nutrition/meal-plans';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const weekStart = request.nextUrl.searchParams.get('week_start');
    if (!weekStart)
      return NextResponse.json({ error: 'week_start parameter required' }, { status: 400 });

    const plan = await getMealPlan(supabase, user.id, weekStart);
    return NextResponse.json({ data: plan });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { week_start_date, name } = await request.json();
    if (!week_start_date)
      return NextResponse.json({ error: 'week_start_date required' }, { status: 400 });

    const plan = await createMealPlan(supabase, user.id, week_start_date, name);
    return NextResponse.json({ data: plan });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
