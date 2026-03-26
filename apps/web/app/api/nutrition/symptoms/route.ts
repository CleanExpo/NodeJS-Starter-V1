import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSymptomLogs, getSymptomLogsByDate, createSymptomLog } from '@/lib/nutrition/symptoms';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = request.nextUrl.searchParams;
    const date = params.get('date');

    if (date) {
      const logs = await getSymptomLogsByDate(supabase, user.id, date);
      return NextResponse.json({ data: logs });
    }

    const startDate =
      params.get('start_date') || new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
    const endDate = params.get('end_date') || new Date().toISOString().split('T')[0];

    const logs = await getSymptomLogs(supabase, user.id, startDate, endDate);
    return NextResponse.json({ data: logs });
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
    const log = await createSymptomLog(supabase, {
      user_id: user.id,
      symptom_date: body.symptom_date || new Date().toISOString().split('T')[0],
      symptom_time: body.symptom_time || null,
      symptom_type: body.symptom_type,
      symptom_name: body.symptom_name,
      severity: body.severity,
      duration_minutes: body.duration_minutes || null,
      potential_triggers: body.potential_triggers || [],
      food_related: body.food_related || false,
      notes: body.notes || null,
      energy_level: body.energy_level || null,
    });

    return NextResponse.json({ data: log });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
