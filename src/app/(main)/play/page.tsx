import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UnifiedPlayClient } from './UnifiedPlayClient'

export default async function UnifiedPlayPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { edit } = await searchParams

  return <UnifiedPlayClient currentUserId={user.id} editMode={edit === '1'} />
}
