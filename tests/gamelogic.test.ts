import { beforeEach, describe, expect, test } from 'vitest'

import { Colors, InProgress } from  "app/constants.ts"
import { Guess } from "app/types.ts"
import { checkWinCondition, isValidGuess, updateGuessHistory, deleteSelection, selectColor, getFeedback, startGame, submitGuess, usedAllGuesses, useGameState } from "app/gameLogic.ts"

describe('Win/Lose Condition Tests', () => {
  let guess: Guess, answer: Guess, guessHistory: Guess[];

  beforeEach(() => {
    answer = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
    guess = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
    guessHistory = [answer, guess, guess]
  })

  // win conditions tests
  test('When a user submits a guess the game validates correctly if it is a winning guess', () => {
    expect(checkWinCondition(guess, answer)).toEqual(true)
  })

  // add test to check game loses after 10 guesses --> if total guess history is 10 + all incorrect
  test('When the user has submitted 10 incorrect guesses, game loses', () => {
    //todo might have to mock guessHistory
    expect(usedAllGuesses()).toEqual(false)
    guessHistory.push(guess, guess, guess, guess, guess, guess, guess)
    expect(usedAllGuesses()).toEqual(true)
  })
})

describe('Guess Construction', () => {
  let guess: Guess, answer: Guess, guessHistory: Guess[];

  beforeEach(() => {
    answer = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
    guess = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
    guessHistory = [answer, guess, guess]
  })

// add test for making sure that guess is 4 colors can't guess more or less than 4