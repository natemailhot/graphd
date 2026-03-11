import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTodayPrompt } from '@/lib/api/prompts'

export default async function LandingPage() {
  const prompt = await getTodayPrompt(await createClient()).catch(() => null)

  const xLabel = prompt?.x_axis_label ?? 'X Axis'
  const yLabel = prompt?.y_axis_label ?? 'Y Axis'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12 relative overflow-hidden">
      <div className="text-center w-full max-w-xl relative z-10">
        <div className="mb-5">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-violet-50 text-violet-500 border border-violet-200">
            Daily Social Game
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold mb-3 tracking-tight">
          <span className="text-gradient">Graphd</span>
        </h1>

        <p className="text-lg text-gray-600 mb-1 font-medium">
          Graph your friends. Daily.
        </p>
        <p className="text-gray-400 mb-8 leading-relaxed text-sm">
          Each day, place your group on a new scatter plot.
          Once everyone submits, see where you all landed.
        </p>

        {/* Full scatter chart */}
        <div className="card rounded-2xl p-5 sm:p-6 mb-8">
          {prompt && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Today&apos;s Prompt</p>
          )}
          <svg viewBox="0 0 460 440" className="w-full mx-auto">
            {/* Quadrant background tints */}
            <rect x="50" y="30" width="180" height="180" fill="rgba(244,63,94,0.04)" rx="4" />
            <rect x="230" y="30" width="180" height="180" fill="rgba(59,130,246,0.04)" rx="4" />
            <rect x="50" y="210" width="180" height="180" fill="rgba(234,179,8,0.04)" rx="4" />
            <rect x="230" y="210" width="180" height="180" fill="rgba(34,197,94,0.04)" rx="4" />

            {/* Cross axes */}
            <line x1="50" y1="210" x2="410" y2="210" stroke="#ddd6fe" strokeWidth="1.5" />
            <line x1="230" y1="30" x2="230" y2="390" stroke="#ddd6fe" strokeWidth="1.5" />

            {/* Axis arrows */}
            <polygon points="410,210 403,206 403,214" fill="#c4b5fd" />
            <polygon points="50,210 57,206 57,214" fill="#c4b5fd" />
            <polygon points="230,30 226,37 234,37" fill="#c4b5fd" />
            <polygon points="230,390 226,383 234,383" fill="#c4b5fd" />

            {/* X axis endpoint labels */}
            <text x="50" y="228" textAnchor="start" fill="#a8a3b8" fontSize="10">No trust</text>
            <text x="410" y="228" textAnchor="end" fill="#a8a3b8" fontSize="10">Total trust</text>

            {/* Y axis endpoint labels */}
            <text x="230" y="404" textAnchor="middle" fill="#a8a3b8" fontSize="10">Heck no</text>
            <text x="230" y="24" textAnchor="middle" fill="#a8a3b8" fontSize="10">Totally</text>

            {/* X axis label (bottom) */}
            <text x="230" y="430" textAnchor="middle" fill="#8b5cf6" fontSize="12" fontWeight="600">{xLabel}?</text>

            {/* Y axis label (left) */}
            <text x="14" y="210" textAnchor="middle" fill="#f43f5e" fontSize="12" fontWeight="600" transform="rotate(-90, 14, 210)">{yLabel}?</text>

            {/* Example friend avatars scattered across quadrants */}
            {[
              { cx: 340, cy: 80, color: '#f43f5e', glow: '#e11d48', initials: 'JD', name: 'Jake' },
              { cx: 130, cy: 120, color: '#f97316', glow: '#ea580c', initials: 'SK', name: 'Sarah' },
              { cx: 310, cy: 270, color: '#eab308', glow: '#ca8a04', initials: 'MR', name: 'Mike' },
              { cx: 110, cy: 310, color: '#22c55e', glow: '#16a34a', initials: 'AL', name: 'Alex' },
              { cx: 360, cy: 170, color: '#3b82f6', glow: '#2563eb', initials: 'EM', name: 'Emma' },
            ].map(({ cx, cy, color, glow, initials, name }) => (
              <g key={initials}>
                <circle cx={cx} cy={cy} r="24" fill={color} opacity="0.9" stroke={glow} strokeWidth="2" style={{ filter: `drop-shadow(0 3px 10px ${color}50)` }} />
                <text x={cx} y={cy} textAnchor="middle" dy="5" fill="white" fontSize="11" fontWeight="bold">{initials}</text>
                <text x={cx} y={cy + 34} textAnchor="middle" fill="#9ca3af" fontSize="10">{name}</text>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="btn-primary text-lg px-8 py-3">
            Get Started
          </Link>
          <Link href="/login" className="btn-secondary text-lg px-8 py-3">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
