"use client";

import { useState } from 'react';
import { PlayerSetupForm } from "@/components/game/PlayerSetupForm";
import { GameOverDialog } from "@/components/game/game-over-dialog";
import { GameBoard } from "@/components/game/game-board";
import { useGame } from '@/hooks/useGame';

export default function GamePage() {
  const [showSetup, setShowSetup] = useState(true);

  const {
    gameState,
    playerNames,
    gameRef,
    validPlayerCount,
    handleAttempt,
    startNewGame,
    handlePlayerNameChange,
    handleAddPlayer,
    handleRemovePlayer,
    handleClearAllPlayers
  } = useGame();

  // Wrapper to handle the game start and UI state update
  const handleStartGame = (names: string[]) => {
    const success = startNewGame(names);
    if (success) {
      setShowSetup(false);
    }
  };


  // Player Setup 
  if (showSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PlayerSetupForm
          initialPlayers={playerNames}
          onPlayerNameChange={handlePlayerNameChange}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayer}
          onClearAllPlayers={handleClearAllPlayers}
          onStartGame={handleStartGame}
          isLoading={false}
          validPlayerCount={validPlayerCount.isValid}
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
      <GameBoard
        gameState={gameState}
        currentPlayer={currentPlayer}
        onAttempt={handleAttempt}
        onNewGame={() => startNewGame(playerNames)}
      />
      <GameOverDialog
        isOpen={!!(gameState.isGameOver && gameState.winner)}
        onNewGame={() => {
          startNewGame(playerNames);
          setShowSetup(false);
        }}
        onSetupNewGame={() => setShowSetup(true)}
        winner={gameState.winner || null}
        players={gameState.players}
      />
    </>
  );
}