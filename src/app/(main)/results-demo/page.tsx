'use client'

import { useState } from 'react'
import { ResultsChart } from '@/components/scatter/ResultsChart'
import { AccuracyPercentList } from '@/components/scatter/AccuracyPercentList'
import { AccuracyVectorList } from '@/components/scatter/AccuracyVectorList'
import type { AveragedPosition, PlacementPosition, Profile } from '@/types/app'

const CURRENT_USER_ID = 'me'

function mockProfile(id: string, display_name: string): Profile {
  return { id, display_name, avatar_url: null, created_at: new Date().toISOString() }
}

// Deliberately clustered pairs (Alex/Bailey, Casey/Drew) to demo decluttering.
const POSITIONS: AveragedPosition[] = [
  { targetUserId: 'alex', profile: mockProfile('alex', 'Alex'), x: 0.70, y: 0.60, count: 3 },
  { targetUserId: 'bailey', profile: mockProfile('bailey', 'Bailey'), x: 0.72, y: 0.58, count: 3 },
  { targetUserId: 'casey', profile: mockProfile('casey', 'Casey'), x: 0.25, y: 0.30, count: 3 },
  { targetUserId: 'drew', profile: mockProfile('drew', 'Drew'), x: 0.26, y: 0.32, count: 3 },
  { targetUserId: 'jordan', profile: mockProfile('jordan', 'Jordan'), x: 0.50, y: 0.50, count: 3 },
  { targetUserId: 'taylor', profile: mockProfile('taylor', 'Taylor'), x: 0.15, y: 0.85, count: 3 },
  { targetUserId: 'sam', profile: mockProfile('sam', 'Sam'), x: 0.85, y: 0.15, count: 3 },
  { targetUserId: CURRENT_USER_ID, profile: mockProfile(CURRENT_USER_ID, 'You'), x: 0.55, y: 0.65, count: 3 },
]

const MY_PLACEMENTS: PlacementPosition[] = [
  { targetUserId: 'alex', x: 0.75, y: 0.55 },
  { targetUserId: 'bailey', x: 0.40, y: 0.40 },
  { targetUserId: 'casey', x: 0.30, y: 0.35 },
  { targetUserId: 'drew', x: 0.60, y: 0.60 },
  { targetUserId: 'jordan', x: 0.52, y: 0.48 },
  { targetUserId: 'taylor', x: 0.20, y: 0.80 },
  { targetUserId: 'sam', x: 0.50, y: 0.50 },
]

const OTHERS = POSITIONS.filter(p => p.targetUserId !== CURRENT_USER_ID)

export default function ResultsDemoPage() {
  const [highlighted, setHighlighted] = useState<string | null>('alex')

  return (
    <div className="max-w-md mx-auto space-y-10 pb-16">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-black text-gray-800">Results Chart — Redesign Demo</h1>
        <p className="text-sm text-gray-400">Mock data — not connected to real groups</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-black text-violet-500 uppercase tracking-wide">Base chart (declutter + legend)</h2>
        <p className="text-xs text-gray-400">
          Alex/Bailey and Casey/Drew are deliberately placed almost on top of each other to show the
          overlap fix. Names moved to a legend below instead of cluttering the plot.
        </p>
        <ResultsChart
          xLabel="How much do you trust them around your significant other"
          yLabel="Would you let them date your child"
          positions={POSITIONS}
          currentUserId={CURRENT_USER_ID}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black text-violet-500 uppercase tracking-wide">Option A — Percentage match</h2>
        <p className="text-xs text-gray-400">One number per person, sorted best to worst, with an overall average up top.</p>
        <ResultsChart
          xLabel="How much do you trust them around your significant other"
          yLabel="Would you let them date your child"
          positions={POSITIONS}
          currentUserId={CURRENT_USER_ID}
          showLegend={false}
        />
        <AccuracyPercentList positions={OTHERS} myPlacements={MY_PLACEMENTS} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black text-violet-500 uppercase tracking-wide">Option B — Distance + direction</h2>
        <p className="text-xs text-gray-400">More precise: an arrow shows which way you were off, plus a distance value, sorted closest first.</p>
        <ResultsChart
          xLabel="How much do you trust them around your significant other"
          yLabel="Would you let them date your child"
          positions={POSITIONS}
          currentUserId={CURRENT_USER_ID}
          showLegend={false}
        />
        <AccuracyVectorList positions={OTHERS} myPlacements={MY_PLACEMENTS} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black text-violet-500 uppercase tracking-wide">Option C — Tap to highlight</h2>
        <p className="text-xs text-gray-400">Chart stays clean by default. Tap a name to see just that person&apos;s vector on the chart.</p>
        <ResultsChart
          xLabel="How much do you trust them around your significant other"
          yLabel="Would you let them date your child"
          positions={POSITIONS}
          currentUserId={CURRENT_USER_ID}
          myPlacements={MY_PLACEMENTS}
          highlightUserId={highlighted}
          showLegend={false}
        />
        <div className="flex flex-wrap justify-center gap-2">
          {OTHERS.map(pos => (
            <button
              key={pos.targetUserId}
              onClick={() => setHighlighted(h => h === pos.targetUserId ? null : pos.targetUserId)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors ${
                highlighted === pos.targetUserId
                  ? 'bg-rose-50 text-rose-500 border-rose-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-violet-200'
              }`}
            >
              {pos.profile.display_name}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
