import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDiaryEntries, createDiaryEntry } from '@/lib/nutrition/diary';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const date = request.nextUrl.searchParams.get('date') || new Date().toISOString().split('T')[0];

    const entries = await getDiaryEntries(supabase, user.id, date);
    return NextResponse.json({ data: entries });
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

    const body = await request.json();
    const entry = await createDiaryEntry(supabase, {
      user_id: user.id,
      entry_date: body.entry_date || new Date().toISOString().split('T')[0],
      meal_slot: body.meal_slot,
      recipe_id: body.recipe_id || null,
      custom_food_name: body.custom_food_name || null,
      servings_consumed: body.servings_consumed || 1,
      calories: body.calories || null,
      protein_g: body.protein_g || null,
      carbs_g: body.carbs_g || null,
      fat_g: body.fat_g || null,
      fiber_g: body.fiber_g || null,
      magnesium_mg: body.magnesium_mg || null,
      vitamin_d_iu: body.vitamin_d_iu || null,
      calcium_mg: body.calcium_mg || null,
      omega3_g: body.omega3_g || null,
      b12_mcg: body.b12_mcg || null,
      contains_triggers: body.contains_triggers || false,
      trigger_notes: body.trigger_notes || null,
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
