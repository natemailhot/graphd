import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Client = SupabaseClient<Database>

export async function submitPromptSuggestion(
  supabase: Client,
  userId: string,
  xAxisLabel: string,
  yAxisLabel: string
) {
  const { error } = await supabase.from('prompt_suggestions').insert({
    submitted_by: userId,
    x_axis_label: xAxisLabel.trim(),
    y_axis_label: yAxisLabel.trim(),
  })
  if (error) throw error
}
