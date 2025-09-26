import { Player, Turn, AttemptResult, TrickCard } from "@/types/types";
import { trickCards } from "@/types/tricks";
import { toast } from "sonner";

type TurnPhase = "leader" | "follower";

export class TurnManager {
  private state: {
    currentLeaderId: number;
    currentFollowerId: number | null;
    turnPhase: TurnPhase;
    currentCard: TrickCard | null;
    deck: TrickCard[];
    turns: Turn[];
  };

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

    // If there's still no card after drawing, we have a problem
    if (!this.state.currentCard) {
      console.error("No cards left in the deck");
      return;
    }

    const turn: Turn = {
      playerId: leader.id,
      playerName: leader.name,
      card: this.state.currentCard,
      result: attemptResult,
      timestamp: Date.now(),
      turnType: "leader",
    };

    this.state.turns.push(turn);

    if (attemptResult === "landed") {
      // Leader successfully landed the trick
      leader.streak++;
      this.prepareFollowerTurns(players);
    } else {
      // Leader failed the trick
      leader.streak = 0;
      onAddLetter(leader);
      onPassLeadership();
    }
  }

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

    this.state.turns.push(turn);

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

    this.state.currentLeaderId = activePlayers[nextLeaderIndex].id;
    this.state.turnPhase = "leader";
    this.state.currentFollowerId = null;
    this.state.currentCard = this.drawCard();

    // Call the round increment callback if provided
    onRoundIncrement?.();
  }

  public getState() {
    return { ...this.state };
  }

  private getCurrentLeader(players: Player[]): Player | undefined {
    return players.find((p) => p.id === this.state.currentLeaderId);
  }

  private getCurrentFollower(players: Player[]): Player | undefined {
    if (this.state.currentFollowerId === null) return undefined;
    return players.find((p) => p.id === this.state.currentFollowerId);
  }

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
        toast("Max 3 tricks reached! Passing leadership");
      }
    } else {
      // Next follower attempts the same trick
      this.state.turnPhase = "follower";
      this.state.currentFollowerId = activePlayers[nextIndex].id;
    }
  }

  /**
   * Draw a random card from the deck
   * Reshuffles the deck if it's empty
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
  public initializeFirstTurn(): void {
    this.state.currentCard = this.drawCard();
  }
}
