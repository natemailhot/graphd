'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/home'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirectTo)
      router.refresh()
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/callback` },
    })
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Link href="/" className="text-5xl font-black text-gradient">Graphd</Link>
        <p className="text-gray-400 mt-2 text-sm">Welcome back!</p>
      </div>

      <div className="card p-6 space-y-5">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-600 mb-1">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full input-field" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-600 mb-1">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full input-field" />
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <button type="submit" disabled={loading} className="w-full btn-primary py-2.5">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-gray-100" /></div>
          <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-400">or</span></div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => handleOAuth('google')} className="flex-1 btn-secondary py-2 text-sm">Google</button>
          <button onClick={() => handleOAuth('github')} className="flex-1 btn-secondary py-2 text-sm">GitHub</button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-gray-400">
        No account?{' '}
        <Link href={`/signup${redirectTo !== '/home' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-violet-500 hover:text-violet-600 font-bold">Sign up</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#faf9ff]">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
