'use client'

import type { AveragedPosition, PlacementPosition } from '@/types/app'
import { resolveOverlaps } from '@/lib/utils/declutter'

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
const DOT_RADIUS = 16
const MIN_DOT_SPACING = DOT_RADIUS * 2 + 6

export const AVATAR_COLORS = [
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
  /** When set, draws a single accuracy vector + ghost dot for just this person. */
  highlightUserId?: string | null
  showLegend?: boolean
}

export function ResultsChart({
  xLabel,
  yLabel,
  positions,
  currentUserId,
  myPlacements,
  highlightUserId,
  showLegend = true,
}: ResultsChartProps) {
  const toSvgX = (n: number) => LEFT + n * PLOT_W
  const toSvgY = (n: number) => BOTTOM - n * PLOT_H

  const myMap = new Map<string, { x: number; y: number }>()
  if (myPlacements) {
    for (const p of myPlacements) {
      myMap.set(p.targetUserId, { x: p.x, y: p.y })
    }
  }

  // Resolve overlaps once, in SVG pixel space, so clustered averages never
  // fully overlap — this is what the dots actually render at.
  const resolved = resolveOverlaps(
    positions.map(pos => ({ id: pos.targetUserId, x: toSvgX(pos.x), y: toSvgY(pos.y) })),
    MIN_DOT_SPACING,
    { left: LEFT + DOT_RADIUS, right: RIGHT - DOT_RADIUS, top: TOP + DOT_RADIUS, bottom: BOTTOM - DOT_RADIUS }
  )
  const resolvedMap = new Map(resolved.map(r => [r.id, r]))

  const highlighted = highlightUserId ? positions.find(p => p.targetUserId === highlightUserId) : null
  const highlightedMine = highlighted ? myMap.get(highlighted.targetUserId) : null
  const highlightedDot = highlighted ? resolvedMap.get(highlighted.targetUserId) : null

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

        {/* Single highlighted accuracy vector, when requested */}
        {highlighted && highlightedMine && highlightedDot && (() => {
          const fromX = toSvgX(highlightedMine.x)
          const fromY = toSvgY(highlightedMine.y)
          const toX = highlightedDot.x
          const toY = highlightedDot.y
          const dx = toX - fromX
          const dy = toY - fromY
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 4) return null
          const startOffset = 10
          const endOffset = 18
          const sx = fromX + (dx / dist) * startOffset
          const sy = fromY + (dy / dist) * startOffset
          const ex = toX - (dx / dist) * endOffset
          const ey = toY - (dy / dist) * endOffset
          const initials = highlighted.profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

          return (
            <g>
              <line
                x1={sx} y1={sy} x2={ex} y2={ey}
                stroke="rgba(244,63,94,0.6)"
                strokeWidth="2"
                strokeDasharray="4 3"
                markerEnd="url(#vector-arrow)"
              />
              <circle
                cx={fromX}
                cy={fromY}
                r={11}
                fill="white"
                opacity={0.9}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
              <text x={fromX} y={fromY} textAnchor="middle" dy="3" fill="#f43f5e" fontSize="8" fontWeight="bold">
                {initials}
              </text>
            </g>
          )
        })()}

        {/* Result dots (group average) */}
        {positions.map((pos, i) => {
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
          const isMe = pos.targetUserId === currentUserId
          const isHighlighted = pos.targetUserId === highlightUserId
          const initials = pos.profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          const dot = resolvedMap.get(pos.targetUserId)!
          const cx = dot.x
          const cy = dot.y

          return (
            <g key={pos.targetUserId}>
              <defs>
                <clipPath id={`result-clip-${pos.targetUserId}`}>
                  <circle cx={cx} cy={cy} r={DOT_RADIUS} />
                </clipPath>
              </defs>
              <circle
                cx={cx}
                cy={cy}
                r={DOT_RADIUS}
                fill={color.bg}
                stroke={isHighlighted ? '#f43f5e' : color.ring}
                strokeWidth={isHighlighted ? 3 : isMe ? 2.5 : 1.5}
                opacity={0.92}
                style={{ filter: `drop-shadow(0 2px 6px ${color.bg}50)` }}
              />
              {pos.profile.avatar_url ? (
                <image
                  href={pos.profile.avatar_url}
                  x={cx - DOT_RADIUS}
                  y={cy - DOT_RADIUS}
                  width={DOT_RADIUS * 2}
                  height={DOT_RADIUS * 2}
                  clipPath={`url(#result-clip-${pos.targetUserId})`}
                  pointerEvents="none"
                />
              ) : (
                <text x={cx} y={cy} textAnchor="middle" dy="3.5" fill="white" fontSize="9" fontWeight="bold">
                  {initials}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {showLegend && (
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {positions.map((pos, i) => {
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
            const isMe = pos.targetUserId === currentUserId
            return (
              <div key={pos.targetUserId} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color.bg }} />
                <span className="text-xs font-bold text-gray-700">
                  {pos.profile.display_name}
                  {isMe && <span className="text-gray-400 font-normal"> (you)</span>}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
