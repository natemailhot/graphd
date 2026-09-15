import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UnifiedPlayClient } from './UnifiedPlayClient'

export default async function UnifiedPlayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <UnifiedPlayClient currentUserId={user.id} />
}
