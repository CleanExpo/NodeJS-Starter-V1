import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRecipeById } from '@/lib/nutrition/recipes';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const recipe = await getRecipeById(supabase, id);
    if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

    return NextResponse.json({ data: recipe });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
