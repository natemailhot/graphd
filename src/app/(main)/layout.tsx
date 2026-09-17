import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/api/auth'
import Link from 'next/link'
import { LogoutButton } from '@/components/layout/LogoutButton'
import { BottomNav } from '@/components/layout/BottomNav'
import { getAvatarEmoji } from '@/lib/utils/avatarEmoji'

const PUBLIC_PREVIEW_PATHS = ['/play', '/groups/join']
const PUBLIC_PREVIEW_PATTERN = /^\/results\/[^/]+\/[^/]+$/

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const hdrs = await headers()
  const currentPathname = hdrs.get('x-pathname') ?? ''
  const isPublicPreview =
    PUBLIC_PREVIEW_PATHS.includes(currentPathname) || PUBLIC_PREVIEW_PATTERN.test(currentPathname)

  if (!user && !isPublicPreview) {
    redirect('/login')
  }

  const profile = user ? await getProfile(supabase, user.id).catch(() => null) : null

  return (
    <div className="min-h-screen bg-[#faf9ff]">
      <nav className="sticky top-0 z-40 bg-white border-b-2 border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/home" className="text-2xl font-black text-gradient">
            Graphd
          </Link>
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-5">
                <Link href="/home" className="text-sm font-bold text-gray-400 hover:text-violet-500 transition-colors">Home</Link>
                <Link href="/groups" className="text-sm font-bold text-gray-400 hover:text-violet-500 transition-colors">Groups</Link>
                <Link href="/results" className="text-sm font-bold text-gray-400 hover:text-violet-500 transition-colors">Results</Link>
                <Link href="/history" className="text-sm font-bold text-gray-400 hover:text-violet-500 transition-colors">History</Link>
                <Link href="/how-it-works" className="text-sm font-bold text-gray-400 hover:text-violet-500 transition-colors">How It Works</Link>
                <Link href="/profile" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-violet-500 transition-colors">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover border-2 border-gray-200" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-violet-400 flex items-center justify-center text-xs">
                      {profile ? getAvatarEmoji(profile.id) : '❓'}
                    </div>
                  )}
                  Profile
                </Link>
                <LogoutButton />
              </div>
              <div className="md:hidden">
                <LogoutButton />
              </div>
            </>
          ) : (
            <Link href="/login" className="text-sm font-bold text-violet-500 hover:text-violet-600 transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
      {user && <BottomNav profile={profile} />}
    </div>
  )
}
