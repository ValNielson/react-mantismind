import type { Colors, Pip } from './constants'

export type Guess = [Colors, Colors, Colors, Colors]

export type Feedback = Pip[]

export type GameStatus = 'start' | 'in-progress' | 'won' | 'lost'

export interface GameState {
  answer: Colors[] | null
  guessHistory: Array<{ guess: Colors[]; feedback: Pip[] }>
  currentGuess: Colors[]
  status: GameStatus
}
