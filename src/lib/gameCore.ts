import { Card, GameState, Player, Turn, AttemptResult } from "@/types/types";

// Helper function to create a deck of cards
const createDeck = (): Card[] => {
  interface Difficulty {
    type: "Beginner" | "Intermediate" | "Advanced" | "Pro";
    count: number;
  }

  const difficulties: Difficulty[] = [
    { type: "Beginner", count: 10 },
    { type: "Intermediate", count: 15 },
    { type: "Advanced", count: 8 },
    { type: "Pro", count: 4 },
  ];

  let id = 1;
  const deck: Card[] = [];

  for (const difficulty of difficulties) {
    for (let i = 0; i < difficulty.count; i += 1) {
      const difficultyName = difficulty.type;
      const cardName = `${difficultyName} Trick ${i + 1}`;

      // Assign points based on difficulty
      let points: number;
      switch (difficulty.type) {
        case "Beginner":
          points = 10;
          break;
        case "Intermediate":
          points = 20;
          break;
        case "Advanced":
          points = 35;
          break;
        case "Pro":
          points = 50;
          break;
        default:
          points = 10; // Default to Beginner points
      }

      deck.push({
        id: id,
        name: cardName,
        difficulty: difficulty.type,
        points,
        description: `Perform a ${difficultyName} level trick`,
      });
      id += 1;
    }
  }

  return shuffleArray(deck);
};

/**
 * Fisher-Yates shuffle algorithm
 * @template T - The type of elements in the array
 * @param {T[]} array - The array to shuffle
 * @returns {T[]} A new shuffled array
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = temp;
  }
  return newArray;
};

/**
 * Gets the next follower index in the turn order
 * @param {Player[]} players - Array of all players
 * @param {number} leaderIndex - Index of the current leader
 * @param {number} currentFollowerIndex - Index of the current follower
 * @returns {number | null} Index of the next follower or null if no more followers
 */
const getNextFollowerIndex = (
  players: Player[],
  leaderIndex: number,
  currentFollowerIndex: number
): number | null => {
  const activePlayers = players.filter(
    (p, idx) => !p.isEliminated && idx !== leaderIndex
  );

  if (activePlayers.length === 0) return null;

  // Find the next non-eliminated player after currentFollowerIndex
  for (let i = 1; i < players.length; i++) {
    const nextIndex = (currentFollowerIndex + i) % players.length;
    if (nextIndex !== leaderIndex && !players[nextIndex].isEliminated) {
      return nextIndex;
    }
  }

  return null;
};

// End the current turn and prepare for the next leader or next player
export const endTurn = (state: GameState): GameState => {
  // If game is already over, don't do anything
  if (state.isGameOver) return state;

  const currentLeader = state.players[state.currentLeaderIndex];
  const hasCompletedThreeTricks = currentLeader.streak >= 2; // 0-based, so 2 means 3 tricks

  // If leader hasn't completed 3 tricks and is not eliminated, they go again
  if (!hasCompletedThreeTricks && !currentLeader.isEliminated) {
    // Draw a new card for the next turn
    const [drawnCard, ...remainingDeck] = state.deck;

    // If no more cards, game over
    if (!drawnCard) {
      return {
        ...state,
        isGameOver: true,
        turnPhase: "leader",
      };
    }

    return {
      ...state,
      // Keep the same leader
      currentLeaderIndex: state.currentLeaderIndex,
      currentFollowerIndex: null,
      deck: remainingDeck,
      currentCard: drawnCard,
      turnPhase: "leader",
      round: state.round + 1,
    };
  }

  // If we get here, we need to find the next leader
  let nextLeaderIndex = (state.currentLeaderIndex + 1) % state.players.length;
  let attempts = 0;
  const totalPlayers = state.players.length;

  // Find the next non-eliminated player who hasn't had 3 successful tricks in a row
  while (attempts < totalPlayers) {
    const potentialLeader = state.players[nextLeaderIndex];

    // If this player is not eliminated and hasn't had 3 successful tricks, select them
    if (!potentialLeader.isEliminated) {
      break;
    }

    nextLeaderIndex = (nextLeaderIndex + 1) % totalPlayers;
    attempts++;
  }

  // If all players except one are eliminated, game over
  const activePlayers = state.players.filter((p) => !p.isEliminated);
  if (activePlayers.length <= 1) {
    return {
      ...state,
      isGameOver: true,
      turnPhase: "leader",
    };
  }

  // Draw a new card for the next turn
  const [drawnCard, ...remainingDeck] = state.deck;

  // If no more cards, game over
  if (!drawnCard) {
    return {
      ...state,
      isGameOver: true,
      turnPhase: "leader",
    };
  }

  // Reset the streak for the current leader since their turn is over
  const updatedPlayers = [...state.players];
  updatedPlayers[state.currentLeaderIndex] = {
    ...state.players[state.currentLeaderIndex],
    streak: 0, // Reset streak when turn passes to another player
  };

  return {
    ...state,
    players: updatedPlayers,
    currentLeaderIndex: nextLeaderIndex,
    currentFollowerIndex: null,
    deck: remainingDeck,
    currentCard: drawnCard,
    turnPhase: "leader",
    round: state.round + 1,
  };
};

