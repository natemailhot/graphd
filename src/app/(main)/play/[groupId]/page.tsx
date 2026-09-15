import { createClient } from '@/lib/supabase/server'
import { getTodayPrompt } from '@/lib/api/prompts'
import { getGroupWithMembers } from '@/lib/api/groups'
import { getUserPlacements, getSubmissionStatus } from '@/lib/api/placements'
import { redirect } from 'next/navigation'
import { PlayClient } from './PlayClient'

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>
  searchParams: Promise<{ edit?: string }>
}) {
  const { groupId } = await params
  const { edit } = await searchParams
  const isEditRequest = edit === '1'
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
      <div className="card rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Not enough members</h2>
        <p className="text-gray-400">
          This group needs at least {group.min_members} members to play. Currently {group.members.length}.
        </p>
      </div>
    )
  }

  if (!group.gameplay_enabled) {
    return (
      <div className="card rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Game not started yet</h2>
        <p className="text-gray-400">
          The host hasn&apos;t started the game for this group yet. Hang tight!
        </p>
      </div>
    )
  }

  const existingPlacements = await getUserPlacements(supabase, groupId, prompt.id, user.id)

  // Check if there are new members the user hasn't placed yet
  const otherMembers = group.members.filter(m => m.id !== user.id)
  const placedIds = new Set(existingPlacements.map(p => p.target_user_id))
  const hasNewMembers = otherMembers.some(m => !placedIds.has(m.id))
  const fullySubmitted = existingPlacements.length > 0 && !hasNewMembers

  if (fullySubmitted) {
    if (!isEditRequest) {
      redirect(`/results/${groupId}`)
    }
    // Editing is only allowed while results haven't been revealed yet
    const submissionStatus = await getSubmissionStatus(supabase, groupId, prompt.id)
    const allSubmitted = submissionStatus.length > 0 && submissionStatus.every(s => s.has_submitted)
    if (allSubmitted) {
      redirect(`/results/${groupId}`)
    }
  }

  const editMode = fullySubmitted && isEditRequest

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
      editMode={editMode}
    />
  )
}
