'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils/dates'
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
}

export function UnifiedResultsClient({ groups, prompt, currentUserId, date }: UnifiedResultsClientProps) {
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0].id)
  const selectedGroup = groups.find(g => g.id === selectedGroupId) ?? groups[0]

  return (
    <div className="space-y-4">
      <div className="card p-6 text-center">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-violet-50 text-violet-400 border-2 border-violet-200 mb-4">
          {formatDate(date)}
        </span>
        <div className="space-y-3">
          <p className="text-lg font-black text-blue-500">{prompt.x_axis_label}?</p>
          <div className="text-2xl text-gray-200 font-black">vs</div>
          <p className="text-lg font-black text-rose-400">{prompt.y_axis_label}?</p>
        </div>
      </div>

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
