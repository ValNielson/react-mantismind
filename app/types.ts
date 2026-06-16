import { Colors, Pip } from './constants'

// A guess (or the secret answer) is an ordered sequence of colors.
export type Guess = Colors[]

// Feedback for a submitted guess: black/white pips, sorted black-first.
export type Feedback = Pip[]

// A guess that has been submitted, paired with the feedback it earned.
export interface SubmittedGuess {
  guess: Guess
  feedback: Feedback
}
