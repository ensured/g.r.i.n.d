"use client";

import { useState } from 'react';
import { PlayerSetupForm } from "@/components/game/PlayerSetupForm";
import { GameOverDialog } from "@/components/game/game-over-dialog";
import { GameBoard } from "@/components/game/game-board";
import { useGame } from '@/hooks/useGame';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { CreateUsernameForm } from '@/components/profile/CreateUsernameForm';
import { Loader2 } from 'lucide-react';
import { Timer } from '@/components/game/Timer';

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
    profileLoading
  } = useGame();

  // Show loading state while auth and profile are loading
  if (!isAuthLoaded || (isSignedIn && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[44.4vh] p-4">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  // If not signed in, show sign in prompt
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[44.4vh] p-4">
        <h1 className="text-2xl font-bold mb-2">Please Sign In</h1>
        <p className="text-muted-foreground mb-6">You must be signed in to play</p>
        <SignInButton />
      </div>
    );
  }

  // If we don't have a profile yet, show loading
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[44.4vh] p-4">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  // If signed in but no username set, show username form
  if (!profile.username) {
    return (
      <div className="container mx-auto max-w-md py-12 px-4">
        <CreateUsernameForm />
      </div>
    );
  }

  // At this point, we know the user is signed in and has a profile with a username
  const username = profile.username;

  // Set the first player's name to the username if it's the default
  const initialPlayers = playerNames[0] === 'Player 1'
    ? [username, ...playerNames.slice(1)]
    : playerNames;

  // Wrapper to handle the game start and UI state update
  const handleStartGame = (names: string[]) => {
    const success = startNewGame(names, username!); // Pass the creator's username
    if (success) {
      setShowSetup(false);
    }
  };

  // Player Setup 
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
        onNewGame={() => {
          setShowSetup(true);
        }}
        onResetGame={() => {
          startNewGame(playerNames, username!);
        }}
      />
      <GameOverDialog
        isOpen={!!(gameState.isGameOver && gameState.winner)}
        onNewGame={() => {
          startNewGame(playerNames, username!);
          setShowSetup(false);
        }}
        onSetupNewGame={() => {
          setShowSetup(true);
        }}
        winner={gameState.winner || null}
        players={gameState.players}
        startTime={gameState.startTime || undefined}
        endTime={gameState.endTime || undefined}
      />
    </>
  );
}