import { Player, Turn, AttemptResult, TrickCard } from "@/types/types";
import { trickCards } from "@/types/tricks";
// import { toast } from "sonner";

/**
 * Represents the current phase of a turn in the game.
 * - 'leader': The leader is attempting a trick
 * - 'follower': Followers are attempting to replicate the leader's trick
 */
type TurnPhase = "leader" | "follower";

/**
 * Manages turn-based gameplay, card drawing, and game state for the trick-based game.
 * Handles leader/follower mechanics, card deck management, and turn progression.
 */
export class TurnManager {
  private state: {
    currentLeaderId: number;
    currentFollowerId: number | null;
    turnPhase: TurnPhase;
    currentCard: TrickCard | null;
    deck: TrickCard[];
    turns: Turn[];
  };

  /**
   * Creates a new TurnManager instance with the provided initial state
   * @param initialState - The initial state of the turn manager
   * @param initialState.currentLeaderId - The ID of the initial leader
   * @param [initialState.currentFollowerId=null] - Optional ID of the current follower
   * @param [initialState.turnPhase='leader'] - Initial turn phase (defaults to 'leader')
   * @param [initialState.currentCard=null] - Current trick card (if any)
   * @param [initialState.deck] - Optional initial deck of cards (defaults to all trick cards)
   * @param [initialState.turns=[]] - Optional array of previous turns
   */
  constructor(initialState: {
    currentLeaderId: number;
    currentFollowerId?: number | null;
    turnPhase?: TurnPhase;
    currentCard?: TrickCard | null;
    deck?: TrickCard[];
    turns?: Turn[];
  }) {
    this.state = {
      currentLeaderId: initialState.currentLeaderId,
      currentFollowerId: initialState.currentFollowerId ?? null,
      turnPhase: initialState.turnPhase ?? "leader",
      currentCard: initialState.currentCard ?? null,
      deck: initialState.deck ?? [...trickCards],
      turns: initialState.turns ?? [],
    };
  }

  /**
   * Gets information about the current turn
   * @param players - Array of all players in the game
   * @returns Object containing current turn information including phase, leader, current player, and current card
   */
  public getCurrentTurnInfo(players: Player[]) {
    const leader = this.getCurrentLeader(players);
    const currentPlayer =
      this.state.turnPhase === "leader"
        ? leader
        : this.getCurrentFollower(players);

    return {
      phase: this.state.turnPhase,
      leader: leader || null,
      currentPlayer: currentPlayer || null,
      currentCard: this.state.currentCard,
    };
  }

  /**
   * Processes a leader's turn attempt
   * @param attemptResult - Whether the leader successfully completed the trick
   * @param players - Array of all players in the game
   * @param onAddLetter - Callback function to execute when a player gets a letter
   * @param onPassLeadership - Callback function to execute when leadership should be passed
   * @remarks
   * - Draws a new card for the leader's attempt
   * - Records the turn result
   * - Handles success/failure states and triggers appropriate callbacks
   */
  public processLeaderTurn(
    attemptResult: AttemptResult,
    players: Player[],
    onAddLetter: (player: Player) => void,
    onPassLeadership: () => void
  ): void {
    const leader = this.getCurrentLeader(players);
    if (!leader) return;

    // Draw a new card at the start of leader's turn
    this.state.currentCard = this.drawCard();

    const turn: Turn = {
      playerId: leader.id,
      playerName: leader.name,
      card: this.state.currentCard,
      result: attemptResult,
      timestamp: Date.now(),
      turnType: "leader",
    };

    if (attemptResult === "landed") {
      // Leader successfully landed the trick
      const points = this.state.currentCard?.points || 0;
      turn.pointsAwarded = points;
      this.prepareFollowerTurns(players);
    } else {
      // Leader failed the trick
      onAddLetter(leader);
      onPassLeadership();
    }

    this.state.turns.push(turn);

    // Log the updated player scores
    console.log(
      "Updated player scores:",
      players.map((p) => `${p.name}: ${p.score || 0} points`)
    );
  }

