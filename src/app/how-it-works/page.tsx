import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const STEPS = [
  {
    emoji: '🎯',
    title: 'A new prompt, every day',
    body: 'Two axes, like "Best person to call at 3 AM" vs. "Most likely to BE calling at 3 AM." Every group shares the same daily prompt.',
  },
  {
    emoji: '🫳',
    title: 'Place everyone on the chart',
    body: 'Drag each group member onto the scatter plot based on where you think they land on both axes at once.',
  },
  {
    emoji: '🙈',
    title: "No peeking 'til everyone's in",
    body: 'Results stay hidden until the whole group has placed their friends — nobody sees who guessed what until it\'s done.',
  },
  {
    emoji: '📊',
    title: 'See it all come together',
    body: "The group's averaged positions, quadrant awards, and how close your own guesses were to everyone else's.",
  },
]

const GOOD_TO_KNOW = [
  { emoji: '✏️', text: 'You can edit your answers any time before results are revealed.' },
  { emoji: '👥', text: 'Groups need at least 4 members before the host can start the game.' },
  { emoji: '⏱️', text: "Host can publish results early, or preview them privately, if people are dragging their feet." },
  { emoji: '🏆', text: "Accuracy leaderboards track today's prompt and all-time, per group." },
  { emoji: '📤', text: 'Share a quick text recap of results straight to your group chat.' },
]

export default async function HowItWorksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#faf9ff]">
      <nav className="sticky top-0 z-40 bg-white border-b-2 border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-gradient">
            Graphd
          </Link>
          <Link href={user ? '/home' : '/login'} className="text-sm font-bold text-gray-400 hover:text-violet-500 transition-colors">
            {user ? '← Back to app' : 'Sign in'}
          </Link>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-gray-800">How Graphd Works</h1>
          <p className="text-gray-400 text-sm">Graph your friends. Daily.</p>
        </div>

        {/* Mini scatter chart visual */}
        <div className="card rounded-2xl p-5">
          <svg viewBox="0 0 460 400" className="w-full mx-auto">
            <rect x="50" y="30" width="180" height="160" fill="rgba(244,63,94,0.04)" rx="4" />
            <rect x="230" y="30" width="180" height="160" fill="rgba(59,130,246,0.04)" rx="4" />
            <rect x="50" y="190" width="180" height="160" fill="rgba(234,179,8,0.04)" rx="4" />
            <rect x="230" y="190" width="180" height="160" fill="rgba(34,197,94,0.04)" rx="4" />

            <line x1="50" y1="190" x2="410" y2="190" stroke="#ddd6fe" strokeWidth="1.5" />
            <line x1="230" y1="30" x2="230" y2="350" stroke="#ddd6fe" strokeWidth="1.5" />

            <polygon points="410,190 403,186 403,194" fill="#c4b5fd" />
            <polygon points="50,190 57,186 57,194" fill="#c4b5fd" />
            <polygon points="230,30 226,37 234,37" fill="#c4b5fd" />
            <polygon points="230,350 226,343 234,343" fill="#c4b5fd" />

            <text x="50" y="208" textAnchor="start" fill="#a8a3b8" fontSize="10">Low</text>
            <text x="410" y="208" textAnchor="end" fill="#a8a3b8" fontSize="10">High</text>
            <text x="230" y="368" textAnchor="middle" fill="#a8a3b8" fontSize="10">Low</text>
            <text x="230" y="20" textAnchor="middle" fill="#a8a3b8" fontSize="10">High</text>

            {[
              { cx: 340, cy: 70, emoji: '🦊', color: '#f43f5e', glow: '#e11d48', name: 'Jake' },
              { cx: 130, cy: 100, emoji: '🐼', color: '#f97316', glow: '#ea580c', name: 'Sarah' },
              { cx: 300, cy: 240, emoji: '🐸', color: '#eab308', glow: '#ca8a04', name: 'Mike' },
              { cx: 100, cy: 270, emoji: '🦁', color: '#22c55e', glow: '#16a34a', name: 'Alex' },
              { cx: 360, cy: 150, emoji: '🐵', color: '#3b82f6', glow: '#2563eb', name: 'Emma' },
            ].map(({ cx, cy, emoji, color, glow, name }) => (
              <g key={name}>
                <circle cx={cx} cy={cy} r="22" fill={color} opacity="0.9" stroke={glow} strokeWidth="2" style={{ filter: `drop-shadow(0 3px 10px ${color}50)` }} />
                <text x={cx} y={cy} textAnchor="middle" dy="6" fontSize="16">{emoji}</text>
                <text x={cx} y={cy + 32} textAnchor="middle" fill="#9ca3af" fontSize="10">{name}</text>
              </g>
            ))}
          </svg>
        </div>

        <div className="space-y-3">
          {STEPS.map(step => (
            <div key={step.title} className="card rounded-2xl p-4 flex gap-3 items-start">
              <div className="text-3xl shrink-0">{step.emoji}</div>
              <div>
                <h2 className="font-bold text-gray-800 mb-0.5">{step.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card rounded-2xl p-5">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Good to know</h2>
          <ul className="space-y-2.5">
            {GOOD_TO_KNOW.map(item => (
              <li key={item.text} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="text-base shrink-0">{item.emoji}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {!user && (
          <div className="flex gap-4 justify-center pt-2">
            <Link href="/signup" className="btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
