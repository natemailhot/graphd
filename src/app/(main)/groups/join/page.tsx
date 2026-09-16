import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { JoinGroupClient } from './JoinGroupClient'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}): Promise<Metadata> {
  const { code } = await searchParams
  let groupName: string | null = null
  if (code) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('groups')
      .select('name')
      .eq('invite_code', code.toUpperCase())
      .maybeSingle()
    groupName = data?.name ?? null
  }
  const title = 'Join my graphd group'
  const description = groupName
    ? `You're invited to join ${groupName} on Graphd — rate your friends together daily.`
    : "You're invited to join a group on Graphd — rate your friends together daily."
  return { title, description, openGraph: { title, description } }
}

export default async function JoinGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <JoinGroupClient initialCode={(code ?? '').toUpperCase()} isAuthenticated={!!user} />
}
