import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDailySummary, getWeeklySummary } from '@/lib/nutrition/diary';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = request.nextUrl.searchParams;
    const date = params.get('date');
    const startDate = params.get('start_date');
    const endDate = params.get('end_date');

    if (startDate && endDate) {
      const summary = await getWeeklySummary(supabase, user.id, startDate, endDate);
      return NextResponse.json({ data: summary });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    const summary = await getDailySummary(supabase, user.id, targetDate);
    return NextResponse.json({ data: summary });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
