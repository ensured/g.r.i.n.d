"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Game } from '@/lib/Game';
import { TrickCard } from "@/components/game/trick-card";
import { ActionButtons } from "@/components/game/action-buttons";
import { GameHeader } from "@/components/game/game-header";
import { PlayerSetupForm } from "@/components/game/PlayerSetupForm";
import { GameOverDialog } from "@/components/game/game-over-dialog";
import type { GameState, AttemptResult, Player } from '@/types/types';
import { GAME_SETTINGS, MESSAGES } from '@/constants';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showSetup, setShowSetup] = useState(true);
  const [playerNames, setPlayerNames] = useState<string[]>([
    MESSAGES.DEFAULT_PLAYER_NAME(0),
    MESSAGES.DEFAULT_PLAYER_NAME(1)
  ]);
  const gameRef = useRef<Game | null>(null);

  // Handle clearing all players, keeping only the first two players with their custom names
  const handleClearAllPlayers = useCallback(() => {
    setPlayerNames(prevNames => {
      // Take only the first two players
      const firstTwoPlayers = prevNames.slice(0, 2);

      // Ensure we have at least two players (in case there was only one)
      while (firstTwoPlayers.length < 2) {
        firstTwoPlayers.push(MESSAGES.DEFAULT_PLAYER_NAME(firstTwoPlayers.length));
      }

      // For the first two players, reset only if they have default names
      return firstTwoPlayers.map((name, index) => {
        const defaultPattern = new RegExp(`^Player\\s+${index + 1}$`, 'i');
        return defaultPattern.test(name) ? MESSAGES.DEFAULT_PLAYER_NAME(index) : name;
      });
    });
  }, []);


  const handleNewGame = useCallback(() => {
    // Reset game state and show player creation
    setShowSetup(true);
    gameRef.current = null;
    setGameState(null);
  }, []);

  // Handle player's attempt
  const handleAttempt = useCallback((result: AttemptResult) => {
    if (!gameRef.current) return;

    try {
      gameRef.current.processTurn(result);

      // Update game state after processing the turn
      const newState = gameRef.current.getState();

      // Check for winner and update state with winner info
      const winner = gameRef.current.getState().players.find(p => !p.isEliminated);
      if (winner && gameRef.current.getState().players.filter(p => !p.isEliminated).length === 1) {
        newState.isGameOver = true;
        newState.winner = winner;
        toast.success(`Game Over! ${winner.name} wins!`);
      }

      setGameState({ ...newState });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, []);

  // Start a new game
  const startNewGame = useCallback((playerNames: string[]) => {
    try {
      // Initialize the game with player names
      gameRef.current = new Game();
      gameRef.current.initializeGame(playerNames);

      // Get the initial game state
      const initialState = gameRef.current.getState();
      setGameState(initialState);
      setShowSetup(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to start game: ${error.message}`);
      }
    }
  }, []);

  // Handle player name changes
  const handlePlayerNameChange = useCallback((index: number, value: string) => {
    setPlayerNames(prevNames => {
      const newNames = [...prevNames];
      newNames[index] = value;
      return newNames;
    });
  }, []);

  // Handle adding a new player
  const handleAddPlayer = useCallback(() => {
    if (playerNames.length < GAME_SETTINGS.MAX_PLAYERS) {
      setPlayerNames(prevNames => [...prevNames, MESSAGES.DEFAULT_PLAYER_NAME(prevNames.length)]);
    }
  }, [playerNames.length]);

  // Handle removing a player
  const handleRemovePlayer = useCallback((index: number) => {
    // Don't allow removing Player 1 (index 0)
    if (index === 0) return;

    // Only remove if we'll still have at least MIN_PLAYERS after removal
    if (playerNames.length > GAME_SETTINGS.MIN_PLAYERS) {
      setPlayerNames(prevNames => prevNames.filter((_, i) => i !== index));
    }
  }, [playerNames.length]);

  if (showSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PlayerSetupForm
          gameRef={gameRef}
          initialPlayers={playerNames}
          onPlayerNameChange={handlePlayerNameChange}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayer}
          onClearAllPlayers={handleClearAllPlayers}
          onStartGame={startNewGame}
          isLoading={false}
          validPlayerCount={
            playerNames.length >= GAME_SETTINGS.MIN_PLAYERS &&
            playerNames.length <= GAME_SETTINGS.MAX_PLAYERS
          }
          error={
            playerNames.length < GAME_SETTINGS.MIN_PLAYERS ||
              playerNames.length > GAME_SETTINGS.MAX_PLAYERS
              ? MESSAGES.PLAYER_REQUIREMENT
              : undefined
          }
          showSuccess={
            playerNames.length >= GAME_SETTINGS.MIN_PLAYERS &&
            playerNames.length <= GAME_SETTINGS.MAX_PLAYERS
          }
        />
      </div>
    );
  }

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  // Get current player based on turn phase
  const currentPlayer = gameState.turnPhase === 'follower' && gameState.currentFollowerId !== null
    ? gameState.players.find(p => p.id === gameState.currentFollowerId)
    : gameState.players.find(p => p.id === gameState.currentLeaderId);

  const activePlayers = gameState.players.filter(p => !p.isEliminated).length;

  if (!currentPlayer) {
    return <div>Error: Current player not found</div>;
  }

  return (
    <div className="min-h-screen">


      <main className="container mx-auto px-4 py-4">

        {/* Current trick card */}
        {gameState.currentCard && (
          <div className="max-w-4xl mx-auto w-full mb-6">
            <TrickCard
              gameState={gameState}
              currentPlayer={currentPlayer}
              className="w-full"
            >
              <ActionButtons
                gameState={gameState}
                onAttempt={handleAttempt}
              />
            </TrickCard>
          </div>
        )}



        {/* Players status */}
        <div className="max-w-4xl mx-auto w-full mt-6">
          <div className='flex justify-between items-center py-1 mb-1'>
            <h2 className="text-lg font-bold text-muted-foreground">Players ({activePlayers}/{gameState.players.length})</h2>
            <GameHeader
              onNewGame={() => startNewGame(playerNames)}
              currentRound={gameState.round}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {gameState.players.map((player) => {
            const isCurrentPlayer = player.id === currentPlayer.id;
            const isLeader = player.id === gameState.currentLeaderId;
            const isFollower = gameState.currentFollowerId === player.id;

            return (
              <div
                key={player.id}
                className={cn(
                  "relative p-2 rounded-lg transition-all duration-200 overflow-hidden group",
                  isCurrentPlayer && "ring-1 ring-primary z-10 shadow-sm",
                  !isCurrentPlayer && "opacity-90 hover:opacity-100 hover:shadow-sm",
                  isLeader
                    ? "bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/5 dark:to-primary/20 border-l-4 border-primary"
                    : isFollower
                      ? "bg-green-50/80 dark:bg-green-900/20 border-l-4 border-green-500"
                      : "bg-card/80 dark:bg-card/90 border-l-4 border-border"
                )}
              >

                {/* Animated highlight for current leader */}
                {isLeader && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <h3 className={cn(
                      "text-xs font-medium truncate max-w-[100px]",
                      player.isEliminated ? "text-muted-foreground/60" : "text-foreground/90",
                      player.isEliminated && "line-through"
                    )}>
                      {player.name}
                    </h3>
                    {isLeader && (
                      <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                    )}
                    {isCurrentPlayer && (
                      <span className="text-[10px] px-1 py-0.5 rounded-full bg-primary/10 text-primary">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {['G', 'R', 'I', 'N', 'D'].map((letter, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "h-4 w-4 rounded text-[10px] flex items-center justify-center font-bold transition-colors",
                          player.letters.includes(letter)
                            ? "bg-red-500/90 text-white"
                            : "bg-muted/30 text-muted-foreground/30"
                        )}
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

        {/* Game Over Dialog */}
        <GameOverDialog
          isOpen={!!(gameState.isGameOver && gameState.winner)}

          onNewGame={() => startNewGame(playerNames)}
          onSetupNewGame={() => {
            setShowSetup(true);
            if (gameRef.current) {
              const newState = gameRef.current.getState();
              setGameState({ ...newState, isGameOver: false });
            }
          }}
          winner={gameState.winner || null}
          players={gameState.players}
        />
      </main>
    </div>
  );
}