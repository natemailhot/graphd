'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/home'

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirectTo)
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Link href="/" className="text-5xl font-black text-gradient">Graphd</Link>
        <p className="text-gray-400 mt-2 text-sm">Create your account</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-gray-600 mb-1">Display Name</label>
            <input id="name" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required className="w-full input-field" placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-600 mb-1">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full input-field" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-600 mb-1">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full input-field" />
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <button type="submit" disabled={loading} className="w-full btn-primary py-2.5">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link href={`/login${redirectTo !== '/home' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-violet-500 hover:text-violet-600 font-bold">Sign in</Link>
      </p>
    </div>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#faf9ff]">
      <Suspense>
        <SignupForm />
      </Suspense>
    </div>
  )
}
