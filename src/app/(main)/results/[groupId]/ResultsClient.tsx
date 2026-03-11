'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getGroupPlacements, getUserPlacements } from '@/lib/api/placements'
import { useRealtimeSubmissions } from '@/hooks/useRealtimeSubmissions'
import { useGroupMembers } from '@/hooks/useGroupMembers'
import { ResultsChart } from '@/components/scatter/ResultsChart'
import { computeAveragedPositions } from '@/lib/utils/averaging'
import type { Prompt, AveragedPosition, PlacementPosition } from '@/types/app'

interface ResultsClientProps {
  groupId: string
  prompt: Prompt
  currentUserId: string
}

export function ResultsClient({ groupId, prompt, currentUserId }: ResultsClientProps) {
  const { members } = useGroupMembers(groupId)
  const { submittedUserIds, totalMembers, allSubmitted } = useRealtimeSubmissions(groupId, prompt.id)
  const [averaged, setAveraged] = useState<AveragedPosition[]>([])
  const [myPlacements, setMyPlacements] = useState<PlacementPosition[]>([])
  const [showVectors, setShowVectors] = useState(false)

  useEffect(() => {
    if (!allSubmitted) return
    const supabase = createClient()

    Promise.all([
      getGroupPlacements(supabase, groupId, prompt.id),
      getUserPlacements(supabase, groupId, prompt.id, currentUserId),
    ]).then(([allPlacements, mine]) => {
      setAveraged(computeAveragedPositions(allPlacements, members))
      setMyPlacements(mine.map(p => ({
        targetUserId: p.target_user_id,
        x: p.x_value,
        y: p.y_value,
      })))
    })
  }, [allSubmitted, groupId, prompt.id, members, currentUserId])

  if (!allSubmitted) {
    return (
      <div className="space-y-6">
        <div className="card rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Waiting for everyone...</h2>
          <p className="text-gray-400">
            {submittedUserIds.size} of {totalMembers} submitted
          </p>
          <div className="flex justify-center gap-1.5 mt-4">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-400 bounce-dot" />
            <div className="w-2.5 h-2.5 rounded-full bg-violet-400 bounce-dot" />
            <div className="w-2.5 h-2.5 rounded-full bg-violet-400 bounce-dot" />
          </div>
        </div>

        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 card rounded-xl">
              <span className="text-sm text-gray-700">{m.display_name}</span>
              {submittedUserIds.has(m.id) ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-500 border border-green-200">Done</span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-300 border border-gray-200">Waiting</span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-green-50 text-green-500 border-2 border-green-200">
          Results
        </span>
        {myPlacements.length > 0 && (
          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
              showVectors
                ? 'bg-rose-50 text-rose-500 border-2 border-rose-200'
                : 'bg-white text-gray-400 border-2 border-gray-200 hover:border-violet-200'
            }`}
          >
            {showVectors ? 'Hide' : 'Show'} My Accuracy
          </button>
        )}
      </div>
      <ResultsChart
        xLabel={prompt.x_axis_label}
        yLabel={prompt.y_axis_label}
        positions={averaged}
        currentUserId={currentUserId}
        myPlacements={showVectors ? myPlacements : undefined}
      />
    </div>
  )
}
