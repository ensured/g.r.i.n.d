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
      if (playerNames.length === 1) {
        handlePlayerNameChange(0, "");
        return;
      }
      if (playerNames.length > 1) {
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

  // Generate a cryptographically secure random number in range [0, max)
  const getCryptoRandom = (max: number) => {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    return (randomBuffer[0] / (0xffffffff + 1)) * max;
  };

  // Handle shuffling players or setting a specific order
  const handleShufflePlayers = useCallback((newOrder?: string[]) => {
    setPlayerNames((prevNames) => {
      if (newOrder && newOrder.length === prevNames.length) {
        // If a new order is provided and has the same length, use it
        return [...newOrder];
      }

      // Create a copy of the array to shuffle
      const shuffled = [...prevNames];

      // Enhanced Fisher-Yates shuffle with crypto.getRandomValues()
      for (let i = shuffled.length - 1; i > 0; i--) {
        // Get a cryptographically secure random index
        const j = Math.floor(getCryptoRandom(i + 1));

        // Swap elements
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // If the shuffled result is the same as the original, swap the first two elements
      // This ensures the order is always different from the original
      if (
        shuffled.every((val, idx) => val === prevNames[idx]) &&
        shuffled.length > 1
      ) {
        [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
      }

      return shuffled;
    });
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
    handleShufflePlayers,
  };
}
