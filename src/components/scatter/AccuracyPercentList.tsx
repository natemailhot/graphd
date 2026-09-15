'use client'

import type { AveragedPosition, PlacementPosition } from '@/types/app'
import { AVATAR_COLORS } from './ResultsChart'

const MAX_DIST = Math.SQRT2 // corner-to-corner distance in normalized 0-1 space

interface AccuracyPercentListProps {
  positions: AveragedPosition[]
  myPlacements: PlacementPosition[]
  selectedUserId?: string | null
  onSelect?: (userId: string) => void
}

export function AccuracyPercentList({ positions, myPlacements, selectedUserId, onSelect }: AccuracyPercentListProps) {
  const myMap = new Map(myPlacements.map(p => [p.targetUserId, p]))

  const rows = positions
    .map((pos, i) => {
      const mine = myMap.get(pos.targetUserId)
      if (!mine) return null
      const dx = mine.x - pos.x
      const dy = mine.y - pos.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const match = Math.round((1 - dist / MAX_DIST) * 100)
      return { pos, match, color: AVATAR_COLORS[i % AVATAR_COLORS.length] }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.match - a.match)

  if (rows.length === 0) return null

  const overall = Math.round(rows.reduce((sum, r) => sum + r.match, 0) / rows.length)

  return (
    <div className="space-y-2">
      <p className="text-center text-sm text-gray-500">
        You matched the group by <span className="font-black text-violet-500">{overall}%</span> on average
      </p>
      {rows.map(({ pos, match, color }) => {
        const isSelected = selectedUserId === pos.targetUserId
        return (
          <button
            key={pos.targetUserId}
            onClick={() => onSelect?.(pos.targetUserId)}
            className={`w-full flex items-center gap-3 p-2.5 card rounded-xl text-left transition-colors ${
              onSelect ? 'cursor-pointer' : ''
            } ${isSelected ? 'ring-2 ring-rose-300' : ''}`}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color.bg }} />
            <span className="flex-1 text-sm font-semibold text-gray-700 truncate">{pos.profile.display_name}</span>
            <div className="flex items-center gap-2 w-28">
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(0, match)}%`, background: color.bg }}
                />
              </div>
              <span className="text-xs font-black text-gray-600 w-9 text-right">{match}%</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
