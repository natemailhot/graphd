'use client'

import type { AveragedPosition, PlacementPosition } from '@/types/app'
import { AVATAR_COLORS } from './ResultsChart'

interface AccuracyVectorListProps {
  positions: AveragedPosition[]
  myPlacements: PlacementPosition[]
}

export function AccuracyVectorList({ positions, myPlacements }: AccuracyVectorListProps) {
  const myMap = new Map(myPlacements.map(p => [p.targetUserId, p]))

  const rows = positions
    .map((pos, i) => {
      const mine = myMap.get(pos.targetUserId)
      if (!mine) return null
      const dx = mine.x - pos.x
      const dy = mine.y - pos.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      // Screen-space angle: up is -y, so flip dy for a natural compass rotation
      const angleDeg = (Math.atan2(dx, dy) * 180) / Math.PI
      return { pos, dist, angleDeg, color: AVATAR_COLORS[i % AVATAR_COLORS.length] }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => a.dist - b.dist)

  if (rows.length === 0) return null

  return (
    <div className="space-y-2">
      {rows.map(({ pos, dist, angleDeg, color }) => (
        <div key={pos.targetUserId} className="flex items-center gap-3 p-2.5 card rounded-xl">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color.bg }} />
          <span className="flex-1 text-sm font-semibold text-gray-700 truncate">{pos.profile.display_name}</span>
          <span
            className="text-base font-bold text-gray-400"
            style={{ display: 'inline-block', transform: `rotate(${angleDeg}deg)` }}
            title="Direction you were off"
          >
            ↑
          </span>
          <span className="text-xs font-black text-gray-600 w-14 text-right">{dist.toFixed(2)} off</span>
        </div>
      ))}
    </div>
  )
}
