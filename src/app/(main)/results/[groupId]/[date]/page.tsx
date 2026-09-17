import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPromptByDate } from '@/lib/api/prompts'
import { formatDate } from '@/lib/utils/dates'
import { ResultsClient } from '../ResultsClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ groupId: string; date: string }>
}): Promise<Metadata> {
  const { groupId, date } = await params
  const supabase = await createClient()
  const [{ data: group }, prompt] = await Promise.all([
    supabase.from('groups').select('name').eq('id', groupId).maybeSingle(),
    getPromptByDate(supabase, date).catch(() => null),
  ])
  const groupName = group?.name ?? 'Graphd'
  const title = prompt
    ? `Results: ${groupName} · ${formatDate(date)} — ${prompt.x_axis_label} vs ${prompt.y_axis_label}`
    : `Results: ${groupName} on Graphd`
  const description = prompt
    ? `See where everyone landed on "${prompt.x_axis_label} vs ${prompt.y_axis_label}" →`
    : 'A daily social game where you place your friends on scatter plots.'
  return { title, description, openGraph: { title, description } }
}

export default async function HistoricalResultsPage({
  params,
}: {
  params: Promise<{ groupId: string; date: string }>
}) {
  const { groupId, date } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="card rounded-2xl p-8 text-center space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Sign in to see the results</h1>
        <Link
          href={`/login?redirect=${encodeURIComponent(`/results/${groupId}/${date}`)}`}
          className="inline-block btn-primary px-6 py-2.5"
        >
          Sign in
        </Link>
      </div>
    )
  }

  const prompt = await getPromptByDate(supabase, date).catch(() => null)
  if (!prompt) {
    return <p className="text-center text-slate-500 py-12">No prompt found for this date.</p>
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
