import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSymptomCorrelations } from '@/lib/nutrition/symptoms';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const days = Number(request.nextUrl.searchParams.get('days')) || 30;
    const correlations = await getSymptomCorrelations(supabase, user.id, days);
    return NextResponse.json({ data: correlations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
