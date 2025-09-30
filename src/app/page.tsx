"use client";

import { useCallback, useMemo, useState } from 'react';
import { PlayerSetupForm } from "@/components/game/PlayerSetupForm";
import { GameOverDialog } from "@/components/game/game-over-dialog";
import { GameBoard } from "@/components/game/game-board";
import { useGame } from '@/hooks/useGame';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { Timer } from '@/components/game/Timer';
import { CreateUsernameForm } from '@/components/profile/CreateUsernameForm';

export default function GamePage() {
  // All hooks must be called unconditionally at the top level
  const [showSetup, setShowSetup] = useState(true);
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();

  // Game-related hooks and state
  const {
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
    saveProfile
  } = useGame();

  // Get username safely
  const username = profile?.username || '';

  // Memoize the initial players array at the top level
  const initialPlayers = useMemo(() =>
    playerNames[0] === 'Player 1' && username
      ? [username, ...playerNames.slice(1)]
      : playerNames,
    [playerNames, username]
  );

  // All callbacks must be defined at the top level as well
  const handleStartGame = useCallback((names: string[]) => {
    if (!username) return;
    const success = startNewGame(names, username);
    if (success) {
      setShowSetup(false);
    }
  }, [startNewGame, username, setShowSetup]);

  const handleNewGame = useCallback(() => {
    setShowSetup(true);
  }, [setShowSetup]);

  const handleResetGame = useCallback(() => {
    if (username) {
      startNewGame(playerNames, username);
    }
  }, [startNewGame, playerNames, username]);

  const handleNewGameWithReset = useCallback(() => {
    if (username) {
      startNewGame(playerNames, username);
      setShowSetup(false);
    }
  }, [startNewGame, playerNames, username, setShowSetup]);

  const handleSetupNewGame = useCallback(() => {
    setShowSetup(true);
  }, [setShowSetup]);
  // Show loading state while auth is loading or if we're still loading the profile for a signed-in user
  if (!isAuthLoaded || (isSignedIn && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[44.4vh] p-4">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[44.4vh] p-4">
        <h1 className="text-2xl font-bold mb-2">Please Sign In</h1>
        <SignInButton />
      </div>
    );
  }

  // Show loading state only if we're still loading and don't have a profile yet
  if (profileLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[44.4vh] p-4">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  // Show username form if user is signed in but has no username
  if (isSignedIn && (!profile || !profile.username)) {
    return (
      <div className="container mx-auto max-w-md py-12 px-4">
        <CreateUsernameForm profile={profile} saveProfile={saveProfile} />
      </div>
    );
  }


  if (showSetup) {
    return (
      <div className="">
        <PlayerSetupForm
          initialPlayers={initialPlayers}
          onPlayerNameChange={handlePlayerNameChange}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayer}
          onClearAllPlayers={handleClearAllPlayers}
          onShufflePlayers={handleShufflePlayers}
          onStartGame={handleStartGame}
          isLoading={false}
          validPlayerCount={validPlayerCount.isValid}
          username={username!}
        />
      </div>
    );
  }

  if (!gameState) {
    return <div className="flex items-center justify-center min-h-screen">Loading game...</div>;
  }

  const currentPlayer = gameRef.current?.getCurrentPlayer();
  if (!currentPlayer) {
    return <div className="flex items-center justify-center min-h-screen">Error: Current player not found</div>;
  }

  return (
    <>
      <Timer gameState={gameState} />
      <GameBoard
        gameState={gameState}
        currentPlayer={currentPlayer}
        onAttempt={handleAttempt}
        onNewGame={handleNewGame}
        onResetGame={handleResetGame}
      />
      <GameOverDialog
        isOpen={!!(gameState.isGameOver && gameState.winner)}
        onNewGame={handleNewGameWithReset}
        onSetupNewGame={handleSetupNewGame}
        winner={gameState.winner || null}
        players={gameState.players}
        startTime={gameState.startTime || undefined}
        endTime={gameState.endTime || undefined}
      />
    </>
  );
}