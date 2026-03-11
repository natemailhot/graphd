'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getGroupMemberProfiles } from '@/lib/api/groups'
import type { Profile } from '@/types/app'

export function useGroupMembers(groupId: string) {
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    getGroupMemberProfiles(supabase, groupId)
      .then(setMembers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [groupId])

  return { members, loading, error }
}
