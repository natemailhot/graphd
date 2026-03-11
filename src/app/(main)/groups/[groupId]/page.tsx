import { createClient } from '@/lib/supabase/server'
import { getGroupWithMembers } from '@/lib/api/groups'
import { getTodayPrompt } from '@/lib/api/prompts'
import { getSubmissionStatus } from '@/lib/api/placements'
import { GroupDetailClient } from './GroupDetailClient'

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [group, prompt] = await Promise.all([
    getGroupWithMembers(supabase, groupId),
    getTodayPrompt(supabase).catch(() => null),
  ])

  let userSubmitted = false
  let allSubmitted = false
  if (prompt) {
    const statuses = await getSubmissionStatus(supabase, groupId, prompt.id).catch(() => [])
    userSubmitted = statuses.some(s => s.user_id === user.id && s.has_submitted)
    allSubmitted = statuses.length > 0 && statuses.every(s => s.has_submitted)
  }

  return (
    <GroupDetailClient
      group={group}
      currentUserId={user.id}
      userSubmitted={userSubmitted}
      allSubmitted={allSubmitted}
    />
  )
}
