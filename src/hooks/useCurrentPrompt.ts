'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getTodayPrompt } from '@/lib/api/prompts'
import type { Prompt } from '@/types/app'

export function useCurrentPrompt() {
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    getTodayPrompt(supabase)
      .then(setPrompt)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { prompt, loading, error }
}
