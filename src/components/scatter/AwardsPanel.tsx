'use client'

import type { AveragedPosition } from '@/types/app'
import type { AwardLabels } from '@/types/database'
import { computeAwardWinners } from '@/lib/utils/awards'

interface AwardsPanelProps {
  positions: AveragedPosition[]
  awardLabels: AwardLabels
}

export function AwardsPanel({ positions, awardLabels }: AwardsPanelProps) {
  const winners = computeAwardWinners(positions, awardLabels)

  if (winners.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-3">
      {winners.map(({ key, emoji, label, winner }) => (
        <div key={key} className="card rounded-xl p-3 text-center space-y-1.5">
          <div className="text-2xl">{emoji}</div>
          <p className="text-xs font-black text-violet-500 uppercase tracking-wide leading-tight">
            {label}
          </p>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-violet-400 flex items-center justify-center text-[9px] font-black text-white overflow-hidden shrink-0">
              {winner.profile.avatar_url ? (
                <img src={winner.profile.avatar_url} alt={winner.profile.display_name} className="w-full h-full object-cover" />
              ) : (
                winner.profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              )}
            </div>
            <span className="text-sm font-bold text-gray-700 truncate">{winner.profile.display_name}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