// Create a new game with the given player names
export const createGame = (
  playerNames: string[],
  gameWord: string = "GRIND"
): GameState => {
  const players: Player[] = playerNames.map((name, index) => ({
    id: index + 1,
    name,
    score: 0,
    isEliminated: false,
    letters: [],
    streak: 0,
  }));

  const deck = createDeck();
  const [drawnCard, ...remainingDeck] = deck;

  return {
    gameStarted: true,
    players,
    currentLeaderIndex: 0,
    currentFollowerIndex: null,
    deck: remainingDeck,
    currentCard: drawnCard,
    turnPhase: "leader",
    round: 1,
    isGameOver: false,
    gameWord,
    turns: [],
  };
};

// Draw a new card from the deck
export const drawCard = (
  state: GameState,
  showToast?: (message: string) => void
): GameState => {
  // If deck is empty, reshuffle the discard pile (all cards except current card and player hands)
  if (state.deck.length === 0) {
    // Get all cards that are not in play (not current card and not in players' hands)
    const discardPile: Card[] = [];

    // Add the current card to the discard pile if it exists
    if (state.currentCard) {
      discardPile.push(state.currentCard);
    }

    // Shuffle the discard pile to form a new deck
    const newDeck = shuffleArray(discardPile);

    // Show toast notification
    if (showToast) {
      showToast("Deck reshuffled!");
    }

    // If there are no cards to reshuffle, return current state (shouldn't happen in normal gameplay)
    if (newDeck.length === 0) {
      return { ...state, isGameOver: true };
    }

    // Draw the first card from the new deck
    const [drawnCard, ...remainingDeck] = newDeck;

    return {
      ...state,
      deck: remainingDeck,
      currentCard: drawnCard,
      turnPhase: "leader",
    };
  }

  // Normal card draw from existing deck
  const [drawnCard, ...remainingDeck] = state.deck;

  return {
    ...state,
    deck: remainingDeck,
    currentCard: drawnCard,
    turnPhase: "leader",
  };
};

// Process a leader's attempt
export const processLeaderAttempt = (
  state: GameState,
  result: AttemptResult
): GameState => {
  if (!state.currentCard) return state;

  const currentLeader = state.players[state.currentLeaderIndex];
  const updatedPlayers = [...state.players];

  // Check if this is a leader with a streak of 2 attempting to complete a 3-streak
  const isCompletingStreak = currentLeader.streak === 2 && result === "landed";

  // Create a new turn record
  const newTurn: Turn = {
    playerId: currentLeader.id,
    playerName: currentLeader.name,
    card: state.currentCard,
    result,
    timestamp: Date.now(),
    pointsEarned: result === "landed" ? state.currentCard.points : 0,
  };

  // Update player's score and streak
  updatedPlayers[state.currentLeaderIndex] = {
    ...currentLeader,
    score:
      currentLeader.score +
      (result === "landed" ? state.currentCard.points : 0) +
      (isCompletingStreak ? 1 : 0), // Bonus point for completing a 3-streak
    streak: result === "landed" ? currentLeader.streak + 1 : 0,
    letters:
      result === "landed"
        ? [
            ...currentLeader.letters,
            state.gameWord[
              currentLeader.letters.length % state.gameWord.length
            ],
          ]
        : currentLeader.letters,
  };

  // If leader completed a 3-streak, they get to lead again with a new card
  if (isCompletingStreak) {
    // Draw a new card for the next turn
    const [drawnCard, ...remainingDeck] = state.deck;

    if (!drawnCard) {
      return {
        ...state,
        players: updatedPlayers,
        turns: [...state.turns, newTurn],
        isGameOver: true,
      };
    }

    return {
      ...state,
      players: updatedPlayers,
      turns: [...state.turns, newTurn],
      deck: remainingDeck,
      currentCard: drawnCard,
      turnPhase: "leader",
      currentFollowerIndex: null,
    };
  }

  // If leader failed the trick, end their turn immediately
  if (result === "failed") {
    return endTurn({
      ...state,
      players: updatedPlayers,
      turns: [...state.turns, newTurn],
    });
  }

  // Get next follower index for successful leader attempt
  const nextFollower = getNextFollowerIndex(
    state.players,
    state.currentLeaderIndex,
    -1
  );

  // If the leader failed the trick, end their turn immediately
  if (result !== "landed") {
    return endTurn({
      ...state,
      players: updatedPlayers,
      turns: [...state.turns, newTurn],
    });
  }

  // If there are no followers left (shouldn't happen with 2+ players), end turn
  if (nextFollower === null) {
    return endTurn({
      ...state,
      players: updatedPlayers,
      turns: [...state.turns, newTurn],
    });
  }

  // Move to follower phase with the first follower
  return {
    ...state,
    players: updatedPlayers,
    turns: [...state.turns, newTurn],
    currentFollowerIndex: nextFollower,
    turnPhase: "follower",
  };
};

