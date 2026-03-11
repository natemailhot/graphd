'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSubmissionStatus } from '@/lib/api/placements'
import type { SubmissionStatus } from '@/types/app'

export function useSubmissionStatus(groupId: string, promptId: string) {
  const [statuses, setStatuses] = useState<SubmissionStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [allSubmitted, setAllSubmitted] = useState(false)

  useEffect(() => {
    if (!groupId || !promptId) return

    const supabase = createClient()
    getSubmissionStatus(supabase, groupId, promptId)
      .then(data => {
        const mapped = data.map(d => ({
          userId: d.user_id,
          displayName: '', // Will be enriched by component
          hasSubmitted: d.has_submitted,
        }))
        setStatuses(mapped)
        setAllSubmitted(mapped.length > 0 && mapped.every(s => s.hasSubmitted))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [groupId, promptId])

  return { statuses, allSubmitted, loading }
}
