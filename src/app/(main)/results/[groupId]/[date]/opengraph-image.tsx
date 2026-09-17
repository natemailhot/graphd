import { ImageResponse } from 'next/og'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getPromptByDate } from '@/lib/api/prompts'
import { computeAveragedPositions } from '@/lib/utils/averaging'
import { formatDate } from '@/lib/utils/dates'
import type { Profile } from '@/types/app'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const AVATAR_COLORS = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']
const CHART_SIZE = 440
const DOT_SIZE = 46

function colorForId(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default async function Image({
  params,
}: {
  params: Promise<{ groupId: string; date: string }>
}) {
  const { groupId, date } = await params
  const supabase = await createClient()

  const [{ data: group }, prompt] = await Promise.all([
    supabase.from('groups').select('name').eq('id', groupId).maybeSingle(),
    getPromptByDate(supabase, date).catch(() => null),
  ])

  const groupName = group?.name ?? 'Graphd'
  const xLabel = prompt?.x_axis_label ?? ''
  const yLabel = prompt?.y_axis_label ?? ''

  let dots: { id: string; x: number; y: number; profile: Profile }[] = []
  if (prompt) {
    // Faces/positions are only ever rendered once results are actually
    // published for this group — this uses the service role (bypasses RLS,
    // needed since group_members requires an authenticated session) so the
    // publication check below is the real privacy gate, not a nicety.
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const [{ data: published }, { data: members }, { data: placements }] = await Promise.all([
      serviceClient.from('result_publications').select('group_id').eq('group_id', groupId).eq('prompt_id', prompt.id).maybeSingle(),
      serviceClient.from('group_members').select('user_id, profiles(*)').eq('group_id', groupId),
      serviceClient.from('placements').select('target_user_id, x_value, y_value, placed_by').eq('group_id', groupId).eq('prompt_id', prompt.id),
    ])

    const memberCount = members?.length ?? 0
    const submittedCount = new Set((placements ?? []).map(p => p.placed_by)).size
    const isVisible = !!published || (memberCount > 0 && submittedCount >= memberCount)

    const profiles = isVisible
      ? (members ?? []).map(m => m.profiles as unknown as Profile).filter(Boolean)
      : []
    const placementRows = (isVisible ? placements ?? [] : []).map(p => ({
      id: '',
      group_id: groupId,
      prompt_id: prompt.id,
      placed_by: '',
      target_user_id: p.target_user_id,
      x_value: p.x_value,
      y_value: p.y_value,
      created_at: '',
    }))
    const averaged = computeAveragedPositions(placementRows, profiles)
    dots = averaged.slice(0, 14).map(a => ({ id: a.targetUserId, x: a.x, y: a.y, profile: a.profile }))
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#faf9ff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: 560,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 0 0 70px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 40,
              fontWeight: 900,
              color: '#f97316',
              marginBottom: 32,
            }}
          >
            graphd
          </div>
          <div
            style={{
              display: 'flex',
              padding: '10px 22px',
              borderRadius: 999,
              background: '#ede9fe',
              color: '#8b5cf6',
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 32,
              alignSelf: 'flex-start',
            }}
          >
            {groupName} · {formatDate(date)}
          </div>
          <div style={{ display: 'flex', fontSize: 46, fontWeight: 900, color: '#3b82f6' }}>
            {xLabel}?
          </div>
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 900, color: '#d1d5db', margin: '8px 0' }}>
            vs
          </div>
          <div style={{ display: 'flex', fontSize: 46, fontWeight: 900, color: '#fb7185' }}>
            {yLabel}?
          </div>
        </div>
        <div
          style={{
            width: 640,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: CHART_SIZE,
              height: CHART_SIZE,
              display: 'flex',
              background: '#ffffff',
              borderRadius: 24,
              border: '3px solid #e8e5f0',
            }}
          >
            <div style={{ position: 'absolute', left: CHART_SIZE / 2, top: 0, width: 2, height: CHART_SIZE, background: '#f1f0f7' }} />
            <div style={{ position: 'absolute', top: CHART_SIZE / 2, left: 0, height: 2, width: CHART_SIZE, background: '#f1f0f7' }} />
            {dots.map(dot => {
              const left = Math.min(Math.max(dot.x, 0), 1) * (CHART_SIZE - DOT_SIZE)
              const top = (1 - Math.min(Math.max(dot.y, 0), 1)) * (CHART_SIZE - DOT_SIZE)
              return (
                <div
                  key={dot.id}
                  style={{
                    position: 'absolute',
                    left,
                    top,
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid #ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    background: colorForId(dot.id),
                    color: '#ffffff',
                    fontSize: 20,
                    fontWeight: 900,
                  }}
                >
                  {dot.profile.avatar_url ? (
                    <img src={dot.profile.avatar_url} width={DOT_SIZE} height={DOT_SIZE} style={{ objectFit: 'cover' }} alt="" />
                  ) : (
                    dot.profile.display_name.charAt(0).toUpperCase()
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
