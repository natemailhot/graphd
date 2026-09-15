'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getCombinedPlayState } from '@/lib/api/combinedPlay'

export function DailyProgressBanner({ currentUserId }: { currentUserId: string }) {
  const [state, setState] = useState<{ totalTargets: number; ratedCount: number } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    getCombinedPlayState(supabase, currentUserId)
      .then(s => setState({ totalTargets: s.totalTargets, ratedCount: s.ratedCount }))
      .catch(() => {})
  }, [currentUserId])

  if (!state || state.totalTargets === 0) return null

  const done = state.ratedCount >= state.totalTargets

  return (
    <div className="card flex items-center justify-between p-4 gap-3">
      <div className="min-w-0">
        <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Your Progress Today</p>
        <p className="text-lg font-black text-violet-500 mt-0.5">
          {state.ratedCount}/{state.totalTargets} graphed
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {state.ratedCount > 0 && (
          <Link
            href="/play?edit=1"
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-white text-gray-400 border-2 border-gray-200 hover:border-violet-200 transition-colors"
          >
            Edit
          </Link>
        )}
        <Link
          href="/play"
          className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
            done
              ? 'bg-green-50 text-green-500 border-2 border-green-200'
              : 'text-white bg-[#f43f5e] border-2 border-[#e11d48]'
          }`}
        >
          {done ? '🎉 All done' : 'Keep going'}
        </Link>
      </div>
    </div>
  )
}
