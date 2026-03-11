'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, uploadAvatar } from '@/lib/api/auth'
import type { Profile } from '@/types/app'

export function ProfileClient({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const supabase = createClient()
      await updateProfile(supabase, profile.id, { display_name: displayName })
      setMessage('Saved!')
    } catch (e: any) { setMessage(e.message) }
    setSaving(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    try {
      const supabase = createClient()
      const url = await uploadAvatar(supabase, profile.id, file)
      setAvatarUrl(url)
      setMessage('Avatar updated!')
    } catch (err: any) { setMessage(err.message) }
    setSaving(false)
  }

  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <h1 className="text-2xl font-black text-gray-800">Profile</h1>
      <div className="card p-6 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-violet-400 flex items-center justify-center text-xl font-black text-white overflow-hidden border-3 border-violet-300">
            {avatarUrl ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" /> : initials}
          </div>
          <label className="text-sm font-bold text-violet-400 hover:text-violet-500 cursor-pointer transition-colors">
            Change avatar
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </label>
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-gray-600 mb-1">Display Name</label>
          <input id="name" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full input-field" />
        </div>
        {message && <p className="text-sm font-bold text-green-500">{message}</p>}
        <button onClick={handleSave} disabled={saving} className="w-full btn-primary py-2.5">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}
