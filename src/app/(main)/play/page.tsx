import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTodayPrompt, getPromptByDate, getTomorrowPromptTeaser } from '@/lib/api/prompts'
import { getYesterdayUTC, getTomorrowUTC } from '@/lib/utils/dates'
import { UnifiedPlayClient } from './UnifiedPlayClient'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const prompt = await getTodayPrompt(supabase).catch(() => null)
  const title = prompt
    ? `Today's prompt: ${prompt.x_axis_label} vs ${prompt.y_axis_label}`
    : 'Graphd'
  const description = prompt
    ? `Rate your friends on today's prompt — ${prompt.x_axis_label} vs ${prompt.y_axis_label}.`
    : 'A daily social game where you place your friends on scatter plots.'
  return { title, description, openGraph: { title, description } }
}

export default async function UnifiedPlayPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { edit } = await searchParams

  if (!user) {
    const prompt = await getTodayPrompt(supabase).catch(() => null)
    return (
      <div className="card rounded-2xl p-8 text-center space-y-4">
        {prompt ? (
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-rose-50 text-rose-400 border-2 border-rose-200">
              Today&apos;s Prompt
            </span>
            <p className="text-lg font-black text-blue-500">{prompt.x_axis_label}?</p>
            <div className="text-2xl text-gray-200 font-black">vs</div>
            <p className="text-lg font-black text-rose-400">{prompt.y_axis_label}?</p>
          </div>
        ) : (
          <h1 className="text-xl font-bold text-gray-800">Graphd</h1>
        )}
        <Link href={`/login?redirect=${encodeURIComponent('/play')}`} className="inline-block btn-primary px-6 py-2.5">
          Sign in to play
        </Link>
      </div>
    )
  }

  const [yesterdaysPrompt, tomorrowsPromptTeaser] = await Promise.all([
    getPromptByDate(supabase, getYesterdayUTC()).catch(() => null),
    getTomorrowPromptTeaser(supabase, getTomorrowUTC()).catch(() => null),
  ])

  return (
    <UnifiedPlayClient
      currentUserId={user.id}
      editMode={edit === '1'}
      yesterdaysPrompt={yesterdaysPrompt ? { x: yesterdaysPrompt.x_axis_label, y: yesterdaysPrompt.y_axis_label } : null}
      tomorrowsPromptTeaser={tomorrowsPromptTeaser}
    />
  )
}
