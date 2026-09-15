import type { AveragedPosition, LeaderboardRow, Prompt } from '@/types/app'
import { computeAwardWinners, AWARD_CORNERS } from '@/lib/utils/awards'
import { formatDate } from '@/lib/utils/dates'
import { MEDALS } from '@/components/scatter/LeaderboardList'

const GRID_SIZE = 5
const GRID_EMOJI = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣']
const EMPTY_CELL = '⬜'

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
    sections.push(buildGridSection(input.positions, input.prompt))
  }

  return sections.join('\n\n')
}

function buildHeader({ groupName, prompt }: ShareTextInput): string {
  const lines = [`graphd · ${groupName}`, `${prompt.x_axis_label} vs. ${prompt.y_axis_label}`]
  if (prompt.prompt_date) {
    lines.push(formatDate(prompt.prompt_date))
  }
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

function buildGridSection(positions: AveragedPosition[], prompt: Prompt): string {
  const occupied = new Set<string>()
  const cells = new Map<string, string>() // "row,col" -> emoji
  const legendEntries: string[] = []

  positions.forEach((pos, i) => {
    const emoji = GRID_EMOJI[i % GRID_EMOJI.length]
    const targetCol = Math.round(pos.x * (GRID_SIZE - 1))
    const targetRow = Math.round((1 - pos.y) * (GRID_SIZE - 1))
    const [row, col] = findFreeCell(targetRow, targetCol, occupied)
    occupied.add(`${row},${col}`)
    cells.set(`${row},${col}`, emoji)
    legendEntries.push(`${emoji} ${pos.profile.display_name.split(' ')[0]}`)
  })

  const gridRows: string[] = []
  for (let row = 0; row < GRID_SIZE; row++) {
    let line = ''
    for (let col = 0; col < GRID_SIZE; col++) {
      line += cells.get(`${row},${col}`) ?? EMPTY_CELL
    }
    gridRows.push(line)
  }

  return [`${prompt.x_axis_label} × ${prompt.y_axis_label}`, gridRows.join('\n'), legendEntries.join('  ')].join('\n')
}

function findFreeCell(row: number, col: number, occupied: Set<string>): [number, number] {
  const inBounds = (r: number, c: number) => r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE

  if (inBounds(row, col) && !occupied.has(`${row},${col}`)) return [row, col]

  for (let radius = 1; radius < GRID_SIZE * 2; radius++) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        // only check the perimeter of this ring
        if (Math.max(Math.abs(dr), Math.abs(dc)) !== radius) continue
        const r = row + dr
        const c = col + dc
        if (inBounds(r, c) && !occupied.has(`${r},${c}`)) return [r, c]
      }
    }
  }

  // Grid is completely full (more people than cells) — fall back to clamped original position
  return [Math.min(Math.max(row, 0), GRID_SIZE - 1), Math.min(Math.max(col, 0), GRID_SIZE - 1)]
}
