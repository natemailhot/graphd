import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { GroupWithMembers } from '@/types/app'

type Client = SupabaseClient<Database>

export async function createGroup(supabase: Client, name: string, userId: string) {
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({ name, invite_code: inviteCode, created_by: userId })
    .select()
    .single()
  if (groupError) throw groupError

  const { error: memberError } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: userId })
  if (memberError) throw memberError

  return group
}

export async function joinGroup(supabase: Client, inviteCode: string, userId: string) {
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single()
  if (groupError) throw groupError

  const { error: memberError } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: userId })
  if (memberError) throw memberError

  return group
}

export async function getUserGroups(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, groups(*)')
    .eq('user_id', userId)
  if (error) throw error
  return data.map(d => d.groups).filter(Boolean) as GroupWithMembers[]
}

export async function getGroupWithMembers(
  supabase: Client,
  groupId: string
): Promise<GroupWithMembers> {
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()
  if (groupError) throw groupError

  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select('user_id, profiles(*)')
    .eq('group_id', groupId)
  if (membersError) throw membersError

  return {
    ...group,
    members: members.map(m => m.profiles).filter(Boolean) as any[],
  }
}

export async function getGroupMemberProfiles(supabase: Client, groupId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select('profiles(*)')
    .eq('group_id', groupId)
  if (error) throw error
  return data.map(d => d.profiles).filter(Boolean) as any[]
}

export async function removeMember(supabase: Client, groupId: string, userId: string) {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function transferHost(supabase: Client, groupId: string, newHostId: string) {
  const { error } = await supabase
    .from('groups')
    .update({ created_by: newHostId })
    .eq('id', groupId)
  if (error) throw error
}

export async function leaveGroup(supabase: Client, groupId: string, userId: string) {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)
  if (error) throw error
}
