import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { PlacementPosition } from '@/types/app'

type Client = SupabaseClient<Database>

export async function submitPlacements(
  supabase: Client,
  groupId: string,
  promptId: string,
  userId: string,
  positions: PlacementPosition[]
) {
  const rows = positions.map(p => ({
    group_id: groupId,
    prompt_id: promptId,
    placed_by: userId,
    target_user_id: p.targetUserId,
    x_value: p.x,
    y_value: p.y,
  }))

  const { error } = await supabase.from('placements').upsert(rows, {
    onConflict: 'group_id,prompt_id,placed_by,target_user_id',
  })
  if (error) throw error
}

export async function getGroupPlacements(
  supabase: Client,
  groupId: string,
  promptId: string
) {
  const { data, error } = await supabase
    .from('placements')
    .select('*')
    .eq('group_id', groupId)
    .eq('prompt_id', promptId)
  if (error) throw error
  return data
}

export async function getUserPlacements(
  supabase: Client,
  groupId: string,
  promptId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('placements')
    .select('*')
    .eq('group_id', groupId)
    .eq('prompt_id', promptId)
    .eq('placed_by', userId)
  if (error) throw error
  return data
}

export async function getSubmissionStatus(
  supabase: Client,
  groupId: string,
  promptId: string
) {
  const { data, error } = await supabase
    .from('group_submissions')
    .select('*')
    .eq('group_id', groupId)
    .eq('prompt_id', promptId)
  if (error) throw error
  return data
}
