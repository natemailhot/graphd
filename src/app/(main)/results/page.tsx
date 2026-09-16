import { createClient } from '@/lib/supabase/server'
import { getPromptByDate, getPastPrompts, getTodayPrompt } from '@/lib/api/prompts'
import { getUserGroups } from '@/lib/api/groups'
import { getYesterdayUTC, getTomorrowUTC, formatDate } from '@/lib/utils/dates'
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

  const [groups, prompt, pastPrompts, todayPrompt, tomorrowPrompt] = await Promise.all([
    getUserGroups(supabase, user.id).catch(() => []),
    getPromptByDate(supabase, targetDate).catch(() => null),
    getPastPrompts(supabase, 60).catch(() => []),
    getTodayPrompt(supabase).catch(() => null),
    getPromptByDate(supabase, getTomorrowUTC()).catch(() => null),
  ])

  if (groups.length === 0) {
    return (
      <div className="card rounded-2xl p-8 text-center">
        <p className="text-gray-400 font-bold">Join or create a group to see results.</p>
      </div>
    )
  }

  const availableDates = pastPrompts
    .map(p => p.prompt_date)
    .filter((d): d is string => !!d)

  if (!prompt) {
    return (
      <div className="card rounded-2xl p-8 text-center space-y-3">
        <p className="text-gray-400 font-bold">No prompt found for {formatDate(targetDate)}.</p>
        {availableDates.length > 0 && (
          <a href={`/results?date=${availableDates[0]}`} className="inline-block text-sm font-bold text-violet-400 hover:text-violet-500 transition-colors">
            Go to most recent results
          </a>
        )}
      </div>
    )
  }

  return (
    <UnifiedResultsClient
      groups={groups.map(g => ({ id: g.id, name: g.name, created_by: g.created_by }))}
      prompt={prompt}
      currentUserId={user.id}
      date={targetDate}
      availableDates={availableDates}
      todaysPrompt={todayPrompt ? { x: todayPrompt.x_axis_label, y: todayPrompt.y_axis_label } : null}
      tomorrowsPromptTeaser={tomorrowPrompt ? tomorrowPrompt.x_axis_label : null}
    />
  )
}