  /**
   * Processes a follower's turn attempt
   * @param attemptResult - Whether the follower successfully completed the trick
   * @param players - Array of all players in the game
   * @param onAddLetter - Callback function to execute when a player gets a letter
   * @param onPassLeadership - Callback function to execute when leadership should be passed
   * @remarks
   * - Records the follower's attempt
   * - Handles success/failure states
   * - Automatically moves to next follower or back to leader as needed
   */
  public processFollowerTurn(
    attemptResult: AttemptResult,
    players: Player[],
    onAddLetter: (player: Player) => void,
    onPassLeadership: () => void
  ): void {
    const follower = this.getCurrentFollower(players);
    if (!follower || !this.state.currentCard) return;

    const turn: Turn = {
      playerId: follower.id,
      playerName: follower.name,
      card: this.state.currentCard,
      result: attemptResult,
      timestamp: Date.now(),
      turnType: "follower",
    };

    if (attemptResult === "landed") {
      // Follower successfully landed the trick - award points
      const points = this.state.currentCard?.points || 0;
      turn.pointsAwarded = points;
      console.log(`Follower ${follower.name} scored ${points} points`);
    } else {
      // Follower failed the trick - no points, add a letter
      onAddLetter(follower);
    }

    this.state.turns.push(turn);

    // Log the updated player scores
    console.log(
      "Updated player scores:",
      players.map((p) => `${p.name}: ${p.score || 0} points`)
    );

    // Followers get 1 attempt at the leader's trick
    if (attemptResult !== "landed") {
      onAddLetter(follower);
    }
    this.moveToNextPlayer(players, onPassLeadership);
  }

  public passLeadership(
    players: Player[],
    onRoundIncrement?: () => void
  ): void {
    const activePlayers = players.filter((p) => !p.isEliminated);
    if (activePlayers.length === 0) return;

    const currentLeaderIndex = activePlayers.findIndex(
      (p) => p.id === this.state.currentLeaderId
    );
    const nextLeaderIndex = (currentLeaderIndex + 1) % activePlayers.length;
    const newLeader = activePlayers[nextLeaderIndex];

    // Reset streak for the new leader
    if (newLeader) {
      newLeader.streak = 0;
    }

    this.state.currentLeaderId = newLeader.id;
    this.state.turnPhase = "leader";
    this.state.currentFollowerId = null;
    this.state.currentCard = this.drawCard();

    // Call the round increment callback if provided
    onRoundIncrement?.();
  }

  /**
   * Gets the current state of the turn manager
   * @returns A deep copy of the current turn manager state
   */
  /**
   * Gets the current state of the turn manager
   * @returns A deep copy of the current turn manager state including all turns
   */
  public getState() {
    return {
      ...this.state,
      turns: [...this.state.turns], // Ensure we return a new array reference
    };
  }

  /**
   * Gets the current leader player object
   * @param players - Array of all players in the game
   * @returns The current leader player or undefined if not found
   */
  private getCurrentLeader(players: Player[]): Player | undefined {
    return players.find((p) => p.id === this.state.currentLeaderId);
  }

  /**
   * Gets the current follower player object
   * @param players - Array of all players in the game
   * @returns The current follower player or undefined if not found
   */
  private getCurrentFollower(players: Player[]): Player | undefined {
    if (this.state.currentFollowerId === null) return undefined;
    return players.find((p) => p.id === this.state.currentFollowerId);
  }

  /**
   * Prepares the game state for follower turns after a successful leader attempt
   * @param players - Array of all players in the game
   * @remarks
   * - Sets up the turn order for followers
   * - Updates game state for follower phase
   */
  public prepareFollowerTurns(players: Player[]): void {
    const activePlayers = players.filter((p) => !p.isEliminated);
    const leader = this.getCurrentLeader(players);
    if (!leader) return;

    // Find the first follower (next player after leader)
    const leaderIndex = activePlayers.findIndex((p) => p.id === leader.id);
    const nextFollowerIndex = (leaderIndex + 1) % activePlayers.length;

    this.state.turnPhase = "follower";
    this.state.currentFollowerId = activePlayers[nextFollowerIndex].id;
  }

