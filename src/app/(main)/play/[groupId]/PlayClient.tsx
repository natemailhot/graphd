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
  const [submitted, setSubmitted] = useState(existingPositions.length > 0)
  const router = useRouter()

  const handleSubmit = async (positions: PlacementPosition[]) => {
    setSubmitting(true)
    try {
      const supabase = createClient()
      await submitPlacements(supabase, groupId, prompt.id, currentUserId, positions)
      setSubmitted(true)
      router.push(`/results/${groupId}`)
    } catch {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center space-y-4">
        <div className="card rounded-2xl p-8">
          <div className="text-4xl mb-3 text-green-500">&#10003;</div>
          <h2 className="text-xl font-bold text-gray-800">Submitted!</h2>
          <p className="text-gray-400 mt-2">Waiting for others to finish...</p>
        </div>
        <button onClick={() => router.push(`/results/${groupId}`)} className="btn-secondary">
          View Results
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-lg font-bold text-gray-800">Place your friends!</h1>
        <p className="text-sm text-gray-400 mt-1">Drag each person onto the chart</p>
      </div>
      <ScatterCanvas
        xLabel={prompt.x_axis_label}
        yLabel={prompt.y_axis_label}
        members={members.filter(m => m.id !== currentUserId)}
        currentUserId={currentUserId}
        onSubmit={handleSubmit}
        initialPositions={existingPositions}
        submitting={submitting}
      />
    </div>
  )
}
