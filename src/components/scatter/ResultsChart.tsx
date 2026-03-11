'use client'

import type { AveragedPosition, PlacementPosition } from '@/types/app'

const SIZE = 460
const MARGIN = 50
const LEFT = MARGIN
const RIGHT = SIZE - MARGIN
const TOP = MARGIN
const BOTTOM = SIZE - MARGIN
const CENTER_X = (LEFT + RIGHT) / 2
const CENTER_Y = (TOP + BOTTOM) / 2
const PLOT_W = RIGHT - LEFT
const PLOT_H = BOTTOM - TOP

const AVATAR_COLORS = [
  { bg: '#f43f5e', ring: '#e11d48' },
  { bg: '#f97316', ring: '#ea580c' },
  { bg: '#eab308', ring: '#ca8a04' },
  { bg: '#22c55e', ring: '#16a34a' },
  { bg: '#3b82f6', ring: '#2563eb' },
  { bg: '#8b5cf6', ring: '#7c3aed' },
]

interface ResultsChartProps {
  xLabel: string
  yLabel: string
  positions: AveragedPosition[]
  currentUserId: string
  myPlacements?: PlacementPosition[]
}

export function ResultsChart({ xLabel, yLabel, positions, currentUserId, myPlacements }: ResultsChartProps) {
  const toSvgX = (n: number) => LEFT + n * PLOT_W
  const toSvgY = (n: number) => BOTTOM - n * PLOT_H

  // Build a map of my placements by target user
  const myMap = new Map<string, { x: number; y: number }>()
  if (myPlacements) {
    for (const p of myPlacements) {
      myMap.set(p.targetUserId, { x: p.x, y: p.y })
    }
  }

  return (
    <div className="card rounded-2xl p-4">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full">
        {/* Arrow marker for vectors */}
        <defs>
          <marker id="vector-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#f43f5e" />
          </marker>
        </defs>

        {/* Quadrant tints */}
        <rect x={LEFT} y={TOP} width={PLOT_W / 2} height={PLOT_H / 2} fill="rgba(244,63,94,0.04)" />
        <rect x={CENTER_X} y={TOP} width={PLOT_W / 2} height={PLOT_H / 2} fill="rgba(59,130,246,0.04)" />
        <rect x={LEFT} y={CENTER_Y} width={PLOT_W / 2} height={PLOT_H / 2} fill="rgba(234,179,8,0.04)" />
        <rect x={CENTER_X} y={CENTER_Y} width={PLOT_W / 2} height={PLOT_H / 2} fill="rgba(34,197,94,0.04)" />

        {/* Cross axes */}
        <line x1={LEFT} y1={CENTER_Y} x2={RIGHT} y2={CENTER_Y} stroke="#ddd6fe" strokeWidth="1.5" />
        <line x1={CENTER_X} y1={TOP} x2={CENTER_X} y2={BOTTOM} stroke="#ddd6fe" strokeWidth="1.5" />

        {/* Arrows */}
        <polygon points={`${RIGHT},${CENTER_Y} ${RIGHT - 7},${CENTER_Y - 4} ${RIGHT - 7},${CENTER_Y + 4}`} fill="#c4b5fd" />
        <polygon points={`${LEFT},${CENTER_Y} ${LEFT + 7},${CENTER_Y - 4} ${LEFT + 7},${CENTER_Y + 4}`} fill="#c4b5fd" />
        <polygon points={`${CENTER_X},${TOP} ${CENTER_X - 4},${TOP + 7} ${CENTER_X + 4},${TOP + 7}`} fill="#c4b5fd" />
        <polygon points={`${CENTER_X},${BOTTOM} ${CENTER_X - 4},${BOTTOM - 7} ${CENTER_X + 4},${BOTTOM - 7}`} fill="#c4b5fd" />

        {/* X axis label + endpoints */}
        <text x={CENTER_X} y={SIZE - 8} textAnchor="middle" fill="#8b5cf6" fontSize="11" fontWeight="600">{xLabel}?</text>
        <text x={LEFT} y={CENTER_Y + 18} textAnchor="start" fill="#a8a3b8" fontSize="9">Low</text>
        <text x={RIGHT} y={CENTER_Y + 18} textAnchor="end" fill="#a8a3b8" fontSize="9">High</text>

        {/* Y axis label + endpoints */}
        <text x={14} y={CENTER_Y} textAnchor="middle" fill="#f43f5e" fontSize="11" fontWeight="600" transform={`rotate(-90, 14, ${CENTER_Y})`}>{yLabel}?</text>
        <text x={CENTER_X} y={BOTTOM + 16} textAnchor="middle" fill="#a8a3b8" fontSize="9">Low</text>
        <text x={CENTER_X} y={TOP - 6} textAnchor="middle" fill="#a8a3b8" fontSize="9">High</text>

        {/* Vector lines: from my placement to group average */}
        {myPlacements && positions.map((pos) => {
          const mine = myMap.get(pos.targetUserId)
          if (!mine) return null
          const fromX = toSvgX(mine.x)
          const fromY = toSvgY(mine.y)
          const toX = toSvgX(pos.x)
          const toY = toSvgY(pos.y)
          // Shorten the line so it doesn't overlap the circles
          const dx = toX - fromX
          const dy = toY - fromY
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 4) return null // too close, skip
          const startOffset = 10
          const endOffset = 18
          const sx = fromX + (dx / dist) * startOffset
          const sy = fromY + (dy / dist) * startOffset
          const ex = toX - (dx / dist) * endOffset
          const ey = toY - (dy / dist) * endOffset

          return (
            <line
              key={`vec-${pos.targetUserId}`}
              x1={sx} y1={sy} x2={ex} y2={ey}
              stroke="rgba(244,63,94,0.5)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              markerEnd="url(#vector-arrow)"
            />
          )
        })}

        {/* My placement ghost dots (when vectors shown) */}
        {myPlacements && positions.map((pos, i) => {
          const mine = myMap.get(pos.targetUserId)
          if (!mine) return null
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
          const initials = pos.profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          return (
            <g key={`my-${pos.targetUserId}`}>
              <circle
                cx={toSvgX(mine.x)}
                cy={toSvgY(mine.y)}
                r={10}
                fill={color.bg}
                opacity={0.35}
                stroke={color.ring}
                strokeWidth="1"
                strokeDasharray="3 2"
              />
              <text
                x={toSvgX(mine.x)} y={toSvgY(mine.y)}
                textAnchor="middle" dy="3" fill="white" fontSize="7" fontWeight="bold" opacity={0.5}
              >
                {initials}
              </text>
            </g>
          )
        })}

        {/* Result dots (group average) */}
        {positions.map((pos, i) => {
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
          const isMe = pos.targetUserId === currentUserId
          const initials = pos.profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          const cx = toSvgX(pos.x)
          const cy = toSvgY(pos.y)

          return (
            <g key={pos.targetUserId}>
              <defs>
                <clipPath id={`result-clip-${pos.targetUserId}`}>
                  <circle cx={cx} cy={cy} r={16} />
                </clipPath>
              </defs>
              <circle
                cx={cx}
                cy={cy}
                r={16}
                fill={color.bg}
                stroke={color.ring}
                strokeWidth={isMe ? 2.5 : 1.5}
                opacity={0.9}
                style={{ filter: `drop-shadow(0 2px 6px ${color.bg}50)` }}
              />
              {pos.profile.avatar_url ? (
                <image
                  href={pos.profile.avatar_url}
                  x={cx - 16}
                  y={cy - 16}
                  width={32}
                  height={32}
                  clipPath={`url(#result-clip-${pos.targetUserId})`}
                  pointerEvents="none"
                />
              ) : (
                <text x={cx} y={cy} textAnchor="middle" dy="3.5" fill="white" fontSize="9" fontWeight="bold">
                  {initials}
                </text>
              )}
              <text x={cx} y={cy + 24} textAnchor="middle" fill="#9ca3af" fontSize="9">
                {pos.profile.display_name}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
