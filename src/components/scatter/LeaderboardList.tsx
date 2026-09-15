'use client'

import type { LeaderboardRow } from '@/types/app'

interface LeaderboardListProps {
  title: string
  rows: LeaderboardRow[]
  currentUserId: string
}

const MEDALS = ['🥇', '🥈', '🥉']

export function LeaderboardList({ title, rows, currentUserId }: LeaderboardListProps) {
  if (rows.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-black text-violet-500 uppercase tracking-wide text-center">{title}</h3>
      {rows.map((row, i) => {
        const isMe = row.user_id === currentUserId
        return (
          <div
            key={row.user_id}
            className={`flex items-center gap-3 p-2.5 card rounded-xl ${isMe ? 'ring-2 ring-violet-300' : ''}`}
          >
            <span className="w-6 text-center text-sm font-black text-gray-400 shrink-0">
              {MEDALS[i] ?? `#${i + 1}`}
            </span>
            <div className="w-7 h-7 rounded-full bg-violet-400 flex items-center justify-center text-[9px] font-black text-white overflow-hidden shrink-0">
              {row.avatar_url ? (
                <img src={row.avatar_url} alt={row.display_name} className="w-full h-full object-cover" />
              ) : (
                row.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              )}
            </div>
            <span className="flex-1 text-sm font-semibold text-gray-700 truncate">
              {row.display_name}
              {isMe && <span className="text-gray-400 font-normal"> (you)</span>}
            </span>
            <span className="text-xs font-black text-gray-600">{row.avg_match}%</span>
          </div>
        )
      })}
    </div>
  )
}
