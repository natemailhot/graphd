'use client'

import { Suspense, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { joinGroup } from '@/lib/api/groups'
import { useRouter, useSearchParams } from 'next/navigation'

function JoinForm() {
  const searchParams = useSearchParams()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const codeParam = searchParams.get('code')
    if (codeParam) {
      setCode(codeParam.toUpperCase())
    }
  }, [searchParams])

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
    } catch (e: any) {
      setError(e.message)
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

export default function JoinGroupPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  )
}
