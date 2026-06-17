'use client'

import { useState, useCallback } from 'react'
import { Colors, VALID_GUESS_COLORS } from './constants'
import type { Guess, Feedback } from './types'
import { checkWinCondition, getFeedback, isValidGuess, generateAnswer } from './gameLogic'

export type GameScreen = 'start' | 'playing' | 'won' | 'lost'

export function useGame() {
  const [screen, setScreen] = useState<GameScreen>('start')
  const [gameHistory, setGameHistory] = useState<Guess[]>([])
  const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([])
  const [currentGuess, setCurrentGuess] = useState<Guess>([])
  const [answer, setAnswer] = useState<Guess>([])

  const startGame = useCallback(() => {
    setGameHistory([])
    setFeedbackHistory([])
    setCurrentGuess([])
    setAnswer(generateAnswer())
    setScreen('playing')
  }, [])

  const goHome = useCallback(() => {
    setScreen('start')
  }, [])

  const addColor = useCallback((color: Colors) => {
    setCurrentGuess(prev => (prev.length < 4 ? [...prev, color] : prev))
  }, [])

  const removeColor = useCallback(() => {
    setCurrentGuess(prev => (prev.length > 0 ? prev.slice(0, -1) : prev))
  }, [])

  const submitGuess = useCallback(() => {
    if (!isValidGuess(currentGuess)) return

    const feedback = getFeedback(currentGuess, answer)
    const newHistory = [...gameHistory, currentGuess]
    const newFeedback = [...feedbackHistory, feedback]

    setGameHistory(newHistory)
    setFeedbackHistory(newFeedback)
    setCurrentGuess([])

    if (checkWinCondition(currentGuess, answer)) {
      setScreen('won')
    } else if (newHistory.length >= 10) {
      setScreen('lost')
    }
  }, [currentGuess, answer, gameHistory, feedbackHistory])

  return {
    screen,
    gameHistory,
    feedbackHistory,
    currentGuess,
    answer,
    validColors: VALID_GUESS_COLORS,
    startGame,
    goHome,
    addColor,
    removeColor,
    submitGuess,
  }
}
