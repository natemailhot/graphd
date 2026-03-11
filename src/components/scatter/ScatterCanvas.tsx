'use client'

import { useState, useRef, useCallback, useId } from 'react'
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  type DragEndEvent,
} from '@dnd-kit/core'
import { DraggableAvatar } from './DraggableAvatar'
import type { Profile, PlacementPosition } from '@/types/app'

// Chart layout: 4-quadrant with cross axes through center
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

interface ScatterCanvasProps {
  xLabel: string
  yLabel: string
  members: Profile[]
  currentUserId: string
  onSubmit: (positions: PlacementPosition[]) => void
  initialPositions?: PlacementPosition[]
  submitting?: boolean
}

const AVATAR_COLORS = [
  { bg: '#f43f5e', ring: '#e11d48' },
  { bg: '#f97316', ring: '#ea580c' },
  { bg: '#eab308', ring: '#ca8a04' },
  { bg: '#22c55e', ring: '#16a34a' },
  { bg: '#3b82f6', ring: '#2563eb' },
  { bg: '#8b5cf6', ring: '#7c3aed' },
]

export function ScatterCanvas({
  xLabel,
  yLabel,
  members,
  currentUserId,
  onSubmit,
  initialPositions = [],
  submitting = false,
}: ScatterCanvasProps) {
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(() => {
    const map = new Map()
    initialPositions.forEach(p => map.set(p.targetUserId, { x: p.x, y: p.y }))
    return map
  })

  const svgRef = useRef<SVGSVGElement>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  const placedMembers = members.filter(m => positions.has(m.id))
  const unplacedMembers = members.filter(m => !positions.has(m.id))
  const allPlaced = unplacedMembers.length === 0

  // Normalized [0,1] → SVG coords (0=left/bottom, 1=right/top)
  const toSvgX = (n: number) => LEFT + n * PLOT_W
  const toSvgY = (n: number) => BOTTOM - n * PLOT_H
  const toNormX = (svgX: number) => Math.max(0, Math.min(1, (svgX - LEFT) / PLOT_W))
  const toNormY = (svgY: number) => Math.max(0, Math.min(1, (BOTTOM - svgY) / PLOT_H))

  // Convert a page-level pointer position to normalized chart coords
  const pageToNorm = useCallback((pageX: number, pageY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 0.5, y: 0.5 }
    const rect = svg.getBoundingClientRect()
    // Scale from DOM pixels to SVG viewBox units
    const scaleX = SIZE / rect.width
    const scaleY = SIZE / rect.height
    const svgX = (pageX - rect.left) * scaleX
    const svgY = (pageY - rect.top) * scaleY
    return { x: toNormX(svgX), y: toNormY(svgY) }
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta, activatorEvent } = event
    const memberId = active.id as string
    const existing = positions.get(memberId)

    if (existing) {
      // Already on chart — move by delta
      const newX = toNormX(toSvgX(existing.x) + delta.x)
      const newY = toNormY(toSvgY(existing.y) + delta.y)
      setPositions(new Map(positions).set(memberId, { x: newX, y: newY }))
    } else {
      // Dropped from tray — calculate where it landed using start position + delta
      const startEvent = activatorEvent as MouseEvent | TouchEvent
      let startX: number, startY: number
      if ('touches' in startEvent) {
        startX = startEvent.touches[0].clientX
        startY = startEvent.touches[0].clientY
      } else {
        startX = startEvent.clientX
        startY = startEvent.clientY
      }
      const dropPos = pageToNorm(startX + delta.x, startY + delta.y)
      setPositions(new Map(positions).set(memberId, dropPos))
    }
  }

  const handleSubmit = () => {
    const placements: PlacementPosition[] = Array.from(positions.entries()).map(
      ([targetUserId, { x, y }]) => ({ targetUserId, x, y })
    )
    onSubmit(placements)
  }

  return (
    <DndContext id={useId()} sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div className="card rounded-2xl p-4 overflow-hidden">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="w-full touch-none"
          >
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

            {/* Drop zone */}
            <rect x={LEFT} y={TOP} width={PLOT_W} height={PLOT_H} fill="transparent" />

            {/* Placed avatars */}
            {placedMembers.map((member) => {
              const pos = positions.get(member.id)!
              const colorIdx = members.indexOf(member)
              const color = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]
              return (
                <DraggableAvatar
                  key={member.id}
                  member={member}
                  x={toSvgX(pos.x)}
                  y={toSvgY(pos.y)}
                  color={color.bg}
                  ringColor={color.ring}
                  isCurrentUser={member.id === currentUserId}
                />
              )
            })}
          </svg>
        </div>

        {/* Unplaced tray */}
        {unplacedMembers.length > 0 && (
          <div className="card rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-2 text-center">Drag onto the chart</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {unplacedMembers.map((member) => {
                const colorIdx = members.indexOf(member)
                const color = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]
                return (
                  <DraggableAvatar
                    key={member.id}
                    member={member}
                    x={0}
                    y={0}
                    color={color.bg}
                    ringColor={color.ring}
                    isCurrentUser={member.id === currentUserId}
                    inTray
                  />
                )
              })}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!allPlaced || submitting}
          className="w-full btn-primary py-3 text-lg"
        >
          {submitting ? 'Submitting...' : allPlaced ? 'Submit Placements' : `Place ${unplacedMembers.length} more`}
        </button>
      </div>
    </DndContext>
  )
}
