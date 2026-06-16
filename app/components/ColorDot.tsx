'use client'

import { Colors } from '../constants'

const colorClasses: Record<Colors, string> = {
  [Colors.Red]: 'bg-red-500',
  [Colors.Green]: 'bg-green-500',
  [Colors.Blue]: 'bg-blue-500',
  [Colors.Orange]: 'bg-orange-500',
  [Colors.Purple]: 'bg-purple-500',
  [Colors.Yellow]: 'bg-yellow-400',
}

interface ColorDotProps {
  color: Colors | null
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

export function ColorDot({ color, size = 'md', onClick }: ColorDotProps) {
  const base = `rounded-full border-2 ${sizeClasses[size]}`
  const filled = color
    ? `${colorClasses[color]} border-transparent`
    : 'bg-gray-700 border-gray-600'
  const interactive = onClick ? 'cursor-pointer hover:scale-110 active:scale-95 transition-transform' : ''

  return (
    <div
      className={`${base} ${filled} ${interactive}`}
      onClick={onClick}
    />
  )
}
