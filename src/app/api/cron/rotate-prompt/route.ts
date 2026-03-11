import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getTodayUTC } from '@/lib/utils/dates'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = getTodayUTC()

  // Check if today already has a prompt
  const { data: existing } = await supabase
    .from('prompts')
    .select('id')
    .eq('prompt_date', today)
    .single()

  if (existing) {
    return NextResponse.json({ message: 'Already assigned', id: existing.id })
  }

  // Pick random unscheduled prompt
  const { data: unscheduled } = await supabase
    .from('prompts')
    .select('id')
    .is('prompt_date', null)
    .limit(1)

  if (!unscheduled || unscheduled.length === 0) {
    return NextResponse.json({ error: 'No unscheduled prompts' }, { status: 404 })
  }

  const { error } = await supabase
    .from('prompts')
    .update({ prompt_date: today })
    .eq('id', unscheduled[0].id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Prompt assigned', id: unscheduled[0].id })
}
