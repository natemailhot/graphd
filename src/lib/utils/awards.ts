import type { AveragedPosition } from '@/types/app'
import type { AwardLabels } from '@/types/database'

export interface AwardWinner {
  key: keyof AwardLabels
  emoji: string
  label: string
  winner: AveragedPosition
}

export const AWARD_CORNERS: { key: keyof AwardLabels; x: number; y: number; emoji: string }[] = [
  { key: 'top_right', x: 1, y: 1, emoji: '👑' },
  { key: 'top_left', x: 0, y: 1, emoji: '😏' },
  { key: 'bottom_right', x: 1, y: 0, emoji: '🃏' },
  { key: 'bottom_left', x: 0, y: 0, emoji: '💀' },
]

export function computeAwardWinners(positions: AveragedPosition[], awardLabels: AwardLabels): AwardWinner[] {
  if (positions.length === 0) return []

  return AWARD_CORNERS.map(corner => {
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
    return best ? { key: corner.key, emoji: corner.emoji, label: awardLabels[corner.key], winner: best } : null
  }).filter((w): w is AwardWinner => w !== null)
}
