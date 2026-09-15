import { createClient } from '@/lib/supabase/server'
import { getTodayPrompt } from '@/lib/api/prompts'
import { redirect } from 'next/navigation'
import { ResultsClient } from './ResultsClient'

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const prompt = await getTodayPrompt(supabase).catch(() => null)
  if (!prompt) {
    return <p className="text-center text-slate-500 py-12">No prompt today.</p>
  }

  const { data: group } = await supabase
    .from('groups')
    .select('name, created_by')
    .eq('id', groupId)
    .single()
  const isHost = group?.created_by === user.id

  return (
    <ResultsClient
      groupId={groupId}
      groupName={group?.name ?? 'Your Group'}
      prompt={prompt}
      currentUserId={user.id}
      isHost={isHost}
    />
  )
}
