# G.R.I.N.D - Game Rules

## Overview

A trick-taking game where players take turns as leaders and followers, performing tricks to avoid collecting letters from the word "G.R.I.N.D". The last player remaining wins!

## Setup

- **Players**: 2+ players
- **Cards**: 98 unique trick cards
- **Game Word**: G.R.I.N.D (5 letters = 5 strikes to elimination)
- **Initial Leader**: Randomly selected as Player 0

## Card Deck

- 98 unique trick cards of varying difficulties
- Shuffled using Fisher-Yates algorithm
- Reshuffled when only 1 card remains in the draw pile

## Gameplay

### Turn Structure

1. **Leader's Turn**:

   - Leader draws a random card
   - Attempts to set the trick for others to perform
   - If successful:
     - All other players must attempt the same trick
     - Leader earns +1 successful consecutive land
     - If leader reaches 3 successful consecutive lands, leadership passes to the left
   - If failed:
     - Leader receives a letter from "G.R.I.N.D"
     - Leadership passes to the left

2. **Followers' Turns**:
   - Must attempt the leader's trick in turn order
   - Success: No penalty
   - Failure: Receive a letter from "G.R.I.N.D"

### Special Rules

- **Three Land Rule**: Leader can only land 3 successful consecutive tricks before passing leadership after the current round ends, so it doesn't go back to the leader it will go to the leaders id + 1.
- **Elimination**: Players are out/eliminated when they spell "G.R.I.N.D"

## Winning

- Last remaining player wins!
- cannot be a tie game
