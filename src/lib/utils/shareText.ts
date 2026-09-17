import type { LeaderboardRow, Prompt } from '@/types/app'
import { formatDate } from '@/lib/utils/dates'

export interface ShareTextInput {
  groupName: string
  prompt: Prompt
  todayLeaderboard: LeaderboardRow[]
  url?: string
}

export function buildShareText(input: ShareTextInput): string {
  const sections = [buildHeader(input)]

  const accuracySection = buildAccuracySection(input.todayLeaderboard)
  if (accuracySection) sections.push(accuracySection)

  if (input.url) sections.push(input.url)

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

function buildAccuracySection(rows: LeaderboardRow[]): string | null {
  if (rows.length === 0) return null

  // rows are already sorted best-to-worst by the group_accuracy_leaderboard RPC
  const most = rows[0]
  const least = rows[rows.length - 1]

  const lines = ["🎯 Today's Accuracy"]
  lines.push(`🥇 Most accurate: ${most.display_name} — ${most.avg_match}%`)
  if (least.user_id !== most.user_id) {
    lines.push(`🐢 Least accurate: ${least.display_name} — ${least.avg_match}%`)
  }
  return lines.join('\n')
}
