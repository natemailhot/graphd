'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { removeMember, transferHost, leaveGroup } from '@/lib/api/groups'
import type { GroupWithMembers } from '@/types/app'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const AVATAR_COLORS = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400']

interface GroupDetailClientProps {
  group: GroupWithMembers
  currentUserId: string
  userSubmitted: boolean
  allSubmitted: boolean
}

export function GroupDetailClient({ group, currentUserId, userSubmitted, allSubmitted }: GroupDetailClientProps) {
  const [copied, setCopied] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [confirmTransfer, setConfirmTransfer] = useState<string | null>(null)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isHost = group.created_by === currentUserId

  const [copiedLink, setCopiedLink] = useState(false)

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyInviteLink = () => {
    const link = `${window.location.origin}/groups/join?code=${group.invite_code}`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleRemove = async (userId: string) => {
    setLoading(true)
    try {
      const supabase = createClient()
      await removeMember(supabase, group.id, userId)
      router.refresh()
    } catch { /* ignore */ }
    setLoading(false)
    setConfirmRemove(null)
  }

  const handleTransfer = async (newHostId: string) => {
    setLoading(true)
    try {
      const supabase = createClient()
      await transferHost(supabase, group.id, newHostId)
      router.refresh()
    } catch { /* ignore */ }
    setLoading(false)
    setConfirmTransfer(null)
  }

  const handleLeave = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      await leaveGroup(supabase, group.id, currentUserId)
      router.push('/groups')
      router.refresh()
    } catch { /* ignore */ }
    setLoading(false)
    setConfirmLeave(false)
  }

  const canPlay = group.members.length >= group.min_members

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800">{group.name}</h1>
        <div className="mt-3 flex items-center gap-3">
          <code className="px-3 py-1.5 card text-sm font-mono font-bold text-violet-500 tracking-wider">{group.invite_code}</code>
          <button onClick={copyInviteCode} className="text-sm font-bold text-violet-400 hover:text-violet-500 transition-colors">
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          <span className="text-gray-200">|</span>
          <button onClick={copyInviteLink} className="text-sm font-bold text-violet-400 hover:text-violet-500 transition-colors">
            {copiedLink ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
          Members ({group.members.length}/{group.min_members} min)
        </h2>
        <div className="space-y-2">
          {group.members.map((member, i) => {
            const isSelf = member.id === currentUserId
            const isMemberHost = member.id === group.created_by

            return (
              <div key={member.id} className="flex items-center justify-between p-3 card">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-xs font-black text-white overflow-hidden`}>
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.display_name} className="w-full h-full object-cover" />
                    ) : (
                      member.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-700">
                      {member.display_name}
                      {isSelf && <span className="text-gray-300 ml-1 font-normal">(you)</span>}
                    </span>
                    {isMemberHost && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-500 border border-amber-200">
                        Host
                      </span>
                    )}
                  </div>
                </div>

                {/* Host controls for other members */}
                {isHost && !isSelf && (
                  <div className="flex items-center gap-2">
                    {confirmTransfer === member.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">Make host?</span>
                        <button
                          onClick={() => handleTransfer(member.id)}
                          disabled={loading}
                          className="text-xs font-bold text-amber-500 hover:text-amber-600"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmTransfer(null)}
                          className="text-xs font-bold text-gray-400"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmTransfer(member.id)}
                        className="text-xs font-bold text-amber-400 hover:text-amber-500 transition-colors"
                      >
                        Make Host
                      </button>
                    )}

                    {confirmRemove === member.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">Remove?</span>
                        <button
                          onClick={() => handleRemove(member.id)}
                          disabled={loading}
                          className="text-xs font-bold text-red-500 hover:text-red-600"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmRemove(null)}
                          className="text-xs font-bold text-gray-400"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRemove(member.id)}
                        className="text-xs font-bold text-red-300 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add members hint */}
      <div className="card p-4 text-center">
        <p className="text-sm text-gray-400">
          Share the invite code <span className="font-mono font-bold text-violet-500">{group.invite_code}</span> to add new members
        </p>
      </div>

      {!canPlay && (
        <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
          <p className="text-sm text-amber-600 font-bold">
            Need {group.min_members - group.members.length} more member{group.min_members - group.members.length !== 1 ? 's' : ''} to start playing!
          </p>
        </div>
      )}

      {canPlay && (
        <div className="space-y-3">
          {userSubmitted ? (
            <div className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-green-50 border-2 border-green-200 text-green-500 font-bold text-lg">
              <span className="w-3 h-3 rounded-full bg-green-400" />
              Submitted
            </div>
          ) : (
            <Link href={`/play/${group.id}`} className="block w-full btn-primary py-3 text-center text-lg">
              Play Today&apos;s Prompt
            </Link>
          )}
          <Link
            href={`/results/${group.id}`}
            className="block w-full btn-secondary py-3 text-center text-lg"
          >
            {allSubmitted ? 'View Results' : 'Waiting for Other Players...'}
          </Link>
        </div>
      )}

      {/* Leave group */}
      <div className="pt-4 border-t-2 border-gray-100">
        {isHost ? (
          <p className="text-xs text-gray-300 text-center">
            Transfer host to another member before leaving
          </p>
        ) : confirmLeave ? (
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-gray-500">Leave this group?</span>
            <button onClick={handleLeave} disabled={loading} className="text-sm font-bold text-red-500 hover:text-red-600">
              Yes, leave
            </button>
            <button onClick={() => setConfirmLeave(false)} className="text-sm font-bold text-gray-400">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmLeave(true)}
            className="w-full text-center text-sm font-bold text-red-300 hover:text-red-400 transition-colors"
          >
            Leave Group
          </button>
        )}
      </div>
    </div>
  )
}
