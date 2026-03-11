import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { getTodayUTC } from '@/lib/utils/dates'

type Client = SupabaseClient<Database>

export async function getTodayPrompt(supabase: Client) {
  const today = getTodayUTC()

  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('prompt_date', today)
    .single()

  if (error && error.code === 'PGRST116') {
    // No prompt assigned for today - trigger self-healing assignment
    return await assignDailyPrompt(supabase)
  }
  if (error) throw error
  return data
}

async function assignDailyPrompt(supabase: Client) {
  const today = getTodayUTC()

  // Pick a random unscheduled prompt
  const { data: unscheduled, error: fetchError } = await supabase
    .from('prompts')
    .select('*')
    .is('prompt_date', null)
    .limit(1)
  if (fetchError) throw fetchError
  if (!unscheduled || unscheduled.length === 0) return null

  const prompt = unscheduled[0]
  const { data, error } = await supabase
    .from('prompts')
    .update({ prompt_date: today })
    .eq('id', prompt.id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getPromptByDate(supabase: Client, date: string) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('prompt_date', date)
    .single()
  if (error) throw error
  return data
}

export async function getPastPrompts(supabase: Client, limit = 30) {
  const today = getTodayUTC()
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .not('prompt_date', 'is', null)
    .lte('prompt_date', today)
    .order('prompt_date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}
