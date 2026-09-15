'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getGroupPlacements, getUserPlacements, publishResults, getGroupLeaderboard } from '@/lib/api/placements'
import { useRealtimeSubmissions } from '@/hooks/useRealtimeSubmissions'
import { useGroupMembers } from '@/hooks/useGroupMembers'
import { ResultsChart } from '@/components/scatter/ResultsChart'
import { AccuracyPercentList } from '@/components/scatter/AccuracyPercentList'
import { AwardsPanel } from '@/components/scatter/AwardsPanel'
import { LeaderboardList } from '@/components/scatter/LeaderboardList'
import { computeAveragedPositions } from '@/lib/utils/averaging'
import { buildShareText } from '@/lib/utils/shareText'
import type { Prompt, AveragedPosition, PlacementPosition, LeaderboardRow } from '@/types/app'

interface ResultsClientProps {
  groupId: string
  groupName: string
  prompt: Prompt
  currentUserId: string
  isHost: boolean
}

export function ResultsClient({ groupId, groupName, prompt, currentUserId, isHost }: ResultsClientProps) {
  const { members } = useGroupMembers(groupId)
  const { submittedUserIds, totalMembers, allSubmitted, isPublished } = useRealtimeSubmissions(groupId, prompt.id)
  const [averaged, setAveraged] = useState<AveragedPosition[]>([])
  const [myPlacements, setMyPlacements] = useState<PlacementPosition[]>([])
  const [showVectors, setShowVectors] = useState(false)
  const [highlightedUserId, setHighlightedUserId] = useState<string | null>(null)
  const [overrideView, setOverrideView] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [todayLeaderboard, setTodayLeaderboard] = useState<LeaderboardRow[]>([])
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardRow[]>([])
  const [leaderboardScope, setLeaderboardScope] = useState<'today' | 'allTime'>('today')
  const [shareCopied, setShareCopied] = useState(false)

  const showResults = allSubmitted || overrideView || isPublished

  const handleShare = async () => {
    const text = buildShareText({ groupName, prompt, positions: averaged, todayLeaderboard })
    if (navigator.share) {
      try {
        await navigator.share({ text })
        return
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return // user cancelled the share sheet
        // fall through to clipboard fallback
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      // nothing more we can do
    }
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const supabase = createClient()
      await publishResults(supabase, groupId, prompt.id, currentUserId)
    } catch {
      // realtime/refresh will just leave it unpublished if this failed
    }
    setPublishing(false)
  }

  useEffect(() => {
    if (!showResults) return
    const supabase = createClient()

    Promise.all([
      getGroupPlacements(supabase, groupId, prompt.id),
      getUserPlacements(supabase, groupId, prompt.id, currentUserId),
      getGroupLeaderboard(supabase, groupId, prompt.id),
      getGroupLeaderboard(supabase, groupId),
    ]).then(([allPlacements, mine, todayBoard, allTimeBoard]) => {
      setAveraged(computeAveragedPositions(allPlacements, members))
      setMyPlacements(mine.map(p => ({
        targetUserId: p.target_user_id,
        x: p.x_value,
        y: p.y_value,
      })))
      setTodayLeaderboard(todayBoard)
      setAllTimeLeaderboard(allTimeBoard)
    })
  }, [showResults, groupId, prompt.id, members, currentUserId])

  if (!showResults) {
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
          {isHost && (
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-5">
              <button
                onClick={() => setOverrideView(true)}
                className="text-xs font-bold text-violet-400 hover:text-violet-500 transition-colors"
              >
                View results anyway
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
              >
                {publishing ? 'Publishing...' : 'Publish results to everyone'}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {members.map(m => {
            const isMe = m.id === currentUserId
            const hasSubmitted = submittedUserIds.has(m.id)
            return (
              <div key={m.id} className="flex items-center justify-between p-3 card rounded-xl">
                <span className="text-sm text-gray-700">{m.display_name}</span>
                {hasSubmitted && isMe ? (
                  <Link
                    href={`/play/${groupId}?edit=1`}
                    className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-500 border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    Submitted (edit)
                  </Link>
                ) : hasSubmitted ? (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-500 border border-green-200">Submitted</span>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-300 border border-gray-200">Waiting</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!allSubmitted && isPublished && (
        <p className="text-center text-xs font-bold text-rose-500 bg-rose-50 border border-rose-200 rounded-full px-3 py-1 inline-block mx-auto">
          Published early by host — {submittedUserIds.size} of {totalMembers} submitted
        </p>
      )}
      {!allSubmitted && !isPublished && (
        <p className="text-center text-xs font-bold text-amber-500 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 inline-block mx-auto">
          Partial results (only visible to you) — {submittedUserIds.size} of {totalMembers} submitted
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-green-50 text-green-500 border-2 border-green-200">
          Results
        </span>
        {myPlacements.length > 0 && (
          <button
            onClick={() => {
              setShowVectors(!showVectors)
              setHighlightedUserId(null)
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
              showVectors
                ? 'bg-rose-50 text-rose-500 border-2 border-rose-200'
                : 'bg-white text-gray-400 border-2 border-gray-200 hover:border-violet-200'
            }`}
          >
            {showVectors ? 'Hide' : 'Show'} My Accuracy
          </button>
        )}
        <button
          onClick={handleShare}
          className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-white text-gray-400 border-2 border-gray-200 hover:border-violet-200 transition-all"
        >
          {shareCopied ? 'Copied!' : 'Share Results'}
        </button>
      </div>
      <ResultsChart
        xLabel={prompt.x_axis_label}
        yLabel={prompt.y_axis_label}
        axisLabels={prompt.axis_labels}
        positions={averaged}
        currentUserId={currentUserId}
        myPlacements={showVectors ? myPlacements : undefined}
        highlightUserId={showVectors ? highlightedUserId : null}
      />
      {showVectors && (
        <AccuracyPercentList
          positions={averaged}
          myPlacements={myPlacements}
          selectedUserId={highlightedUserId}
          onSelect={id => setHighlightedUserId(h => h === id ? null : id)}
        />
      )}
      {prompt.award_labels && (
        <AwardsPanel positions={averaged} awardLabels={prompt.award_labels} />
      )}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setLeaderboardScope('today')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              leaderboardScope === 'today'
                ? 'bg-violet-500 text-white'
                : 'bg-white text-gray-400 border-2 border-gray-200 hover:border-violet-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setLeaderboardScope('allTime')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              leaderboardScope === 'allTime'
                ? 'bg-violet-500 text-white'
                : 'bg-white text-gray-400 border-2 border-gray-200 hover:border-violet-200'
            }`}
          >
            All-Time
          </button>
        </div>
        <LeaderboardList
          title={leaderboardScope === 'today' ? "Today's Accuracy Leaderboard" : 'All-Time Accuracy Leaderboard'}
          rows={leaderboardScope === 'today' ? todayLeaderboard : allTimeLeaderboard}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  )
}
