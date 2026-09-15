import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const STEPS = [
  {
    emoji: '🎯',
    title: 'A new prompt every day',
    body: "Each day gets a two-axis prompt, like \"Best person to call at 3 AM\" vs. \"Most likely to BE calling at 3 AM.\" Every group you're in shares the same daily prompt.",
  },
  {
    emoji: '🫳',
    title: 'Place everyone on the chart',
    body: 'Drag each group member onto the scatter plot based on where you think they land on both axes at once — left/right for the X axis, up/down for the Y axis.',
  },
  {
    emoji: '🙈',
    title: 'No peeking until everyone submits',
    body: "Results stay hidden until every member has placed their friends — nobody can see who guessed what until the group is done. The host can publish early or preview results privately if people are taking forever.",
  },
  {
    emoji: '📊',
    title: 'See where everyone landed',
    body: "Once revealed, you'll see the group's averaged position for each person, quadrant awards (if the prompt has them), and how close your own guesses were to the group consensus.",
  },
  {
    emoji: '🏆',
    title: 'Accuracy & leaderboards',
    body: "Your accuracy score measures how close your placements were to the group average. Check the leaderboard for today's prompt, or all-time across every prompt your group has played.",
  },
  {
    emoji: '✏️',
    title: "Edit before it's revealed",
    body: "Changed your mind? You can go back and adjust your answers any time before the group's results are actually shown.",
  },
  {
    emoji: '👥',
    title: 'Groups need at least 4 people',
    body: 'Create a group or join one with an invite code. A group needs at least 4 members before the host can start the game, and new members can join and catch up any time.',
  },
  {
    emoji: '📤',
    title: 'Share the results',
    body: 'Once results are in, share a quick text recap — group name, top accuracy, and where everyone landed — straight to your group chat.',
  },
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

      <main className="max-w-xl mx-auto px-4 py-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-gray-800">How Graphd Works</h1>
          <p className="text-gray-400 text-sm">Graph your friends. Daily.</p>
        </div>

        <div className="space-y-3">
          {STEPS.map(step => (
            <div key={step.title} className="card rounded-2xl p-4 flex gap-3">
              <div className="text-2xl shrink-0">{step.emoji}</div>
              <div>
                <h2 className="font-bold text-gray-800 mb-1">{step.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        {!user && (
          <div className="flex gap-4 justify-center pt-4">
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
