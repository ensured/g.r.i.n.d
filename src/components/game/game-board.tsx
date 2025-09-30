import { useState } from 'react';
import { GameState, Player, AttemptResult } from '@/types/types';
import { ActionButtons } from '@/components/game/action-buttons';
import { GameHeader } from '@/components/game/game-header';
import { PlayerCard } from '@/components/game/player-card';
import { TrickCard } from '@/components/game/trick-card';

interface GameBoardProps {
    gameState: GameState;
    currentPlayer: Player | null;
    onAttempt: (result: AttemptResult) => void;
    onNewGame: () => void;
    onResetGame: () => void;
}

export function GameBoard({
    gameState,
    currentPlayer,
    onAttempt,
    onNewGame,
    onResetGame,
}: GameBoardProps) {
    const [resetKey, setResetKey] = useState(0);

    const handleResetGame = () => {
        // Increment the reset key to trigger re-render of SkateLetters
        setResetKey(prev => prev + 1);
        // Call the original reset handler
        onResetGame();
    };
    return (
        <div className="min-h-screen select-none">
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
                                onAttempt={onAttempt}
                            />
                        </TrickCard>
                    </div>
                )}

                {/* Players status */}
                <div className="max-w-4xl mx-auto w-full mt-6">
                    <div className='flex justify-between items-center py-1 mb-1'>
                        <h2 className="text-lg font-bold text-muted-foreground">
                            Players ({gameState.activePlayers}/{gameState.players.length})
                        </h2>
                        <GameHeader
                            onNewGame={onNewGame}
                            onResetGame={handleResetGame}
                            currentRound={gameState.currentRound}
                        />
                    </div>
                    <div className={"grid grid-cols-2 sm:grid-cols-2  gap-2" + (gameState.players.length >= 4 ? " 2xl:grid-cols-3" : "")}>
                        {gameState.players.map((player) => (
                            <PlayerCard
                                key={`${player.id}-${resetKey}`}
                                player={player}
                                isCurrent={currentPlayer ? currentPlayer.id === player.id : false}
                                isLeader={player.id === gameState.currentLeaderId}
                                isFollower={gameState.currentFollowerId === player.id}
                                resetKey={resetKey}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
