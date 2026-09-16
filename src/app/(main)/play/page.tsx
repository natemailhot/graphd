import { createClient } from '@/lib/supabase/server'
import { getPromptByDate } from '@/lib/api/prompts'
import { getYesterdayUTC } from '@/lib/utils/dates'
import { redirect } from 'next/navigation'
import { UnifiedPlayClient } from './UnifiedPlayClient'

export default async function UnifiedPlayPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { edit } = await searchParams
  const yesterdaysPrompt = await getPromptByDate(supabase, getYesterdayUTC()).catch(() => null)

  return (
    <UnifiedPlayClient
      currentUserId={user.id}
      editMode={edit === '1'}
      yesterdaysPrompt={yesterdaysPrompt ? { x: yesterdaysPrompt.x_axis_label, y: yesterdaysPrompt.y_axis_label } : null}
    />
  )
}
