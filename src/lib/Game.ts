import { GameState, Player, AttemptResult, Turn } from "@/types/types";
import { TurnManager } from "./TurnManager";
import { PlayerManager } from "./PlayerManager";
import { trickCards } from "@/types/tricks";

export class Game {
  private state: GameState;
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

    // Apply updates to state
    this.state = { ...this.state, ...updates };
  }

  /**
   * Updates player-related state
   */
  private updatePlayerState(): void {
    const players = this.playerManager.getPlayers();
    const activePlayers = this.getActivePlayers();
    const isGameOver = this.playerManager.checkGameOver();

    this.updateState(
      {
        players,
        activePlayers: activePlayers.length,
        isGameOver,
        winner: isGameOver
          ? this.state.winner || players.find((p) => !p.isEliminated) || null
          : null,
      },
      true
    );
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
    // Initialize with default state
    this.state = this.getDefaultState();

    // Initialize player manager with provided or empty players
    this.playerManager = new PlayerManager(initialState.players || []);

    // Initialize turn manager with provided or default values
    this.turnManager = new TurnManager({
      currentLeaderId: initialState.currentLeaderId || 0,
      currentFollowerId: initialState.currentFollowerId || null,
      turnPhase: (initialState.turnPhase as any) || "leader",
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
    };
  }

  /**
   * Initialize a new game with players
   * @param playerNames Array of player names
   */
  public initializeGame(playerNames: string[]): void {
    if (playerNames.length < 2) {
      throw new Error("At least 2 players are required to start the game");
    }

    // Initialize players
    const players = playerNames.map((name: string, index: number) => ({
      id: index,
      name,
      score: 0,
      isEliminated: false,
      letters: [],
      streak: 0,
    }));

    // Initialize player manager with new players
    this.playerManager = new PlayerManager(players);

    // Initialize turn manager with a fresh deck
    this.turnManager = new TurnManager({
      currentLeaderId: 0,
      currentFollowerId: null,
      turnPhase: "leader",
      deck: [...trickCards],
      currentCard: null,
      turns: [],
    });

    // Initialize the first turn with a card for the leader
    this.turnManager.initializeFirstTurn();

    // Update game state
    this.updateState({
      ...this.getDefaultState(),
      gameStarted: true,
      players: this.playerManager.getPlayers(),
      activePlayers: this.getActivePlayers().length,
    });

    // Update derived state
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

    if (!turnState) return;

    const isLeader = turnState.turnPhase === "leader";

    // Get the current player based on turn phase
    const currentPlayer = isLeader
      ? players.find((p: Player) => p.id === turnState.currentLeaderId)
      : players.find((p: Player) => p.id === turnState.currentFollowerId);

    if (!currentPlayer) return;

    // Create and record the turn
    const turn: Turn = {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      card: turnState.currentCard,
      result: attemptResult,
      timestamp: Date.now(),
      turnType: isLeader ? "leader" : "follower",
    };

    // Process the turn based on player type
    if (isLeader) {
      if (attemptResult === "landed") {
        // If leader lands the trick, prepare follower turns
        this.playerManager?.updatePlayer(currentPlayer.id, {
          streak: (currentPlayer.streak || 0) + 1,
        });
        this.turnManager?.prepareFollowerTurns(players);
      } else {
        // If leader fails, pass leadership
        this.playerManager?.updatePlayer(currentPlayer.id, { streak: 0 });
        this.playerManager?.addLetter(currentPlayer.id);
        this.turnManager?.passLeadership(players, () => {
          this.updateState({
            round: (this.state.round || 0) + 1,
          });
        });
      }
    } else {
      // Handle follower turn
      if (attemptResult !== "landed") {
        this.playerManager?.addLetter(currentPlayer.id);
      }

      // Move to next follower or back to leader
      this.turnManager?.moveToNextPlayer(players, () => {
        // This callback runs when we need to pass leadership
        this.turnManager?.passLeadership(players, () => {
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
