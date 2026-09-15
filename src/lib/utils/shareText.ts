import type { AveragedPosition, LeaderboardRow, Prompt } from '@/types/app'
import { computeAwardWinners, AWARD_CORNERS } from '@/lib/utils/awards'
import { formatDate } from '@/lib/utils/dates'
import { MEDALS } from '@/components/scatter/LeaderboardList'

export interface ShareTextInput {
  groupName: string
  prompt: Prompt
  positions: AveragedPosition[]
  todayLeaderboard: LeaderboardRow[]
}

export function buildShareText(input: ShareTextInput): string {
  const sections = [buildHeader(input)]

  if (input.prompt.award_labels) {
    const awardsSection = buildAwardsSection(input.positions, input.prompt.award_labels)
    if (awardsSection) sections.push(awardsSection)
  }

  const leaderboardSection = buildLeaderboardSection(input.todayLeaderboard)
  if (leaderboardSection) sections.push(leaderboardSection)

  if (input.positions.length > 0) {
    sections.push(buildQuadrantSection(input.positions))
  }

  return sections.join('\n\n')
}

function buildHeader({ groupName, prompt }: ShareTextInput): string {
  const titleParts = [`graphd · ${groupName}`]
  if (prompt.prompt_date) {
    titleParts.push(formatDate(prompt.prompt_date))
  }
  const lines = [titleParts.join(' · '), '—————————', prompt.x_axis_label, 'vs.', prompt.y_axis_label]
  return lines.join('\n')
}

function buildAwardsSection(positions: AveragedPosition[], awardLabels: NonNullable<Prompt['award_labels']>): string | null {
  const winners = computeAwardWinners(positions, awardLabels)
  if (winners.length === 0) return null

  const byKey = new Map(winners.map(w => [w.key, w]))
  const lines = ['🏆 Awards']
  for (const corner of AWARD_CORNERS) {
    const w = byKey.get(corner.key)
    if (w) lines.push(`${w.emoji} ${w.label} — ${w.winner.profile.display_name}`)
  }
  return lines.join('\n')
}

function buildLeaderboardSection(rows: LeaderboardRow[]): string | null {
  if (rows.length === 0) return null

  const lines = ["🎯 Today's Accuracy"]
  rows.slice(0, 3).forEach((row, i) => {
    const medal = MEDALS[i] ?? `#${i + 1}`
    lines.push(`${medal} ${row.display_name} — ${row.avg_match}%`)
  })
  return lines.join('\n')
}

const QUADRANTS: { emoji: string; test: (x: number, y: number) => boolean }[] = [
  { emoji: '↗️', test: (x, y) => x >= 0.5 && y >= 0.5 },
  { emoji: '↖️', test: (x, y) => x < 0.5 && y >= 0.5 },
  { emoji: '↘️', test: (x, y) => x >= 0.5 && y < 0.5 },
  { emoji: '↙️', test: (x, y) => x < 0.5 && y < 0.5 },
]

function buildQuadrantSection(positions: AveragedPosition[]): string {
  const lines = ['📍 Where Everyone Landed']
  for (const quadrant of QUADRANTS) {
    const names = positions
      .filter(p => quadrant.test(p.x, p.y))
      .map(p => p.profile.display_name.split(' ')[0])
    if (names.length > 0) {
      lines.push(`${quadrant.emoji} ${names.join(', ')}`)
    }
  }
  return lines.join('\n')
}
