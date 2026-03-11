import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/api/auth'
import Link from 'next/link'
import { LogoutButton } from '@/components/layout/LogoutButton'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getProfile(supabase, user.id).catch(() => null)

  return (
    <div className="min-h-screen bg-[#faf9ff]">
      <nav className="sticky top-0 z-40 bg-white border-b-2 border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/home" className="text-2xl font-black text-gradient">
            Graphd
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/home" className="text-sm font-bold text-gray-400 hover:text-violet-500 transition-colors">Home</Link>
            <Link href="/groups" className="text-sm font-bold text-gray-400 hover:text-violet-500 transition-colors">Groups</Link>
            <Link href="/history" className="text-sm font-bold text-gray-400 hover:text-violet-500 transition-colors">History</Link>
            <Link href="/profile" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-violet-500 transition-colors">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover border-2 border-gray-200" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-violet-400 flex items-center justify-center text-[8px] font-black text-white">
                  {profile?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'}
                </div>
              )}
              Profile
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
