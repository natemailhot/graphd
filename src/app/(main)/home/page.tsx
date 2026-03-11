import { createClient } from '@/lib/supabase/server'
import { getTodayPrompt } from '@/lib/api/prompts'
import { getUserGroups } from '@/lib/api/groups'
import { getSubmissionStatus } from '@/lib/api/placements'
import { redirect } from 'next/navigation'
import { HomeClient } from './HomeClient'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [prompt, groups] = await Promise.all([
    getTodayPrompt(supabase).catch(() => null),
    getUserGroups(supabase, user.id).catch(() => []),
  ])

  // Fetch submission status for each group
  const groupStatuses = await Promise.all(
    groups.map(async (group) => {
      if (!prompt) return { groupId: group.id, userSubmitted: false, allSubmitted: false }
      const statuses = await getSubmissionStatus(supabase, group.id, prompt.id).catch(() => [])
      const userSubmitted = statuses.some(s => s.user_id === user.id && s.has_submitted)
      const allSubmitted = statuses.length > 0 && statuses.every(s => s.has_submitted)
      return { groupId: group.id, userSubmitted, allSubmitted }
    })
  )
  const statusMap = new Map(groupStatuses.map(s => [s.groupId, s]))

  return (
    <div className="space-y-8">
      {prompt ? (
        <div className="card p-6 text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-rose-50 text-rose-400 border-2 border-rose-200 mb-4">
            Today&apos;s Prompt
          </span>
          <div className="mt-4 space-y-3">
            <p className="text-lg font-black text-blue-500">{prompt.x_axis_label}?</p>
            <div className="text-2xl text-gray-200 font-black">vs</div>
            <p className="text-lg font-black text-rose-400">{prompt.y_axis_label}?</p>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-gray-400 font-bold">No prompt for today yet. Check back soon!</p>
        </div>
      )}

      <div>
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Your Groups</h2>
        {groups.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-400 font-bold">Join or create a group to start playing!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map(group => (
              <HomeClient
                key={group.id}
                group={group}
                promptId={prompt?.id}
                userSubmitted={statusMap.get(group.id)?.userSubmitted ?? false}
                allSubmitted={statusMap.get(group.id)?.allSubmitted ?? false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
