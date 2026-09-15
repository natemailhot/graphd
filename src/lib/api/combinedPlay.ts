import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { Profile, PlacementPosition, Prompt } from '@/types/app'
import { getTodayPrompt } from '@/lib/api/prompts'

type Client = SupabaseClient<Database>

export interface CombinedPlayState {
  prompt: Prompt | null
  totalTargets: number
  ratedCount: number
  remaining: Profile[]
  /** target_user_id -> group_ids they're co-members of with the current user, among "ready" groups */
  groupsByTarget: Map<string, string[]>
}

/**
 * Everyone the user needs to rate today, deduplicated across every group
 * they're in that's ready to play (gameplay_enabled). Also backfills any
 * already-known rating into groups that don't have a row for it yet (e.g.
 * a newly-started group sharing a member you already rated elsewhere), so
 * "already rated" never needs to be re-entered.
 */
export async function getCombinedPlayState(supabase: Client, userId: string): Promise<CombinedPlayState> {
  const prompt = await getTodayPrompt(supabase).catch(() => null)
  const empty: CombinedPlayState = { prompt, totalTargets: 0, ratedCount: 0, remaining: [], groupsByTarget: new Map() }
  if (!prompt) return empty

  const { data: myMemberships, error: membershipError } = await supabase
    .from('group_members')
    .select('group_id, groups(id, gameplay_enabled)')
    .eq('user_id', userId)
  if (membershipError) throw membershipError

  const readyGroupIds = (myMemberships ?? [])
    .map(m => m.groups)
    .filter((g): g is { id: string; gameplay_enabled: boolean } => !!g && g.gameplay_enabled)
    .map(g => g.id)

  if (readyGroupIds.length === 0) return empty

  const { data: allMembers, error: membersError } = await supabase
    .from('group_members')
    .select('group_id, user_id, profiles(*)')
    .in('group_id', readyGroupIds)
  if (membersError) throw membersError

  const groupsByTarget = new Map<string, Set<string>>()
  const profileByTarget = new Map<string, Profile>()
  for (const row of allMembers ?? []) {
    if (row.user_id === userId || !row.profiles) continue
    if (!groupsByTarget.has(row.user_id)) groupsByTarget.set(row.user_id, new Set())
    groupsByTarget.get(row.user_id)!.add(row.group_id)
    profileByTarget.set(row.user_id, row.profiles as Profile)
  }

  const { data: myPlacements, error: placementsError } = await supabase
    .from('placements')
    .select('group_id, target_user_id, x_value, y_value')
    .eq('placed_by', userId)
    .eq('prompt_id', prompt.id)
  if (placementsError) throw placementsError

  const ratedValue = new Map<string, { x: number; y: number }>()
  const existingPairs = new Set<string>()
  for (const p of myPlacements ?? []) {
    existingPairs.add(`${p.group_id}:${p.target_user_id}`)
    if (!ratedValue.has(p.target_user_id)) {
      ratedValue.set(p.target_user_id, { x: p.x_value, y: p.y_value })
    }
  }

  // Backfill: copy an already-known rating into any co-membership group missing it
  const backfillRows: { group_id: string; prompt_id: string; placed_by: string; target_user_id: string; x_value: number; y_value: number }[] = []
  for (const [targetId, value] of ratedValue) {
    for (const groupId of groupsByTarget.get(targetId) ?? []) {
      if (!existingPairs.has(`${groupId}:${targetId}`)) {
        backfillRows.push({ group_id: groupId, prompt_id: prompt.id, placed_by: userId, target_user_id: targetId, x_value: value.x, y_value: value.y })
      }
    }
  }
  if (backfillRows.length > 0) {
    const { error: backfillError } = await supabase.from('placements').upsert(backfillRows, {
      onConflict: 'group_id,prompt_id,placed_by,target_user_id',
    })
    if (backfillError) throw backfillError
  }

  const remaining = Array.from(groupsByTarget.keys())
    .filter(id => !ratedValue.has(id))
    .map(id => profileByTarget.get(id)!)

  return {
    prompt,
    totalTargets: groupsByTarget.size,
    ratedCount: ratedValue.size,
    remaining,
    groupsByTarget: new Map(Array.from(groupsByTarget.entries()).map(([k, v]) => [k, Array.from(v)])),
  }
}

export async function submitCombinedPlacements(
  supabase: Client,
  userId: string,
  promptId: string,
  groupsByTarget: Map<string, string[]>,
  positions: PlacementPosition[]
) {
  const rows = positions.flatMap(p => {
    const groupIds = groupsByTarget.get(p.targetUserId) ?? []
    return groupIds.map(groupId => ({
      group_id: groupId,
      prompt_id: promptId,
      placed_by: userId,
      target_user_id: p.targetUserId,
      x_value: p.x,
      y_value: p.y,
    }))
  })
  if (rows.length === 0) return

  const { error } = await supabase.from('placements').upsert(rows, {
    onConflict: 'group_id,prompt_id,placed_by,target_user_id',
  })
  if (error) throw error
}
