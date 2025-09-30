import { GameState, Player, AttemptResult, TurnPhase } from "@/types/types";
import { TurnManager } from "./TurnManager";
import { PlayerManager } from "./PlayerManager";
import { trickCards } from "@/types/tricks";

export class Game {
  private state: GameState = this.getDefaultState();
  private turnManager: TurnManager;
  private playerManager: PlayerManager;
  private readonly GAME_WORD = "GRIND";
  private stateHistory: GameState[] = [];
  private readonly MAX_HISTORY_LENGTH = 10;

  // Get the current game state
  /**
   * Updates the game state in a controlled way
   * @param updates Partial state with updates to apply
   * @param skipHistory Whether to skip adding to history (for internal use)
   */
  private updateState(updates: Partial<GameState>, skipHistory = false): void {
    // Save current state to history (unless skipped)
    if (!skipHistory) {
      this.stateHistory = [this.state, ...this.stateHistory].slice(
        0,
        this.MAX_HISTORY_LENGTH
      );
    }

    // Apply updates to state with proper immutability
    this.state = {
      ...this.state,
      ...updates,
      // Ensure players array is a new reference if it's being updated
      players: updates.players ? [...updates.players] : this.state.players,
    };
  }

  /**
   * Updates player-related state
   */
  private updatePlayerState(): void {
    const players = this.playerManager.getPlayers();
    const activePlayers = this.getActivePlayers();
    const isGameOver = this.playerManager.checkGameOver();
    const gameJustEnded = isGameOver && !this.state.isGameOver;

    const updates: Partial<GameState> = {
      players,
      activePlayers: activePlayers.length,
      isGameOver,
      winner: isGameOver
        ? this.state.winner || players.find((p) => !p.isEliminated) || null
        : null,
    };

    // If game just ended, set the end time and trigger save
    if (gameJustEnded) {
      const endTime = new Date();
      updates.endTime = endTime;
      
      // Dispatch a custom event that the game has ended
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('game:end', { 
          detail: { 
            endTime,
            winner: updates.winner 
          } 
        }));
      }
    }

    this.updateState(updates, true);
  }

  /**
   * Updates turn-related state
   */
  private updateTurnState(): void {
    const turnState = this.turnManager.getState();
    this.updateState(
      {
        ...turnState,
        currentCard: turnState.currentCard,
        turns: turnState.turns || [],
      },
      true
    );
  }

  /**
   * Gets the current player based on the current turn phase
   * @returns The current player or undefined if not found
   */
  public getCurrentPlayer(): Player | undefined {
    const players = this.playerManager.getPlayers();
    const { turnPhase, currentLeaderId, currentFollowerId } =
      this.turnManager.getState();

    return turnPhase === "follower" && currentFollowerId !== null
      ? players.find((p) => p.id === currentFollowerId)
      : players.find((p) => p.id === currentLeaderId);
  }

  /**
   * Gets all active (non-eliminated) players
   * @returns Array of active players
   */
  public getActivePlayers(): Player[] {
    return this.playerManager.getPlayers().filter((p) => !p.isEliminated);
  }

  /**
   * Gets the current game state
   * @returns A snapshot of the current game state
   */
  public getState(): GameState {
    // Always return a fresh snapshot of the state
    return { ...this.state };
  }

  constructor(initialState: Partial<GameState> = {}) {
    // Initialize with default state first
    this.state = this.getDefaultState();

    // Set creatorUsername from initialState if provided
    if (initialState.creatorUsername) {
      this.state.creatorUsername = initialState.creatorUsername;
    }

    // Initialize player manager with provided or empty players
    this.playerManager = new PlayerManager(initialState.players || []);

    // Initialize turn manager with provided or default values
    this.turnManager = new TurnManager({
      currentLeaderId: initialState.currentLeaderId || 0,
      currentFollowerId: initialState.currentFollowerId || null,
      turnPhase: (initialState.turnPhase as TurnPhase) || "leader",
      currentCard: initialState.currentCard || null,
      deck: [...trickCards],
      turns: initialState.turns || [],
    });

    // Initialize state with all required properties
    this.updateState(
      {
        ...this.state,
        ...initialState,
        gameWord: this.GAME_WORD,
        deck: [...trickCards],
      },
      true
    );

    // Update derived state
    this.updatePlayerState();
    this.updateTurnState();
  }

  /**
   * Gets the default initial state for a new game
   */
  private getDefaultState(): GameState {
    return {
      gameStarted: false,
      isGameOver: false,
      round: 0,
      players: [],
      deck: [...trickCards],
      currentCard: null,
      turnPhase: "leader",
      currentLeaderId: 0,
      currentFollowerId: null,
      turns: [],
      gameWord: this.GAME_WORD,
      winner: null,
      activePlayers: 0,
      creatorUsername: "", // Initialize with empty string, will be set in constructor
      startTime: null, // Will be set when game starts
      endTime: null, // Will be set when game ends
    };
  }

  /**
   * Initialize a new game with players
   * @param playerNames Array of player names
   * @param creatorUsername Username of the game creator
   */
  public initializeGame(playerNames: string[], creatorUsername: string): void {
    if (playerNames.length < 2) {
      throw new Error("At least 2 players are required to start the game");
    }

    // Initialize players
    this.playerManager.initializePlayers(playerNames);

    // Set the first player as the leader
    const firstPlayer = this.playerManager.getPlayers()[0];
    if (!firstPlayer) {
      throw new Error("Failed to initialize game: No players found");
    }

    // Initialize turn manager with the first player as leader
    this.turnManager = new TurnManager({
      currentLeaderId: firstPlayer.id,
      turnPhase: "leader" as const,
      deck: [...trickCards],
    });

    // Initialize game state with creatorUsername and start time
    const initialState: Partial<GameState> = {
      players: this.playerManager.getPlayers(),
      currentLeaderId: firstPlayer.id,
      currentFollowerId: null,
      turnPhase: "leader",
      isGameOver: false,
      gameStarted: true,
      activePlayers: playerNames.length,
      creatorUsername: creatorUsername,
      startTime: new Date(), // Set the actual start time when game begins
      endTime: null,
    };

    // Update the state with the new initial state
    this.updateState(initialState);

    // Initialize the first turn by drawing a card
    this.turnManager.initializeFirstTurn();

    // Update derived state
    this.updatePlayerState();
    this.updateTurnState();
  }

  /**
   * Process a turn for either leader or follower
   * @param attemptResult Whether the trick was landed or failed
   */
  public processTurn(attemptResult: AttemptResult): void {
    if (this.state.isGameOver) {
      throw new Error("The game is already over");
    }

    const players = this.playerManager?.getPlayers() || [];
    const turnState = this.turnManager?.getState();

    if (!turnState || !turnState.currentCard) return;

    const isLeader = turnState.turnPhase === "leader";
    const currentPlayer = isLeader
      ? players.find((p: Player) => p.id === turnState.currentLeaderId)
      : players.find((p: Player) => p.id === turnState.currentFollowerId);

    if (!currentPlayer) return;

    // Process the turn based on player type
    if (isLeader) {
      if (attemptResult === "landed") {
        // If leader lands the trick, award points and prepare follower turns
        const points = turnState.currentCard?.points || 0;
        this.playerManager?.updatePlayer(currentPlayer.id, {
          streak: (currentPlayer.streak || 0) + 1,
          score: (currentPlayer.score || 0) + points,
          tricksLanded: (currentPlayer.tricksLanded || 0) + 1,
          tricksAttempted: (currentPlayer.tricksAttempted || 0) + 1,
        });
        console.log(
          `[Game] Leader ${
            currentPlayer.name
          } scored ${points} points (Total: ${currentPlayer.score + points})`
        );
        console.log(
          `[Game] Tricks: ${(currentPlayer.tricksLanded || 0) + 1}/${
            (currentPlayer.tricksAttempted || 0) + 1
          }`
        );
        this.turnManager.prepareFollowerTurns(players);
      } else {
        // If leader fails, add a letter and pass leadership
        this.playerManager?.updatePlayer(currentPlayer.id, {
          streak: 0,
          tricksAttempted: (currentPlayer.tricksAttempted || 0) + 1,
        });
        this.playerManager?.addLetter(currentPlayer.id);
        console.log(`[Game] Leader ${currentPlayer.name} failed the trick`);
        console.log(
          `[Game] Tricks: ${currentPlayer.tricksLanded || 0}/${
            (currentPlayer.tricksAttempted || 0) + 1
          }`
        );
        this.turnManager?.passLeadership(players, () => {
          this.updateState({
            round: (this.state.round || 0) + 1,
          });
        });
      }
    } else {
      // Handle follower turn
      if (attemptResult === "landed") {
        // Award points to follower for landing the trick
        const points = turnState.currentCard?.points || 0;
        this.playerManager?.updatePlayer(currentPlayer.id, {
          score: (currentPlayer.score || 0) + points,
          streak: (currentPlayer.streak || 0) + 1,
          tricksLanded: (currentPlayer.tricksLanded || 0) + 1,
          tricksAttempted: (currentPlayer.tricksAttempted || 0) + 1,
        });
        console.log(
          `[Game] Follower ${
            currentPlayer.name
          } scored ${points} points (Total: ${currentPlayer.score + points})`
        );
        console.log(
          `[Game] Tricks: ${(currentPlayer.tricksLanded || 0) + 1}/${
            (currentPlayer.tricksAttempted || 0) + 1
          }`
        );
      } else {
        // Follower failed, add a letter
        this.playerManager?.updatePlayer(currentPlayer.id, {
          streak: 0,
          tricksAttempted: (currentPlayer.tricksAttempted || 0) + 1,
        });
        this.playerManager?.addLetter(currentPlayer.id);
        console.log(`[Game] Follower ${currentPlayer.name} failed the trick`);
        console.log(
          `[Game] Tricks: ${currentPlayer.tricksLanded || 0}/${
            (currentPlayer.tricksAttempted || 0) + 1
          }`
        );
      }

      // Move to next follower or back to leader
      this.turnManager.moveToNextPlayer(players, () => {
        // This callback runs when we need to pass leadership
        this.turnManager.passLeadership(players, () => {
          this.updateState({
            round: (this.state.round || 0) + 1,
          });
        });
      });
    }

    // Update all derived state
    this.updatePlayerState();
    this.updateTurnState();
  }
}
