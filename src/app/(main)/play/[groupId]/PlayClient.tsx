'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { submitPlacements } from '@/lib/api/placements'
import { ScatterCanvas } from '@/components/scatter/ScatterCanvas'
import type { Profile, Prompt, PlacementPosition } from '@/types/app'
import { useRouter } from 'next/navigation'

interface PlayClientProps {
  groupId: string
  prompt: Prompt
  members: Profile[]
  currentUserId: string
  existingPositions: PlacementPosition[]
}

export function PlayClient({ groupId, prompt, members, currentUserId, existingPositions }: PlayClientProps) {
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  // Determine which members still need to be placed
  const otherMembers = members.filter(m => m.id !== currentUserId)
  const placedIds = new Set(existingPositions.map(p => p.targetUserId))
  const newMembers = otherMembers.filter(m => !placedIds.has(m.id))
  const isNewMemberMode = existingPositions.length > 0 && newMembers.length > 0

  const handleSubmit = async (positions: PlacementPosition[]) => {
    setSubmitting(true)
    try {
      const supabase = createClient()
      await submitPlacements(supabase, groupId, prompt.id, currentUserId, positions)
      router.push(`/results/${groupId}`)
    } catch {
      setSubmitting(false)
    }
  }

  // Show only unplaced members in new-member mode
  const membersForCanvas = isNewMemberMode ? newMembers : otherMembers

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-lg font-bold text-gray-800">
          {isNewMemberMode ? 'New members joined!' : 'Place your friends!'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {isNewMemberMode
            ? `Place ${newMembers.length} new member${newMembers.length !== 1 ? 's' : ''} on the chart`
            : 'Drag each person onto the chart'}
        </p>
      </div>
      <ScatterCanvas
        xLabel={prompt.x_axis_label}
        yLabel={prompt.y_axis_label}
        members={membersForCanvas}
        currentUserId={currentUserId}
        onSubmit={handleSubmit}
        initialPositions={[]}
        submitting={submitting}
      />
    </div>
  )
}
