import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addMealPlanEntry, removeMealPlanEntry } from '@/lib/nutrition/meal-plans';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const entry = await addMealPlanEntry(supabase, {
      meal_plan_id: id,
      user_id: user.id,
      day_of_week: body.day_of_week,
      meal_slot: body.meal_slot,
      recipe_id: body.recipe_id || null,
      custom_entry_name: body.custom_entry_name || null,
      servings: body.servings || 1,
      notes: body.notes || null,
    });

    return NextResponse.json({ data: entry });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { entry_id } = await request.json();
    if (!entry_id) return NextResponse.json({ error: 'entry_id required' }, { status: 400 });

    await removeMealPlanEntry(supabase, entry_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
