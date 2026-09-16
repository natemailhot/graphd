import { createClient } from '@/lib/supabase/server'
import { getPromptByDate } from '@/lib/api/prompts'
import { getUserGroups } from '@/lib/api/groups'
import { getYesterdayUTC, formatDate } from '@/lib/utils/dates'
import { redirect } from 'next/navigation'
import { UnifiedResultsClient } from './UnifiedResultsClient'

export default async function UnifiedResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { date } = await searchParams
  const targetDate = date ?? getYesterdayUTC()

  const [groups, prompt] = await Promise.all([
    getUserGroups(supabase, user.id).catch(() => []),
    getPromptByDate(supabase, targetDate).catch(() => null),
  ])

  if (groups.length === 0) {
    return (
      <div className="card rounded-2xl p-8 text-center">
        <p className="text-gray-400 font-bold">Join or create a group to see results.</p>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="card rounded-2xl p-8 text-center">
        <p className="text-gray-400 font-bold">No prompt found for {formatDate(targetDate)}.</p>
      </div>
    )
  }

  return (
    <UnifiedResultsClient
      groups={groups.map(g => ({ id: g.id, name: g.name, created_by: g.created_by }))}
      prompt={prompt}
      currentUserId={user.id}
      date={targetDate}
    />
  )
}
