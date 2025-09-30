import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Game } from "@/lib/Game";
import type { GameState, AttemptResult } from "@/types/types";
import { GAME_SETTINGS, MESSAGES } from "@/constants";
import { toast } from "sonner";
import { saveGameResults } from "@/actions/gameActions";
import { useProfile } from "./useProfile";

export function useGame() {
  const { profile, profileLoading } = useProfile();

  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerNames, setPlayerNames] = useState<string[]>([""]);
  const gameRef = useRef<Game | null>(null);

  // Validate player count
  const validPlayerCount = useMemo(() => {
    const isValid =
      playerNames.length >= GAME_SETTINGS.MIN_PLAYERS &&
      playerNames.length <= GAME_SETTINGS.MAX_PLAYERS;
    const error = !isValid ? MESSAGES.PLAYER_REQUIREMENT : undefined;

    return { isValid, error };
  }, [playerNames.length]);

  // Save game results to the database
  const saveGame = useCallback(async (state: GameState) => {
    if (!state.isGameOver || !state.winner || !state.endTime) return;

    try {
      console.log('Saving game results:', {
        winner: state.winner.name,
        duration: state.endTime.getTime() - state.startTime!.getTime(),
        players: state.players.length,
        endTime: state.endTime.toISOString()
      });
      
      await saveGameResults(state);
      toast.success("Game results saved!");
    } catch (error) {
      console.error("Failed to save game results:", error);
      toast.error("Failed to save game results");
    }
  }, []);

  // Listen for game end events
  useEffect(() => {
    const handleGameEnd = (e: CustomEvent) => {
      console.log('Game end event received:', e.detail);
      if (gameState && !gameState.isGameOver) {
        const updatedState = { ...gameState, isGameOver: true, endTime: e.detail.endTime };
        setGameState(updatedState);
        saveGame(updatedState);
      }
    };

    // @ts-ignore - CustomEvent is not in the lib.dom.d.ts
    window.addEventListener('game:end', handleGameEnd);
    return () => {
      // @ts-ignore
      window.removeEventListener('game:end', handleGameEnd);
    };
  }, [gameState, saveGame]);

  // Handle player's attempt
  const handleAttempt = useCallback(
    (result: AttemptResult) => {
      if (!gameRef.current) return;

      try {
        // Process the turn
        gameRef.current.processTurn(result);

        // Get the updated state after processing the turn
        const newState = gameRef.current.getState();

        // Log the state for debugging
        console.log("Game state after turn:", {
          players: newState.players.map((p) => ({
            name: p.name,
            score: p.score,
            tricksLanded: p.tricksLanded || 0,
            tricksAttempted: p.tricksAttempted || 0,
            successRate:
              p.tricksAttempted > 0
                ? Math.round(((p.tricksLanded || 0) / p.tricksAttempted) * 100)
                : 0,
          })),
          currentTurn: newState.turns[newState.turns.length - 1],
          result,
        });

        // Check for game over condition
        const activePlayers = newState.players.filter((p) => !p.isEliminated);
        if (activePlayers.length === 1) {
          const [winner] = activePlayers;
          const now = new Date();

          // Update game state with end time and winner
          newState.isGameOver = true;
          newState.winner = winner;
          newState.endTime = now;

          // Log the data we're about to save
          console.log("Game over! Saving results...", {
            winner: winner.name,
            score: winner.score,
            players: newState.players.map((p) => ({
              name: p.name,
              score: p.score,
              tricksLanded: p.tricksLanded || 0,
              tricksAttempted: p.tricksAttempted || 0,
              isEliminated: p.isEliminated,
              letters: p.letters,
            })),
          });

          // Save the game results (don't await to avoid blocking)
          saveGame(newState).catch((error) => {
            console.error("Failed to save game results:", error);
            toast.error("Failed to save game results");
          });
        }

        // Force a re-render with the new state
        setGameState({ ...newState });
      } catch (error) {
        console.error("Error processing turn:", error);
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    },
    [saveGame]
  );

  // Start a new game
  const startNewGame = useCallback(
    (names: string[], creatorUsername: string) => {
      try {
        gameRef.current = new Game();
        gameRef.current.initializeGame(names, creatorUsername);
        const newState = gameRef.current.getState();

        // Set the start time when a new game begins
        const now = new Date();
        setGameState({
          ...newState,
          startTime: now,
          endTime: null,
          creatorUsername,
        });
        return true;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Failed to start game: ${error.message}`);
        }
        return false;
      }
    },
    []
  );

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
    [playerNames.length, handlePlayerNameChange]
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
    return (randomBuffer[0] / (0xffffffff + 1)) * max;
  };

  // Handle shuffling players or setting a specific order
  const handleShufflePlayers = useCallback(
    (newOrder?: string[]) => {
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
        if (shuffled.every((val, idx) => val === prevNames[idx])) {
          [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
        }

        return shuffled;
      });
    },
    [] // No dependencies needed as we only use state setters and stable functions
  );

  useEffect(() => {
    if (profile?.username && playerNames[0] === "") {
      setPlayerNames([profile.username]);
    }
  }, [profile?.username, playerNames]);

  return {
    profile,
    gameState,
    playerNames,
    gameRef,
    validPlayerCount,
    handleAttempt,
    startNewGame,
    handlePlayerNameChange,
    handleAddPlayer,
    handleRemovePlayer,
    handleClearAllPlayers,
    handleShufflePlayers,
    profileLoading,
  };
}
