'use client'

import { useDraggable } from '@dnd-kit/core'
import type { Profile } from '@/types/app'
import { getAvatarEmoji } from '@/lib/utils/avatarEmoji'

interface DraggableAvatarProps {
  member: Profile
  x: number
  y: number
  color: string
  ringColor: string
  isCurrentUser: boolean
  readOnly?: boolean
  inTray?: boolean
}

export function DraggableAvatar({
  member,
  x,
  y,
  color,
  ringColor,
  isCurrentUser,
  readOnly = false,
  inTray = false,
}: DraggableAvatarProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: member.id,
    disabled: readOnly,
  })

  const avatarEmoji = getAvatarEmoji(member.id)

  if (inTray) {
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing"
        style={{
          transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
          opacity: isDragging ? 0.7 : 1,
          zIndex: isDragging ? 50 : 1,
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-base overflow-hidden"
          style={{ background: color, boxShadow: `0 0 0 2px ${ringColor}, 0 4px 12px ${color}40` }}
        >
          {member.avatar_url ? (
            <img src={member.avatar_url} alt={member.display_name} className="w-full h-full object-cover" />
          ) : (
            avatarEmoji
          )}
        </div>
        <span className="text-[10px] text-gray-400 max-w-[60px] truncate">{member.display_name}</span>
      </div>
    )
  }

  return (
    <g
      ref={setNodeRef as unknown as React.Ref<SVGGElement>}
      {...listeners}
      {...attributes}
      style={{
        cursor: readOnly ? 'default' : 'grab',
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      }}
    >
      {/* Clip path for circular avatar image */}
      <defs>
        <clipPath id={`avatar-clip-${member.id}`}>
          <circle cx={x} cy={y} r={16} />
        </clipPath>
      </defs>

      {/* Larger invisible hit area so dragging works with a finger, not just a precise cursor */}
      {!readOnly && <circle cx={x} cy={y} r={26} fill="transparent" pointerEvents="all" />}

      {member.avatar_url ? (
        <>
          <circle
            cx={x}
            cy={y}
            r={16}
            fill={color}
            opacity={isDragging ? 0.7 : 0.9}
            stroke={ringColor}
            strokeWidth={isCurrentUser ? 2.5 : 1.5}
            style={{ filter: `drop-shadow(0 2px 6px ${color}50)` }}
          />
          <image
            href={member.avatar_url}
            x={x - 16}
            y={y - 16}
            width={32}
            height={32}
            clipPath={`url(#avatar-clip-${member.id})`}
            opacity={isDragging ? 0.7 : 1}
            pointerEvents="none"
          />
        </>
      ) : (
        <>
          <circle
            cx={x}
            cy={y}
            r={16}
            fill={color}
            opacity={isDragging ? 0.7 : 0.9}
            stroke={ringColor}
            strokeWidth={isCurrentUser ? 2.5 : 1.5}
            style={{ filter: `drop-shadow(0 2px 6px ${color}50)` }}
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dy="3.5"
            fontSize="14"
            pointerEvents="none"
          >
            {avatarEmoji}
          </text>
        </>
      )}
      <text
        x={x}
        y={y + 24}
        textAnchor="middle"
        fill="#9ca3af"
        fontSize="9"
        pointerEvents="none"
      >
        {member.display_name}
      </text>
    </g>
  )
}
