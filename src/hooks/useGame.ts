import { useState, useRef, useCallback, useMemo } from "react";
import { Game } from "@/lib/Game";
import type { GameState, AttemptResult } from "@/types/types";
import { GAME_SETTINGS, MESSAGES } from "@/constants";
import { toast } from "sonner";

export function useGame() {
  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerNames, setPlayerNames] = useState<string[]>([
    MESSAGES.DEFAULT_PLAYER_NAME(0),
    MESSAGES.DEFAULT_PLAYER_NAME(1),
  ]);
  const gameRef = useRef<Game | null>(null);

  // Validate player count
  const validPlayerCount = useMemo(() => {
    const isValid =
      playerNames.length >= GAME_SETTINGS.MIN_PLAYERS &&
      playerNames.length <= GAME_SETTINGS.MAX_PLAYERS;
    const error = !isValid ? MESSAGES.PLAYER_REQUIREMENT : undefined;

    return { isValid, error };
  }, [playerNames.length]);

  // Handle player's attempt
  const handleAttempt = useCallback((result: AttemptResult) => {
    if (!gameRef.current) return;

    try {
      gameRef.current.processTurn(result);
      const newState = gameRef.current.getState();
      const activePlayers = newState.players.filter((p) => !p.isEliminated);

      if (activePlayers.length === 1) {
        const [winner] = activePlayers;
        newState.isGameOver = true;
        newState.winner = winner;
      }

      setGameState({ ...newState });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, []);

  // Start a new game
  const startNewGame = useCallback((names: string[]) => {
    try {
      gameRef.current = new Game();
      gameRef.current.initializeGame(names);
      const initialState = gameRef.current.getState();
      setGameState(initialState);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to start game: ${error.message}`);
      }
      return false;
    }
  }, []);

  // Handle player name changes
  const handlePlayerNameChange = useCallback((index: number, value: string) => {
    setPlayerNames((prevNames) => {
      const newNames = [...prevNames];
      newNames[index] = value;
      return newNames;
    });
  }, []);

  // Handle adding a new player
  const handleAddPlayer = useCallback(() => {
    if (playerNames.length < GAME_SETTINGS.MAX_PLAYERS) {
      setPlayerNames((prevNames) => [
        ...prevNames,
        MESSAGES.DEFAULT_PLAYER_NAME(prevNames.length),
      ]);
    }
  }, [playerNames.length]);

  // Handle removing a player
  const handleRemovePlayer = useCallback(
    (index: number) => {
      if (playerNames.length > GAME_SETTINGS.MIN_PLAYERS) {
        setPlayerNames((prevNames) => prevNames.filter((_, i) => i !== index));
      }
    },
    [playerNames.length]
  );

  // Handle clearing all players - keeps only the first player
  const handleClearAllPlayers = useCallback(() => {
    setPlayerNames((prevNames) =>
      prevNames.length > 0 && prevNames[0] !== "Player1"
        ? [prevNames[0]]
        : [MESSAGES.DEFAULT_PLAYER_NAME(0)]
    );
  }, []);

  return {
    // State
    gameState,
    playerNames,
    gameRef,

    // Derived state
    validPlayerCount,

    // Handlers
    handleAttempt,
    startNewGame,
    handlePlayerNameChange,
    handleAddPlayer,
    handleRemovePlayer,
    handleClearAllPlayers,
  };
}
