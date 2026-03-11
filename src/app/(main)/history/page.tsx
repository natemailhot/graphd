import { createClient } from '@/lib/supabase/server'
import { getPastPrompts } from '@/lib/api/prompts'
import { getUserGroups } from '@/lib/api/groups'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils/dates'
import Link from 'next/link'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [prompts, groups] = await Promise.all([
    getPastPrompts(supabase),
    getUserGroups(supabase, user.id).catch(() => []),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">History</h1>
      {prompts.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg font-bold">No past prompts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prompts.map(prompt => (
            <div key={prompt.id} className="card p-4">
              <span className="text-xs font-black text-violet-400">
                {prompt.prompt_date ? formatDate(prompt.prompt_date) : 'Unknown'}
              </span>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-700"><span className="font-bold text-gray-400">X:</span> {prompt.x_axis_label}?</p>
                <p className="text-sm text-gray-700"><span className="font-bold text-gray-400">Y:</span> {prompt.y_axis_label}?</p>
              </div>
              {groups.length > 0 && prompt.prompt_date && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {groups.map(g => (
                    <Link key={g.id} href={`/results/${g.id}/${prompt.prompt_date}`} className="text-xs px-2.5 py-1 rounded-full bg-violet-50 text-violet-500 font-bold border border-violet-200 hover:bg-violet-100 transition-colors">
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
