'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, uploadAvatar } from '@/lib/api/auth'
import { getUserAccuracySummary } from '@/lib/api/placements'
import { ImageCropper } from '@/components/ui/ImageCropper'
import { getAvatarEmoji } from '@/lib/utils/avatarEmoji'
import type { Profile, UserAccuracySummary } from '@/types/app'

export function ProfileClient({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [accuracy, setAccuracy] = useState<UserAccuracySummary | null>(null)

  useEffect(() => {
    const supabase = createClient()
    getUserAccuracySummary(supabase)
      .then(setAccuracy)
      .catch(() => {})
  }, [])

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropDone = async (blob: Blob) => {
    setCropSrc(null)
    setSaving(true)
    try {
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      const supabase = createClient()
      const url = await uploadAvatar(supabase, profile.id, file)
      setAvatarUrl(url)
      setMessage('Avatar updated!')
    } catch (err: any) { setMessage('Error: ' + err.message) }
    setSaving(false)
  }

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <h1 className="text-2xl font-black text-gray-800">Profile</h1>
      <div className="card p-6 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-violet-400 flex items-center justify-center text-3xl overflow-hidden border-3 border-violet-300">
            {avatarUrl ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" /> : getAvatarEmoji(profile.id)}
          </div>
          <label className="text-sm font-bold text-violet-400 hover:text-violet-500 cursor-pointer transition-colors">
            Change avatar
            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </label>
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-gray-600 mb-1">Display Name</label>
          <input id="name" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full input-field" />
        </div>
        {message && <p className={`text-sm font-bold ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
        <button onClick={handleSave} disabled={saving} className="w-full btn-primary py-2.5">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {accuracy && accuracy.total_placements > 0 && (
        <div className="card p-6 space-y-4">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider text-center">All-Time Accuracy</h2>
          <p className="text-center text-4xl font-black text-violet-500">{accuracy.overall_avg_match}%</p>

          <div className="space-y-2">
            {accuracy.most_accurate_name && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-violet-50 border-2 border-violet-200">
                <div>
                  <p className="text-[10px] font-black text-violet-500 uppercase tracking-wide">🔮 Your Soulmate</p>
                  <p className="text-sm font-bold text-gray-700">{accuracy.most_accurate_name}</p>
                </div>
                <span className="text-sm font-black text-violet-500">{accuracy.most_accurate_match}%</span>
              </div>
            )}
            {accuracy.least_accurate_name && accuracy.least_accurate_name !== accuracy.most_accurate_name && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border-2 border-rose-200">
                <div>
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-wide">🎰 Your Wildcard</p>
                  <p className="text-sm font-bold text-gray-700">{accuracy.least_accurate_name}</p>
                </div>
                <span className="text-sm font-black text-rose-500">{accuracy.least_accurate_match}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      <Link
        href="/how-it-works"
        className="block text-center text-sm font-bold text-violet-400 hover:text-violet-500 transition-colors"
      >
        How does Graphd work?
      </Link>

      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          cropShape="round"
          aspect={1}
          onCropDone={handleCropDone}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </div>
  )
}
