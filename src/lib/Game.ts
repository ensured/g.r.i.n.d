import { GameState, Player, AttemptResult, Turn } from "@/types/types";
import { TurnManager } from "./TurnManager";
import { PlayerManager } from "./PlayerManager";
import { trickCards } from "@/types/tricks";

export class Game {
  private state: GameState;
  private turnManager: TurnManager;
  private playerManager: PlayerManager;
  private readonly GAME_WORD = "G.R.I.N.D";

  // Get the current game state
  public getState(): GameState {
    const players = this.playerManager.getPlayers();
    const turnState = this.turnManager.getState();
    const isGameOver = this.playerManager.checkGameOver();

    if (isGameOver && !this.state.isGameOver) {
      this.state.isGameOver = true;
    }

    // Always sync the current card from the turn manager
    this.state.currentCard = turnState.currentCard;

    return {
      ...this.state,
      ...turnState,
      players,
      gameWord: this.GAME_WORD,
      gameStarted: this.state.gameStarted,
      isGameOver,
      round: this.state.round,
      currentCard: turnState.currentCard, // Use the card from turn manager
      turnPhase: turnState.turnPhase,
      currentLeaderId: turnState.currentLeaderId,
      currentFollowerId: turnState.currentFollowerId,
      turns: turnState.turns || [],
      winner: this.state.winner || null,
    };
  }

  constructor(initialState: Partial<GameState> = {}) {
    // Initialize player manager first
    this.playerManager = new PlayerManager(initialState.players || []);

    // Initialize turn manager
    this.turnManager = new TurnManager({
      currentLeaderId: initialState.currentLeaderId || 0,
      currentFollowerId: initialState.currentFollowerId || null,
      turnPhase: (initialState.turnPhase as any) || "leader",
      currentCard: initialState.currentCard || null,
      deck: [...trickCards],
      turns: initialState.turns || [],
    });

    // Initialize state with all required properties
    const turnState = this.turnManager.getState();
    this.state = {
      gameStarted: false,
      isGameOver: false,
      round: 0,
      players: this.playerManager.getPlayers(),
      deck: [...trickCards],
      currentCard: turnState.currentCard,
      turnPhase: turnState.turnPhase as any,
      currentLeaderId: turnState.currentLeaderId,
      currentFollowerId: turnState.currentFollowerId,
      turns: turnState.turns,
      gameWord: this.GAME_WORD,
      winner: null,
      ...initialState, // Override with any provided initial state
    };
  }

  // Initialize a new game with players
  public initializeGame(playerNames: string[]): void {
    if (playerNames.length < 2) {
      throw new Error("At least 2 players are required to start the game");
    }

    // Initialize players
    const players = playerNames.map((name, index) => ({
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

    // Update game state with all required properties
    const turnState = this.turnManager.getState();
    this.state = {
      ...this.state,
      gameStarted: true,
      isGameOver: false,
      round: 0,
      players: this.playerManager.getPlayers(),
      currentCard: turnState.currentCard,
      turnPhase: turnState.turnPhase as any,
      currentLeaderId: turnState.currentLeaderId,
      currentFollowerId: turnState.currentFollowerId,
      turns: turnState.turns,
      gameWord: this.GAME_WORD,
      winner: null,
    };
    
    // Remove the second call to initializeFirstTurn() as it's redundant
  }

  /**
   * Process a turn for either leader or follower
   * @param attemptResult Whether the trick was landed or failed
   */
  public processTurn(attemptResult: AttemptResult): void {
    if (this.state.isGameOver) {
      throw new Error("The game is already over");
    }

    const players = this.playerManager.getPlayers();
    const turnState = this.turnManager.getState();
    const isLeader = turnState.turnPhase === "leader";
    
    // Get the current player based on turn phase
    const currentPlayer = isLeader
      ? players.find((p) => p.id === turnState.currentLeaderId)
      : players.find((p) => p.id === turnState.currentFollowerId);

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
        this.playerManager.updatePlayer(currentPlayer.id, { 
          streak: currentPlayer.streak + 1 
        });
        this.turnManager.prepareFollowerTurns(players);
        
        // Update the turn phase in our local state
        const newTurnState = this.turnManager.getState();
        this.state.turnPhase = newTurnState.turnPhase as any;
        this.state.currentFollowerId = newTurnState.currentFollowerId;
      } else {
        // If leader fails, pass leadership
        this.playerManager.updatePlayer(currentPlayer.id, { streak: 0 });
        this.playerManager.addLetter(currentPlayer.id);
        this.turnManager.passLeadership(players, () => {
          this.state.round++;
        });
      }
    } else {
      // Handle follower turn
      if (attemptResult !== "landed") {
        this.playerManager.addLetter(currentPlayer.id);
      }
      
      // Move to next follower or back to leader
      this.turnManager.moveToNextPlayer(players, () => {
        // This callback runs when we need to pass leadership
        this.turnManager.passLeadership(players, () => {
          this.state.round++;
        });
      });
      
      // Update the turn phase in our local state
      const newTurnState = this.turnManager.getState();
      this.state.turnPhase = newTurnState.turnPhase as any;
      this.state.currentFollowerId = newTurnState.currentFollowerId;
    }

    // Update the current leader ID in case it changed
    const updatedTurnState = this.turnManager.getState();
    this.state.currentLeaderId = updatedTurnState.currentLeaderId;
    
    // Check for game over
    this.state.isGameOver = this.playerManager.checkGameOver();
  }

}
