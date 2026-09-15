'use client'

import type { AveragedPosition } from '@/types/app'
import type { AwardLabels } from '@/types/database'

interface AwardsPanelProps {
  positions: AveragedPosition[]
  awardLabels: AwardLabels
}

const CORNERS: { key: keyof AwardLabels; x: number; y: number; emoji: string }[] = [
  { key: 'top_right', x: 1, y: 1, emoji: '👑' },
  { key: 'top_left', x: 0, y: 1, emoji: '😏' },
  { key: 'bottom_right', x: 1, y: 0, emoji: '🃏' },
  { key: 'bottom_left', x: 0, y: 0, emoji: '💀' },
]

export function AwardsPanel({ positions, awardLabels }: AwardsPanelProps) {
  if (positions.length === 0) return null

  const winners = CORNERS.map(corner => {
    let best: AveragedPosition | null = null
    let bestDist = Infinity
    for (const pos of positions) {
      const dx = pos.x - corner.x
      const dy = pos.y - corner.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < bestDist) {
        bestDist = dist
        best = pos
      }
    }
    return { ...corner, winner: best }
  }).filter(w => w.winner !== null)

  if (winners.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-3">
      {winners.map(({ key, emoji, winner }) => (
        <div key={key} className="card rounded-xl p-3 text-center space-y-1.5">
          <div className="text-2xl">{emoji}</div>
          <p className="text-xs font-black text-violet-500 uppercase tracking-wide leading-tight">
            {awardLabels[key]}
          </p>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-violet-400 flex items-center justify-center text-[9px] font-black text-white overflow-hidden shrink-0">
              {winner!.profile.avatar_url ? (
                <img src={winner!.profile.avatar_url} alt={winner!.profile.display_name} className="w-full h-full object-cover" />
              ) : (
                winner!.profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              )}
            </div>
            <span className="text-sm font-bold text-gray-700 truncate">{winner!.profile.display_name}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
