'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSubmissionStatus } from '@/lib/api/placements'

export function useRealtimeSubmissions(groupId: string, promptId: string) {
  const [submittedUserIds, setSubmittedUserIds] = useState<Set<string>>(new Set())
  const [totalMembers, setTotalMembers] = useState(0)

  const refresh = useCallback(async () => {
    if (!groupId || !promptId) return
    const supabase = createClient()
    const data = await getSubmissionStatus(supabase, groupId, promptId)
    setTotalMembers(data.length)
    setSubmittedUserIds(new Set(data.filter(d => d.has_submitted).map(d => d.user_id)))
  }, [groupId, promptId])

  useEffect(() => {
    if (!groupId || !promptId) return

    refresh()

    const supabase = createClient()
    const channel = supabase
      .channel(`placements:${groupId}:${promptId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'placements',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, promptId, refresh])

  const allSubmitted = totalMembers > 0 && submittedUserIds.size === totalMembers

  return { submittedUserIds, totalMembers, allSubmitted, refresh }
}
