import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateShoppingList } from '@/lib/nutrition/shopping-list';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { meal_plan_id } = await request.json();
    if (!meal_plan_id)
      return NextResponse.json({ error: 'meal_plan_id required' }, { status: 400 });

    const list = await generateShoppingList(supabase, meal_plan_id);
    return NextResponse.json({ data: list });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