// Process a follower's attempt
export const processFollowerAttempt = (
  state: GameState,
  result: AttemptResult
): GameState => {
  if (state.currentFollowerIndex === null || !state.currentCard) return state;

  const currentFollower = state.players[state.currentFollowerIndex];
  const updatedPlayers = [...state.players];

  // Check if this follower is completing a 3-streak
  const isCompletingStreak =
    currentFollower.streak === 2 && result === "landed";

  // Create a new turn record
  const newTurn: Turn = {
    playerId: currentFollower.id,
    playerName: currentFollower.name,
    card: state.currentCard,
    result,
    timestamp: Date.now(),
    pointsEarned: result === "landed" ? state.currentCard.points : 0,
  };

  // Update player's score and streak
  updatedPlayers[state.currentFollowerIndex] = {
    ...currentFollower,
    score:
      currentFollower.score +
      (result === "landed" ? state.currentCard.points : 0) +
      (isCompletingStreak ? 1 : 0), // Bonus point for completing a 3-streak
    streak: result === "landed" ? currentFollower.streak + 1 : 0,
    letters:
      result === "landed"
        ? [
            ...currentFollower.letters,
            state.gameWord[
              currentFollower.letters.length % state.gameWord.length
            ],
          ]
        : currentFollower.letters,
  };

  // If follower completed a 3-streak, they become the next leader
  if (isCompletingStreak) {
    // Draw a new card for the next turn
    const [drawnCard, ...remainingDeck] = state.deck;

    if (!drawnCard) {
      return {
        ...state,
        players: updatedPlayers,
        turns: [...state.turns, newTurn],
        isGameOver: true,
      };
    }

    return {
      ...state,
      players: updatedPlayers,
      turns: [...state.turns, newTurn],
      deck: remainingDeck,
      currentCard: drawnCard,
      currentLeaderIndex: state.currentFollowerIndex,
      currentFollowerIndex: null,
      turnPhase: "leader",
    };
  }

  // If the trick was missed, move to next player immediately
  if (result === "failed") {
    const nextFollower = getNextFollowerIndex(
      state.players,
      state.currentLeaderIndex,
      state.currentFollowerIndex
    );

    if (nextFollower === null) {
      return endTurn({
        ...state,
        players: updatedPlayers,
        turns: [...state.turns, newTurn],
      });
    }

    return {
      ...state,
      players: updatedPlayers,
      turns: [...state.turns, newTurn],
      currentFollowerIndex: nextFollower,
      turnPhase: "follower",
    };
  }

  // Get next follower index
  const nextFollower = getNextFollowerIndex(
    state.players,
    state.currentLeaderIndex,
    state.currentFollowerIndex
  );

  if (nextFollower === null) {
    // End of follower round - all followers have attempted, now end the turn
    return endTurn({
      ...state,
      players: updatedPlayers,
      turns: [...state.turns, newTurn],
      currentFollowerIndex: null,
      turnPhase: "leader",
    });
  }

  // More followers to go
  return {
    ...state,
    players: updatedPlayers,
    turns: [...state.turns, newTurn],
    currentFollowerIndex: nextFollower,
    turnPhase: "follower",
  };
};

// Check if a player has won the game
export const checkGameOver = (state: GameState): Player | null => {
  const activePlayers = state.players.filter((p) => !p.isEliminated);

  // If only one player remains, they win
  if (activePlayers.length === 1) {
    return activePlayers[0];
  }

  // Check if any player has completed the game word
  const winner = state.players.find(
    (player) => player.letters.join("") === state.gameWord
  );

  return winner || null;
};
