'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate, getTodayUTC } from '@/lib/utils/dates'
import { ResultsClient } from './[groupId]/ResultsClient'
import type { Prompt } from '@/types/app'

interface GroupOption {
  id: string
  name: string
  created_by: string
}

interface UnifiedResultsClientProps {
  groups: GroupOption[]
  prompt: Prompt
  currentUserId: string
  date: string
  availableDates: string[]
  todaysPrompt: { x: string; y: string } | null
  tomorrowsPromptTeaser: string | null
}

export function UnifiedResultsClient({ groups, prompt, currentUserId, date, availableDates, todaysPrompt, tomorrowsPromptTeaser }: UnifiedResultsClientProps) {
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0].id)
  const selectedGroup = groups.find(g => g.id === selectedGroupId) ?? groups[0]
  const router = useRouter()
  const isToday = date === getTodayUTC()

  const dateIndex = availableDates.indexOf(date)
  const newerDate = dateIndex > 0 ? availableDates[dateIndex - 1] : null
  const olderDate = dateIndex !== -1 && dateIndex < availableDates.length - 1 ? availableDates[dateIndex + 1] : null

  return (
    <div className="space-y-4">
      <div className="card p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          {availableDates.length > 1 && (
            <button
              onClick={() => olderDate && router.push(`/results?date=${olderDate}`)}
              disabled={!olderDate}
              aria-label="Older day"
              className="w-7 h-7 rounded-full flex items-center justify-center text-violet-400 border-2 border-violet-200 bg-violet-50 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-violet-100 transition-colors"
            >
              ‹
            </button>
          )}
          {availableDates.length > 1 ? (
            <select
              value={date}
              onChange={e => router.push(`/results?date=${e.target.value}`)}
              className="text-xs font-black tracking-wide uppercase bg-violet-50 text-violet-400 border-2 border-violet-200 rounded-full px-3 py-1 appearance-none text-center cursor-pointer"
            >
              {availableDates.map(d => (
                <option key={d} value={d}>{formatDate(d)}</option>
              ))}
            </select>
          ) : (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-violet-50 text-violet-400 border-2 border-violet-200">
              {formatDate(date)}
            </span>
          )}
          {availableDates.length > 1 && (
            <button
              onClick={() => newerDate && router.push(`/results?date=${newerDate}`)}
              disabled={!newerDate}
              aria-label="Newer day"
              className="w-7 h-7 rounded-full flex items-center justify-center text-violet-400 border-2 border-violet-200 bg-violet-50 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-violet-100 transition-colors"
            >
              ›
            </button>
          )}
        </div>
        <div className="space-y-3">
          <p className="text-lg font-black text-blue-500">{prompt.x_axis_label}?</p>
          <div className="text-2xl text-gray-200 font-black">vs</div>
          <p className="text-lg font-black text-rose-400">{prompt.y_axis_label}?</p>
        </div>
        {!isToday && todaysPrompt && (
          <Link href="/play" className="inline-block mt-4 text-xs font-bold text-gray-400 hover:text-violet-500 transition-colors">
            Play today&apos;s prompt: {todaysPrompt.x} vs {todaysPrompt.y} →
          </Link>
        )}
      </div>

      {tomorrowsPromptTeaser && (
        <div className="card rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-center">
          <span className="text-lg">🔮</span>
          <p className="text-sm text-gray-500">
            <span className="font-black text-violet-500 uppercase tracking-wide text-xs">Sneak peek</span>
            {' — tomorrow: '}
            <span className="font-bold text-gray-700">{tomorrowsPromptTeaser}...?</span>
          </p>
        </div>
      )}

      {groups.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGroupId(g.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                g.id === selectedGroup.id
                  ? 'bg-violet-500 text-white'
                  : 'bg-white text-gray-400 border-2 border-gray-200 hover:border-violet-200'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      <ResultsClient
        key={selectedGroup.id}
        groupId={selectedGroup.id}
        groupName={selectedGroup.name}
        prompt={prompt}
        currentUserId={currentUserId}
        isHost={selectedGroup.created_by === currentUserId}
      />
    </div>
  )
}
