'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getCombinedPlayState, submitCombinedPlacements, getRevealedGroupIds } from '@/lib/api/combinedPlay'
import { ScatterCanvas } from '@/components/scatter/ScatterCanvas'
import type { CombinedPlayState } from '@/lib/api/combinedPlay'
import type { PlacementPosition, Profile } from '@/types/app'

interface UnifiedPlayClientProps {
  currentUserId: string
  editMode?: boolean
  yesterdaysPrompt?: { x: string; y: string } | null
}

export function UnifiedPlayClient({ currentUserId, editMode = false, yesterdaysPrompt = null }: UnifiedPlayClientProps) {
  const [state, setState] = useState<CombinedPlayState | null>(null)
  const [revealedGroupIds, setRevealedGroupIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    getCombinedPlayState(supabase, currentUserId)
      .then(async s => {
        setState(s)
        if (editMode && s.prompt && s.readyGroupIds.length > 0) {
          const revealed = await getRevealedGroupIds(supabase, s.readyGroupIds, s.prompt.id).catch(() => new Set<string>())
          setRevealedGroupIds(revealed)
        }
      })
      .finally(() => setLoading(false))
  }, [currentUserId, editMode])

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

  const yesterdayLink = yesterdaysPrompt && (
    <div className="text-center">
      <Link href="/results" className="inline-block text-xs font-bold text-gray-400 hover:text-violet-500 transition-colors">
        ← See yesterday&apos;s results: {yesterdaysPrompt.x} vs {yesterdaysPrompt.y}
      </Link>
    </div>
  )

  let content: React.ReactNode

  if (loading) {
    content = (
      <div className="card rounded-2xl p-8 text-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  } else if (!state?.prompt) {
    content = (
      <div className="card rounded-2xl p-8 text-center">
        <p className="text-gray-400 font-bold">No prompt available today.</p>
      </div>
    )
  } else if (state.totalTargets === 0) {
    content = (
      <div className="card rounded-2xl p-8 text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-800">No groups ready to play yet</h2>
        <p className="text-gray-400">A group needs at least 4 members and the host needs to start the game.</p>
        <Link href="/groups" className="inline-block mt-2 text-sm font-bold text-violet-400 hover:text-violet-500 transition-colors">
          Go to your groups
        </Link>
      </div>
    )
  } else if (editMode) {
    const isLocked = (target: Profile) =>
      (state.groupsByTarget.get(target.id) ?? []).some(gid => revealedGroupIds.has(gid))
    const editableTargets = state.allTargets.filter(t => !isLocked(t))
    const lockedCount = state.allTargets.length - editableTargets.length
    const positionsById = new Map(state.existingPositions.map(p => [p.targetUserId, p]))
    const editableInitialPositions = editableTargets
      .map(t => positionsById.get(t.id))
      .filter((p): p is PlacementPosition => !!p)

    if (state.allTargets.length === 0) {
      content = (
        <div className="card rounded-2xl p-8 text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-800">Nothing to edit yet</h2>
          <p className="text-gray-400">Place some friends first, then come back to adjust them.</p>
          <Link href="/play" className="inline-block mt-2 text-sm font-bold text-violet-400 hover:text-violet-500 transition-colors">
            Go place your friends
          </Link>
        </div>
      )
    } else if (editableTargets.length === 0) {
      content = (
        <div className="card rounded-2xl p-8 text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-800">Nothing left to edit</h2>
          <p className="text-gray-400">Results are already out in every group you&apos;d be adjusting — those answers are locked in.</p>
          <Link href="/home" className="inline-block mt-2 text-sm font-bold text-violet-400 hover:text-violet-500 transition-colors">
            Back to Home
          </Link>
        </div>
      )
    } else {
      content = (
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-800">Edit your answers</h1>
            <p className="text-sm text-gray-400 mt-1">
              Drag anyone to update your answer, then resubmit — it updates every group they&apos;re shared in.
            </p>
            {lockedCount > 0 && (
              <p className="text-xs font-bold text-amber-500 mt-2">
                {lockedCount} {lockedCount === 1 ? 'person is' : 'people are'} locked — results already revealed in a shared group.
              </p>
            )}
          </div>
          <ScatterCanvas
            xLabel={state.prompt.x_axis_label}
            yLabel={state.prompt.y_axis_label}
            axisLabels={state.prompt.axis_labels}
            members={editableTargets}
            currentUserId={currentUserId}
            onSubmit={handleSubmit}
            initialPositions={editableInitialPositions}
            submitting={submitting}
          />
        </div>
      )
    }
  } else if (state.remaining.length === 0) {
    content = (
      <div className="card rounded-2xl p-8 text-center space-y-2">
        <div className="text-3xl">🎉</div>
        <h2 className="text-xl font-bold text-gray-800">All caught up!</h2>
        <p className="text-gray-400">
          {state.ratedCount}/{state.totalTargets} graphed — you&apos;ve placed everyone across all your groups.
        </p>
        <Link href="/play?edit=1" className="inline-block mt-2 text-sm font-bold text-violet-400 hover:text-violet-500 transition-colors">
          Edit your answers
        </Link>
      </div>
    )
  } else {
    content = (
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

  return (
    <div className="space-y-4">
      {yesterdayLink}
      {content}
    </div>
  )
}
