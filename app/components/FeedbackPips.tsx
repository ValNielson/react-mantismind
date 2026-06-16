'use client'

import { Pip } from '../constants'

interface FeedbackPipsProps {
  feedback?: Pip[]
}

export function FeedbackPips({ feedback }: FeedbackPipsProps) {
  const pips = feedback
    ? [...feedback, ...Array(4 - feedback.length).fill(null)]
    : Array(4).fill(null)

  return (
    <div className="grid grid-cols-2 gap-1 w-10 h-10">
      {pips.map((pip, i) => (
        <div
          key={i}
          className={`rounded-full w-4 h-4 ${
            pip === Pip.Black
              ? 'bg-gray-900 border border-gray-600'
              : pip === Pip.White
              ? 'bg-white border border-gray-400'
              : 'bg-gray-700 border border-gray-600'
          }`}
        />
      ))}
    </div>
  )
}
