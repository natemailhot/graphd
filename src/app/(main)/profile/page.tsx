import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/api/auth'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile(supabase, user.id)

  return <ProfileClient profile={profile} />
}
