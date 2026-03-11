import { createClient } from '@/lib/supabase/server'
import { getTodayPrompt } from '@/lib/api/prompts'
import { getGroupWithMembers } from '@/lib/api/groups'
import { getUserPlacements } from '@/lib/api/placements'
import { redirect } from 'next/navigation'
import { PlayClient } from './PlayClient'

export default async function PlayPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [prompt, group] = await Promise.all([
    getTodayPrompt(supabase),
    getGroupWithMembers(supabase, groupId),
  ])

  if (!prompt) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-purple-300/40">No prompt available today.</p>
      </div>
    )
  }

  if (group.members.length < group.min_members) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Not enough members</h2>
        <p className="text-purple-300/40">
          This group needs at least {group.min_members} members to play. Currently {group.members.length}.
        </p>
      </div>
    )
  }

  const existingPlacements = await getUserPlacements(supabase, groupId, prompt.id, user.id)

  const existingPositions = existingPlacements.map(p => ({
    targetUserId: p.target_user_id,
    x: p.x_value,
    y: p.y_value,
  }))

  return (
    <PlayClient
      groupId={groupId}
      prompt={prompt}
      members={group.members}
      currentUserId={user.id}
      existingPositions={existingPositions}
    />
  )
}
