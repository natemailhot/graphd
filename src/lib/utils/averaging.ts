import type { Placement, AveragedPosition, Profile } from '@/types/app'

export function computeAveragedPositions(
  placements: Placement[],
  profiles: Profile[]
): AveragedPosition[] {
  const profileMap = new Map(profiles.map(p => [p.id, p]))
  const grouped = new Map<string, { xSum: number; ySum: number; count: number }>()

  for (const p of placements) {
    const existing = grouped.get(p.target_user_id)
    if (existing) {
      existing.xSum += p.x_value
      existing.ySum += p.y_value
      existing.count += 1
    } else {
      grouped.set(p.target_user_id, { xSum: p.x_value, ySum: p.y_value, count: 1 })
    }
  }

  return Array.from(grouped.entries())
    .map(([targetUserId, { xSum, ySum, count }]) => ({
      targetUserId,
      profile: profileMap.get(targetUserId)!,
      x: xSum / count,
      y: ySum / count,
      count,
    }))
    .filter(a => a.profile != null)
}
