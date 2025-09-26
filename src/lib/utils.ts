import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Card, GameState, Player, Turn } from "@/types/types";
import { trickCards } from "@/types/tricks";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fisher-Yates shuffle algorithm
 * @template T - The type of elements in the array
 * @param {T[]} array - The array to shuffle
 * @returns {T[]} A new shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Creates a new shuffled deck of trick cards
 */
function createDeck(): Card[] {
  // Create a deep copy of the trick cards to avoid mutating the original array
  return shuffleArray([...trickCards]);
}

/**
 * Creates a new game state with the given player names
 */
export function createInitialGameState(
  playerNames: string[],
  gameWord: string = "GRIND"
): GameState {
  const players = playerNames.map((name, index) => ({
    id: index + 1,
    name: name.trim() || `Player ${index + 1}`,
    score: 0,
    isEliminated: false,
    letters: [],
    streak: 0,
  }));

  const deck = createDeck();
  const currentCard = deck.shift() || null;

  return {
    players,
    currentLeaderIndex: 0,
    currentFollowerIndex: null,
    deck,
    currentCard,
    turnPhase: "leader",
    round: 1,
    isGameOver: false,
    gameWord,
    turns: [],
  };
}
