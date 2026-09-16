'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { joinGroup } from '@/lib/api/groups'
import { useRouter } from 'next/navigation'

export function JoinGroupClient({ initialCode, isAuthenticated }: { initialCode: string; isAuthenticated: boolean }) {
  const [code, setCode] = useState(initialCode)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const redirectTarget = `/groups/join${code ? `?code=${code}` : ''}`

  if (!isAuthenticated) {
    return (
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-black text-gray-800 mb-6 text-center">Join Group</h1>
        <div className="card p-6 text-center space-y-4">
          <p className="text-gray-500">
            {code ? (
              <>You&apos;ve been invited with code <span className="font-mono font-bold tracking-widest">{code}</span>.</>
            ) : (
              'Sign in to join a group.'
            )}
          </p>
          <Link href={`/login?redirect=${encodeURIComponent(redirectTarget)}`} className="w-full btn-primary py-2.5 block">
            Sign in to join
          </Link>
          <p className="text-sm text-gray-400">
            No account?{' '}
            <Link href={`/signup?redirect=${encodeURIComponent(redirectTarget)}`} className="text-violet-500 hover:text-violet-600 font-bold">Sign up</Link>
          </p>
        </div>
      </div>
    )
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const group = await joinGroup(supabase, code, user.id)
      router.push(`/groups/${group.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-black text-gray-800 mb-6">Join Group</h1>
      <div className="card p-6">
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-bold text-gray-600 mb-1">Invite Code</label>
            <input id="code" type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required maxLength={6} className="w-full input-field uppercase tracking-[0.3em] text-center text-lg font-mono" placeholder="ABC123" />
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <button type="submit" disabled={loading || code.length < 6} className="w-full btn-primary py-2.5">
            {loading ? 'Joining...' : 'Join Group'}
          </button>
        </form>
      </div>
    </div>
  )
}
