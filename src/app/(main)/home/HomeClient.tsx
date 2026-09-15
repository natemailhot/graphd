'use client'

import Link from 'next/link'
import type { Group } from '@/types/app'

interface HomeClientProps {
  group: Group
  promptId?: string
  userSubmitted: boolean
  allSubmitted: boolean
  submittedCount: number
  totalMembers: number
}

export function HomeClient({ group, promptId, userSubmitted, allSubmitted, submittedCount, totalMembers }: HomeClientProps) {
  return (
    <div className="card card-hover p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-violet-400 flex items-center justify-center text-sm font-black text-white overflow-hidden border-2 border-violet-300 shrink-0">
          {group.icon_url ? (
            <img src={group.icon_url} alt={group.name} className="w-full h-full object-cover" />
          ) : (
            group.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-bold text-gray-800 truncate">{group.name}</h3>
            {promptId && totalMembers > 0 && (
              <span className="text-xs font-bold text-violet-400 shrink-0">
                {submittedCount}/{totalMembers}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-300 font-mono mt-0.5">{group.invite_code}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {promptId && !group.gameplay_enabled && (
          <span className="inline-flex items-center justify-center min-w-[100px] px-4 py-[7px] rounded-full text-xs font-bold bg-blue-50 text-blue-400 border-2 border-blue-200">
            Not started
          </span>
        )}
        {promptId && group.gameplay_enabled && (
          <>
            {userSubmitted ? (
              <Link
                href={allSubmitted ? `/results/${group.id}` : `/play/${group.id}?edit=1`}
                className="inline-flex items-center justify-center gap-1.5 min-w-[100px] px-4 py-[7px] rounded-full text-xs font-bold bg-green-50 text-green-500 border-2 border-green-200 box-border hover:bg-green-100 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-green-400" />
                {allSubmitted ? 'Submitted' : 'Submitted (edit)'}
              </Link>
            ) : (
              <Link href="/play" className="inline-flex items-center justify-center min-w-[100px] px-4 py-[7px] rounded-full text-xs font-bold text-white bg-[#f43f5e] border-2 border-[#e11d48]">Play</Link>
            )}
            <Link
              href={`/results/${group.id}`}
              className={
                allSubmitted
                  ? 'inline-flex items-center justify-center min-w-[100px] px-4 py-[7px] rounded-full text-xs font-bold text-white bg-[#8b5cf6] border-2 border-[#7c3aed] shadow-[0_3px_0_#6d28d9] hover:brightness-105 transition-all'
                  : 'inline-flex items-center justify-center min-w-[100px] px-4 py-[7px] rounded-full text-xs font-bold text-[#6d28d9] bg-white border-2 border-[#ddd6fe]'
              }
            >
              {allSubmitted ? '🎉 View Results' : 'Waiting...'}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
