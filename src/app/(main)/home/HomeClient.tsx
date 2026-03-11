'use client'

import Link from 'next/link'
import type { Group } from '@/types/app'

interface HomeClientProps {
  group: Group
  promptId?: string
  userSubmitted: boolean
  allSubmitted: boolean
}

export function HomeClient({ group, promptId, userSubmitted, allSubmitted }: HomeClientProps) {
  return (
    <div className="card card-hover p-4 flex items-center justify-between transition-all">
      <div>
        <h3 className="font-bold text-gray-800">{group.name}</h3>
        <p className="text-xs text-gray-300 font-mono mt-0.5">{group.invite_code}</p>
      </div>
      <div className="flex gap-2">
        {promptId && (
          <>
            {userSubmitted ? (
              <span className="inline-flex items-center justify-center gap-1.5 min-w-[100px] px-4 py-[7px] rounded-full text-xs font-bold bg-green-50 text-green-500 border-2 border-green-200 box-border">
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
              {allSubmitted ? 'View Results' : 'Waiting...'}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
