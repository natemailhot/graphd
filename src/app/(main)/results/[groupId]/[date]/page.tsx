import { createClient } from '@/lib/supabase/server'
import { getPromptByDate } from '@/lib/api/prompts'
import { redirect } from 'next/navigation'
import { ResultsClient } from '../ResultsClient'

export default async function HistoricalResultsPage({
  params,
}: {
  params: Promise<{ groupId: string; date: string }>
}) {
  const { groupId, date } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const prompt = await getPromptByDate(supabase, date).catch(() => null)
  if (!prompt) {
    return <p className="text-center text-slate-500 py-12">No prompt found for this date.</p>
  }

  return <ResultsClient groupId={groupId} prompt={prompt} currentUserId={user.id} />
}
