import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { getPromptByDate } from '@/lib/api/prompts'
import { formatDate } from '@/lib/utils/dates'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

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

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#faf9ff',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 10,
            position: 'absolute',
            top: 64,
            left: 80,
            fontSize: 40,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #f43f5e, #f97316, #eab308)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          graphd
        </div>
        <div
          style={{
            display: 'flex',
            padding: '10px 24px',
            borderRadius: 999,
            background: '#ede9fe',
            color: '#8b5cf6',
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 40,
          }}
        >
          {groupName} · {formatDate(date)}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 56,
            fontWeight: 900,
            color: '#3b82f6',
            textAlign: 'center',
            padding: '0 100px',
          }}
        >
          {xLabel}?
        </div>
        <div style={{ display: 'flex', fontSize: 36, fontWeight: 900, color: '#d1d5db', margin: '16px 0' }}>
          vs
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 56,
            fontWeight: 900,
            color: '#fb7185',
            textAlign: 'center',
            padding: '0 100px',
          }}
        >
          {yLabel}?
        </div>
      </div>
    ),
    { ...size }
  )
}
