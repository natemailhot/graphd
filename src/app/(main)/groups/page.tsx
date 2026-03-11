import { createClient } from '@/lib/supabase/server'
import { getUserGroups } from '@/lib/api/groups'
import { getTodayPrompt } from '@/lib/api/prompts'
import { getSubmissionStatus } from '@/lib/api/placements'
import Link from 'next/link'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [groups, prompt] = await Promise.all([
    getUserGroups(supabase, user.id).catch(() => []),
    getTodayPrompt(supabase).catch(() => null),
  ])

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800">Groups</h1>
        <div className="flex gap-2">
          <Link href="/groups/new" className="btn-primary text-sm">Create</Link>
          <Link href="/groups/join" className="btn-secondary text-sm">Join</Link>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg font-bold">No groups yet</p>
          <p className="text-gray-300 text-sm mt-1">Create one or join with an invite code</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(group => {
            const status = statusMap.get(group.id)
            return (
              <div key={group.id} className="p-4 card transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-400 flex items-center justify-center text-sm font-black text-white overflow-hidden border-2 border-violet-300 shrink-0">
                      {group.icon_url ? (
                        <img src={group.icon_url} alt={group.name} className="w-full h-full object-cover" />
                      ) : (
                        group.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{group.name}</h3>
                      <p className="text-sm text-gray-400 mt-1 font-mono">{group.invite_code}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {prompt && (
                      <>
                        {status?.userSubmitted ? (
                          <span className="inline-flex items-center justify-center gap-1.5 min-w-[100px] px-4 py-[7px] rounded-full text-xs font-bold bg-green-50 text-green-500 border-2 border-green-200">
                            <span className="w-2 h-2 rounded-full bg-green-400" />
                            Submitted
                          </span>
                        ) : (
                          <Link href={`/play/${group.id}`} className="inline-flex items-center justify-center min-w-[100px] px-4 py-[7px] rounded-full text-xs font-bold text-white bg-[#f43f5e] border-2 border-[#e11d48]">Play</Link>
                        )}
                        <Link
                          href={`/results/${group.id}`}
                          className="inline-flex items-center justify-center min-w-[100px] px-4 py-[7px] rounded-full text-xs font-bold text-[#6d28d9] bg-white border-2 border-[#ddd6fe]"
                        >
                          {status?.allSubmitted ? 'View Results' : 'Waiting...'}
                        </Link>
                      </>
                    )}
                    <Link
                      href={`/groups/${group.id}`}
                      className="inline-flex items-center justify-center min-w-[100px] px-4 py-[7px] rounded-full text-xs font-bold text-gray-500 bg-gray-50 border-2 border-gray-200"
                    >
                      View Group
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
