'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { submitPromptSuggestion } from '@/lib/api/promptSuggestions'

export function SuggestPromptForm({ currentUserId }: { currentUserId: string }) {
  const [xAxisLabel, setXAxisLabel] = useState('')
  const [yAxisLabel, setYAxisLabel] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!xAxisLabel.trim() || !yAxisLabel.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const supabase = createClient()
      await submitPromptSuggestion(supabase, currentUserId, xAxisLabel, yAxisLabel)
      setXAxisLabel('')
      setYAxisLabel('')
      setSubmitted(true)
    } catch {
      setError('Something went wrong — try again?')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card p-4 space-y-3">
      <div>
        <h2 className="text-sm font-black text-gray-800">Got a prompt idea?</h2>
        <p className="text-xs text-gray-400 mt-0.5">Suggest a new &quot;X vs Y&quot; and we&apos;ll consider it for a future day.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={xAxisLabel}
          onChange={e => setXAxisLabel(e.target.value)}
          placeholder="e.g. Best person to bring on a road trip"
          required
          className="w-full input-field text-sm"
        />
        <input
          type="text"
          value={yAxisLabel}
          onChange={e => setYAxisLabel(e.target.value)}
          placeholder="e.g. Most likely to get you lost"
          required
          className="w-full input-field text-sm"
        />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        <button type="submit" disabled={submitting} className="w-full btn-secondary py-2 text-sm">
          {submitting ? 'Sending...' : submitted ? 'Sent — thanks! Suggest another?' : 'Suggest it'}
        </button>
      </form>
    </div>
  )
}
