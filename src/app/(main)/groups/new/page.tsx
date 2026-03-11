'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createGroup } from '@/lib/api/groups'
import { useRouter } from 'next/navigation'

export default function NewGroupPage() {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const group = await createGroup(supabase, name, user.id)
      router.push(`/groups/${group.id}`)
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-black text-gray-800 mb-6">Create Group</h1>
      <div className="card p-6">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-gray-600 mb-1">Group Name</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full input-field" placeholder="The Squad" />
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <button type="submit" disabled={loading} className="w-full btn-primary py-2.5">
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  )
}
