import { describe, expect, test } from 'vitest'

import { Colors, Pip } from "app/constants.ts"
import { getFeedback } from "app/gameLogic.ts"

const { Red, Orange, Yellow, Green, Blue, Purple } = Colors

describe('getFeedback', () => {
  test('a fully correct guess earns 4 black pips', () => {
    const answer = [Red, Green, Blue, Yellow]
    const guess = [Red, Green, Blue, Yellow]
    expect(getFeedback(guess, answer)).toEqual([Pip.Black, Pip.Black, Pip.Black, Pip.Black])
  })

  test('a guess sharing no colors with the answer earns no pips', () => {
    const answer = [Red, Green, Blue, Yellow]
    const guess = [Orange, Purple, Orange, Purple]
    expect(getFeedback(guess, answer)).toEqual([])
  })

  test('correct color in the correct spot earns a black pip', () => {
    const answer = [Red, Green, Blue, Yellow]
    const guess = [Red, Purple, Purple, Purple]
    expect(getFeedback(guess, answer)).toEqual([Pip.Black])
  })

  test('correct color in the wrong spot earns a white pip', () => {
    const answer = [Red, Green, Blue, Yellow]
    const guess = [Purple, Red, Purple, Purple]
    expect(getFeedback(guess, answer)).toEqual([Pip.White])
  })

  test('all correct colors in all wrong spots earns 4 white pips', () => {
    const answer = [Red, Green, Blue, Yellow]
    const guess = [Yellow, Blue, Green, Red]
    expect(getFeedback(guess, answer)).toEqual([Pip.White, Pip.White, Pip.White, Pip.White])
  })

  test('pips are sorted black first, then white', () => {
    const answer = [Red, Green, Blue, Yellow]
    const guess = [Yellow, Green, Blue, Red]
    // Green and Blue are exact matches; Red and Yellow are swapped
    expect(getFeedback(guess, answer)).toEqual([Pip.Black, Pip.Black, Pip.White, Pip.White])
  })

  test('a repeated guess color is not double counted against a single answer peg', () => {
    const answer = [Red, Green, Blue, Yellow]
    const guess = [Red, Red, Red, Red]
    expect(getFeedback(guess, answer)).toEqual([Pip.Black])
  })

  test('repeated colors in the answer are each matched at most once', () => {
    const answer = [Red, Red, Blue, Green]
    const guess = [Red, Yellow, Red, Yellow]
    // First Red is exact; second Red matches the remaining answer Red out of place
    expect(getFeedback(guess, answer)).toEqual([Pip.Black, Pip.White])
  })

  test('an answer peg consumed by a black pip cannot also earn a white pip', () => {
    const answer = [Red, Green, Blue, Yellow]
    const guess = [Green, Green, Yellow, Yellow]
    // One Green and one Yellow are exact; the duplicates have no pegs left to match
    expect(getFeedback(guess, answer)).toEqual([Pip.Black, Pip.Black])
  })
})
