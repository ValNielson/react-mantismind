'use client'

import { Colors, Pip, CODE_LENGTH } from '../constants'
import { ColorDot } from './ColorDot'
import { FeedbackPips } from './FeedbackPips'

interface GuessRowProps {
  guess?: Colors[]
  feedback?: Pip[]
  isActive?: boolean
}

export function GuessRow({ guess = [], feedback, isActive }: GuessRowProps) {
  const slots = Array.from({ length: CODE_LENGTH }, (_, i) => guess[i] ?? null)

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? 'bg-gray-700/50' : ''}`}>
      <div className="flex gap-2">
        {slots.map((color, i) => (
          <ColorDot key={i} color={color} size="md" />
        ))}
      </div>
      <FeedbackPips feedback={feedback} />
    </div>
  )
}
