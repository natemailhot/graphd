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

  // "Midnight" closes out the prompt for the day that just ended.
  const today = new Date(getTodayUTC() + 'T00:00:00Z')
  const yesterday = new Date(today)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  const { data: prompt } = await supabase
    .from('prompts')
    .select('id')
    .eq('prompt_date', yesterdayStr)
    .maybeSingle()

  if (!prompt) {
    return NextResponse.json({ message: 'No prompt for yesterday', date: yesterdayStr })
  }

  const { data: placedGroups, error: placementsError } = await supabase
    .from('placements')
    .select('group_id')
    .eq('prompt_id', prompt.id)
  if (placementsError) {
    return NextResponse.json({ error: placementsError.message }, { status: 500 })
  }
  const groupIds = Array.from(new Set((placedGroups ?? []).map(p => p.group_id)))
  if (groupIds.length === 0) {
    return NextResponse.json({ message: 'No placements to publish', date: yesterdayStr })
  }

  const { data: alreadyPublished, error: publishedError } = await supabase
    .from('result_publications')
    .select('group_id')
    .eq('prompt_id', prompt.id)
    .in('group_id', groupIds)
  if (publishedError) {
    return NextResponse.json({ error: publishedError.message }, { status: 500 })
  }
  const publishedSet = new Set((alreadyPublished ?? []).map(p => p.group_id))
  const unpublishedGroupIds = groupIds.filter(id => !publishedSet.has(id))
  if (unpublishedGroupIds.length === 0) {
    return NextResponse.json({ message: 'Already published', date: yesterdayStr })
  }

  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('id, created_by')
    .in('id', unpublishedGroupIds)
  if (groupsError) {
    return NextResponse.json({ error: groupsError.message }, { status: 500 })
  }

  const rows = (groups ?? []).map(g => ({
    group_id: g.id,
    prompt_id: prompt.id,
    published_by: g.created_by,
  }))

  const { error: upsertError } = await supabase
    .from('result_publications')
    .upsert(rows, { onConflict: 'group_id,prompt_id' })
  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Published', date: yesterdayStr, groups: rows.length })
}
