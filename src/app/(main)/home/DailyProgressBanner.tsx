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
    <Link
      href="/play"
      className="card card-hover flex items-center justify-between p-4 transition-all"
    >
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Your Progress Today</p>
        <p className="text-lg font-black text-violet-500 mt-0.5">
          {state.ratedCount}/{state.totalTargets} graphed
        </p>
      </div>
      <span
        className={`text-xs font-bold px-3 py-1.5 rounded-full ${
          done
            ? 'bg-green-50 text-green-500 border-2 border-green-200'
            : 'text-white bg-[#f43f5e] border-2 border-[#e11d48]'
        }`}
      >
        {done ? '🎉 All done' : 'Keep going'}
      </span>
    </Link>
  )
}
