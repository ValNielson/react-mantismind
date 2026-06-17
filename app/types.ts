import { Colors } from './constants'

export type Guess = Colors[]

export interface Feedback {
  black: number
  white: number
}

export interface GameState {
  gameHistory: Guess[]
  currentGuess: Guess
  guessCount: number
  inProgress: boolean
  answer: Guess
}