  /**
   * Moves to the next player in turn order
   * @param players - Array of all players in the game
   * @param onPassLeadership - Callback function to execute when leadership should be passed
   * @remarks
   * - Handles turn progression logic
   * - Manages the transition between leader and follower phases
   * - Automatically passes leadership when all followers have attempted
   */
  public moveToNextPlayer(
    players: Player[],
    onPassLeadership: () => void
  ): void {
    const activePlayers = players.filter((p) => !p.isEliminated);
    const currentFollower = this.getCurrentFollower(players);
    const leader = this.getCurrentLeader(players);

    if (!currentFollower || !leader) return;

    // Get all follower turns for the current leader's trick
    const currentLeaderTurns = this.state.turns.filter(
      (t) => t.card?.id === this.state.currentCard?.id
    );

    // Check if the current follower failed their attempt
    const lastTurn = this.state.turns[this.state.turns.length - 1];
    const currentFollowerFailed =
      lastTurn &&
      lastTurn.playerId === currentFollower.id &&
      lastTurn.result === "failed";

    // If current follower failed, draw a new card for the next player
    if (currentFollowerFailed) {
      this.state.currentCard = this.drawCard();
    }
    // If all followers have had their turn, draw a new card for the next leader
    else if (currentLeaderTurns.length >= activePlayers.length - 1) {
      this.state.currentCard = this.drawCard();
    }

    const currentIndex = activePlayers.findIndex(
      (p) => p.id === currentFollower.id
    );
    const nextIndex = (currentIndex + 1) % activePlayers.length;

    // If next player is the leader, leader's turn again
    if (activePlayers[nextIndex].id === leader.id) {
      this.state.turnPhase = "leader";
      this.state.currentFollowerId = null;

      // Draw a new card for the leader's next attempt
      this.state.currentCard = this.drawCard();

      // If leader has completed 3 successful tricks, pass leadership
      if (leader.streak >= 3) {
        leader.streak = 0;
        onPassLeadership();
        // toast
        // toast("Max 3 tricks reached! Passing leadership");
      }
    } else {
      // Next follower attempts the same trick
      this.state.turnPhase = "follower";
      this.state.currentFollowerId = activePlayers[nextIndex].id;
    }
  }

  /**
   * Draws a random card from the deck. Automatically handles deck reshuffling when needed.
   * - If the deck is empty, it will reshuffle either all cards or only unused ones
   * - Maintains game balance by tracking used cards
   * @returns {TrickCard} The drawn trick card or a default card if no cards are available
   * @throws {Error} If there's an issue drawing a card (though it has fallback behavior)
   */
  public drawCard(): TrickCard {
    if (this.state.deck.length === 0) {
      // Get all card IDs that have been used in the game
      const usedCardIds = new Set<number>(
        this.state.turns
          .map((turn) => turn.card?.id)
          .filter((id): id is number => id !== undefined)
      );

      // If we've used all cards, reset the deck with all cards
      if (usedCardIds.size >= trickCards.length) {
        this.state.deck = [...trickCards];
      } else {
        // Otherwise, only reshuffle the unused cards
        this.state.deck = trickCards.filter(
          (card) => !usedCardIds.has(card.id)
        );
      }

      // If we still have no cards (shouldn't happen), return a default card
      if (this.state.deck.length === 0) {
        console.error("No cards available to draw");
        return {
          id: Math.random() * trickCards.length,
          name: "No More Cards",
          description: "All cards have been used",
          difficulty: "Beginner",
          points: 0,
        };
      }
    }

    // Draw a random card from the deck
    const randomIndex = Math.floor(Math.random() * this.state.deck.length);
    return this.state.deck.splice(randomIndex, 1)[0];
  }

  /**
   * Initialize the first turn by drawing a card for the current leader
   */
  /**
   * Initializes the first turn of the game by drawing a card for the starting leader.
   * This should be called once at the beginning of a new game or round.
   * The drawn card becomes the current trick that players will attempt.
   */
  public initializeFirstTurn(): void {
    this.state.currentCard = this.drawCard();
  }
}
