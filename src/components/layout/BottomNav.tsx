'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Profile } from '@/types/app'
import { getAvatarEmoji } from '@/lib/utils/avatarEmoji'

interface BottomNavProps {
  profile: Profile | null
}

const ICONS = {
  home: (
    <path d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  ),
  groups: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      <circle cx="17" cy="8.5" r="2.5" />
      <path d="M15.5 14.2c2.9.5 5.5 2.8 5.5 5.8" />
    </>
  ),
  history: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2" />
      <path d="M9 2h6M12 2v3" />
    </>
  ),
}

function TabIcon({ name, active }: { name: keyof typeof ICONS; active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#8b5cf6' : '#9ca3af'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  )
}

export function BottomNav({ profile }: BottomNavProps) {
  const pathname = usePathname()

  const tabs = [
    { href: '/home', label: 'Home', icon: 'home' as const },
    { href: '/groups', label: 'Groups', icon: 'groups' as const },
    { href: '/history', label: 'History', icon: 'history' as const },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const profileActive = pathname === '/profile'

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-gray-100"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around h-16">
        {tabs.map(tab => {
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0"
            >
              <TabIcon name={tab.icon} active={active} />
              <span className={`text-[10px] font-bold ${active ? 'text-violet-500' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
        <Link
          href="/profile"
          className="flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0"
        >
          <div
            className={`w-[22px] h-[22px] rounded-full overflow-hidden flex items-center justify-center text-xs ${
              profileActive ? 'ring-2 ring-violet-400' : ''
            }`}
            style={{ background: profileActive ? '#8b5cf6' : '#c4b5fd' }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              profile ? getAvatarEmoji(profile.id) : '❓'
            )}
          </div>
          <span className={`text-[10px] font-bold ${profileActive ? 'text-violet-500' : 'text-gray-400'}`}>
            Profile
          </span>
        </Link>
      </div>
    </nav>
  )
}
