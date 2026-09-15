'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getCombinedPlayState, submitCombinedPlacements } from '@/lib/api/combinedPlay'
import { ScatterCanvas } from '@/components/scatter/ScatterCanvas'
import type { CombinedPlayState } from '@/lib/api/combinedPlay'
import type { PlacementPosition } from '@/types/app'

export function UnifiedPlayClient({ currentUserId }: { currentUserId: string }) {
  const [state, setState] = useState<CombinedPlayState | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    getCombinedPlayState(supabase, currentUserId)
      .then(setState)
      .finally(() => setLoading(false))
  }, [currentUserId])

  const handleSubmit = async (positions: PlacementPosition[]) => {
    if (!state?.prompt) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      await submitCombinedPlacements(supabase, currentUserId, state.prompt.id, state.groupsByTarget, positions)
      router.push('/home')
      router.refresh()
    } catch {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="card rounded-2xl p-8 text-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!state?.prompt) {
    return (
      <div className="card rounded-2xl p-8 text-center">
        <p className="text-gray-400 font-bold">No prompt available today.</p>
      </div>
    )
  }

  if (state.totalTargets === 0) {
    return (
      <div className="card rounded-2xl p-8 text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-800">No groups ready to play yet</h2>
        <p className="text-gray-400">A group needs at least 4 members and the host needs to start the game.</p>
        <Link href="/groups" className="inline-block mt-2 text-sm font-bold text-violet-400 hover:text-violet-500 transition-colors">
          Go to your groups
        </Link>
      </div>
    )
  }

  if (state.remaining.length === 0) {
    return (
      <div className="card rounded-2xl p-8 text-center space-y-2">
        <div className="text-3xl">🎉</div>
        <h2 className="text-xl font-bold text-gray-800">All caught up!</h2>
        <p className="text-gray-400">
          {state.ratedCount}/{state.totalTargets} graphed — you&apos;ve placed everyone across all your groups.
        </p>
        <Link href="/home" className="inline-block mt-2 text-sm font-bold text-violet-400 hover:text-violet-500 transition-colors">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-lg font-bold text-gray-800">Place your friends!</h1>
        <p className="text-sm text-gray-400 mt-1">
          One chart for everyone across all your groups — no one gets graphed twice.
        </p>
        <p className="text-xs font-bold text-violet-400 mt-2">
          {state.ratedCount}/{state.totalTargets} graphed
        </p>
      </div>
      <ScatterCanvas
        xLabel={state.prompt.x_axis_label}
        yLabel={state.prompt.y_axis_label}
        axisLabels={state.prompt.axis_labels}
        members={state.remaining}
        currentUserId={currentUserId}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  )
}
