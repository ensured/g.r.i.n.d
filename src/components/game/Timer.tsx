'use client';

import { useEffect, useState } from 'react';
import { GameState } from '@/types/types';
import { Button } from '../ui/button';
import { PlayIcon, XIcon } from 'lucide-react';

export function Timer({ gameState }: { gameState: GameState }) {
  console.log('GameTimer - gameState:', gameState);
  const [duration, setDuration] = useState<string>('00:00');
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Handle undefined or null gameState
  if (!gameState) {
    console.log('GameTimer - No game state, not rendering');
    return null;
  }

  const isRunning = gameState.gameStarted && !gameState.isGameOver && gameState.startTime !== null;

  // Update timer every second when game is running
  useEffect(() => {
    if (!isRunning || !gameState.startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diffMs = now.getTime() - gameState.startTime!.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const minutes = Math.floor(diffSec / 60)
        .toString()
        .padStart(2, '0');
      const seconds = (diffSec % 60).toString().padStart(2, '0');
      setDuration(`${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, gameState.startTime]);

  // Only render if game has started and has a start time
  if (!gameState.gameStarted || !gameState.startTime) {
    console.log('GameTimer - Game not started or no start time, not rendering');
    return null;
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-2 rounded-lg bg-background/50 flex gap-1.5 items-center cursor-pointer text-xs font-mono z-[9999] shadow-lg border border-border hover:bg-opacity-90 transition-colors"
        title="Show Timer"
      >
        <PlayIcon className="!size-4" />
        Game Timer
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 p-4 rounded-lg text-sm font-mono z-[9999] shadow-lg border border-border bg-background/50"
      style={{
        outline: '3px dashed lime',
        outlineOffset: '3px',
      }}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div className="text-xs font-semibold">Game Timer</div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            variant="ghost"
            className="text-xs opacity-70 cursor-pointer h-6 w-6 ml-1.5 "
            title="Hide Timer"
          >
            <XIcon />
          </Button>
        </div>
        <div className="text-xl font-bold">{duration}</div>
        <div className="text-xs">
          <div>Start: {gameState.startTime?.toLocaleTimeString() || '--:--:--'}</div>
          <div>End: {gameState.endTime?.toLocaleTimeString() || '--:--:--'}</div>
        </div>
      </div>
    </div>
  );
}
