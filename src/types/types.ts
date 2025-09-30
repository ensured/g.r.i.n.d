export type TrickCard = {
  id: number;
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Pro";
  points: number;
  description: string;
};

export type Player = {
  id: number;
  name: string;
  score: number;
  isEliminated: boolean;
  letters: string[];
  streak: number; // Tracks current consecutive successful tricks (max 3)
  tricksLanded: number; // Tracks total successful tricks
  tricksAttempted: number; // Tracks total trick attempts
};

export type GameState = {
  gameStarted: boolean;
  startTime: Date | null;  // Null before game starts
  endTime: Date | null;
  players: Player[];
  deck: TrickCard[];
  currentCard: TrickCard | null;
  turnPhase: TurnPhase;
  round: number;
  isGameOver: boolean;
  gameWord: string;
  turns: Turn[];
  currentLeaderId: number; // ID of the current leader
  currentFollowerId: number | null; // ID of the current follower (if any)
  winner?: Player | null; // The winning player when the game is over
  activePlayers: number; // Number of active (non-eliminated) players
  creatorUsername: string; // Username of the game creator
};

export type AttemptResult = "landed" | "failed";

export type TurnPhase = "leader" | "follower";

export interface Turn {
  playerId: number;
  playerName: string;
  turnNumber?: number;
  card: TrickCard | null;
  result: "landed" | "failed";
  timestamp: number;
  turnType: TurnPhase;
  pointsAwarded?: number;
}
