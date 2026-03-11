import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type Prompt = Database['public']['Tables']['prompts']['Row']
export type Placement = Database['public']['Tables']['placements']['Row']

export interface GroupWithMembers extends Group {
  members: Profile[]
}

export interface PlacementPosition {
  targetUserId: string
  x: number
  y: number
}

export interface AveragedPosition {
  targetUserId: string
  profile: Profile
  x: number
  y: number
  count: number
}

export interface SubmissionStatus {
  userId: string
  displayName: string
  hasSubmitted: boolean
}

export interface DailyPromptState {
  prompt: Prompt | null
  groups: GroupPlayState[]
}

export interface GroupPlayState {
  group: Group
  memberCount: number
  hasSubmitted: boolean
  allSubmitted: boolean
}
