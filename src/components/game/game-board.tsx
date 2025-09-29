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
                            onResetGame={onResetGame}
                            currentRound={gameState.round}
                        />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 2xl:grid-cols-4 gap-2">
                        {gameState.players.map((player) => (
                            <PlayerCard
                                key={player.id}
                                player={player}
                                isCurrent={currentPlayer ? currentPlayer.id === player.id : false}
                                isLeader={player.id === gameState.currentLeaderId}
                                isFollower={gameState.currentFollowerId === player.id}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
