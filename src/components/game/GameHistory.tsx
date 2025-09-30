'use client';
import { useEffect, useState } from 'react';
import { getGameDetails } from '@/actions/game-queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Clock3, Trophy, Target, Loader2, Award, Clock } from "lucide-react";
import { SkateLetters } from "./skate-letters";
import { GameResult, PlayerResult } from "@/actions/game-queries";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


function formatGameDuration(startTime: string | Date, endTime: string | Date) {
    try {
        console.log('Formatting duration:', { startTime, endTime });

        // Ensure we have valid date objects
        const start = startTime instanceof Date ? startTime : new Date(startTime);
        const end = endTime instanceof Date ? endTime : new Date(endTime);

        // Debug log the parsed dates
        console.log('Parsed dates:', {
            start: start.toString(),
            end: end.toString(),
            startValid: !isNaN(start.getTime()),
            endValid: !isNaN(end.getTime())
        });

        // If either date is invalid, return early
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.error('Invalid date range:', { start, end });
            return '--:--';
        }

        // Calculate duration in milliseconds (ensure positive value)
        const durationMs = Math.abs(end.getTime() - start.getTime());

        // Convert to seconds, ensuring at least 1 second is shown for any game
        const totalSeconds = Math.max(1, Math.floor(durationMs / 1000));

        // Calculate hours, minutes, seconds
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // Format as MM:SS or HH:MM:SS if hours > 0
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');

        const formattedTime = hours > 0
            ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
            : `${formattedMinutes}:${formattedSeconds}`;

        console.log('Formatted duration:', formattedTime, 'from', durationMs, 'ms');
        return formattedTime;
    } catch (error) {
        console.error('Error formatting game duration:', error);
        return '--:--';
    }
}

export interface GameHistoryProps {
    games: GameResult[];
}

function GameHistory({ games: initialGames }: GameHistoryProps) {
    const [games, setGames] = useState<GameResult[]>(initialGames);
    const [selectedGame, setSelectedGame] = useState<GameResult | null>(null);

    // Update local state if the prop changes
    useEffect(() => {
        setGames(initialGames);
    }, [initialGames]);

    const handleGameSelect = async (gameId: string) => {
        try {
            const gameDetails = await getGameDetails(gameId);
            if (gameDetails) {
                setSelectedGame(prev => ({
                    ...prev,
                    ...gameDetails
                }));
            }
        } catch (error) {
            console.error('Failed to load game details:', error);
        }
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold tracking-tight">Game History</h2>

                </div>
            </div>

            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle>Recent Games</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 ">
                    {games.length === 0 ? (
                        <p>No games found</p>
                    ) : (
                        <div className="grid gap-4">
                            {games.map((game) => (
                                <div
                                    key={game.game_id}
                                    className={`p-4 border border-border/80 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors`}
                                    onClick={() => handleGameSelect(game.game_id)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">
                                                    {game.winner_name} won in {game.total_rounds} rounds
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDistanceToNow(new Date(game.end_time), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{game.winner_score} pts</p>
                                            <p className="text-sm text-muted-foreground">
                                                {game.total_players} players
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedGame && (
                <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 !bg-black/50">
                    <div className="flex items-center gap-2 ">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                </div>
            )}

            <Dialog open={!!selectedGame} onOpenChange={(open) => !open && setSelectedGame(null)}>
                <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto !bg-background">
                    {selectedGame && (

                        <>
                            <DialogHeader className="pb-4">
                                <DialogTitle className="text-2xl font-bold tracking-tight">Game Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-xl border ">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Trophy className="w-6 h-6 text-yellow-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Winner</p>
                                            <h3 className="text-2xl font-bold text-foreground">{selectedGame.winner_name}</h3>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                                        <div className="flex items-center gap-1.5 bg-background/40 px-3 py-1.5 rounded-full border">
                                            <Award className="w-4 h-4 text-amber-500" />
                                            <span className="font-medium">{selectedGame.winner_score} points</span>
                                        </div>
                                        {(() => {
                                            const winner = selectedGame.players?.find(p => p.player_name === selectedGame.winner_name);
                                            if (winner?.final_letters) {
                                                return (
                                                    <div className="flex items-center gap-1.5 bg-background/40 py-1.5 rounded-full border">
                                                        <SkateLetters
                                                            letters={winner.final_letters.split('')}
                                                            className="scale-75 -my-1 -mx-1.5"
                                                        />
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                        <div className="flex items-center gap-1.5 bg-background/40 px-3 py-1.5 rounded-full border">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            <span>{selectedGame.total_rounds} {selectedGame.total_rounds === 1 ? 'round' : 'rounds'}</span>
                                        </div>
                                        {(() => {
                                            const winner = selectedGame.players?.find(p => p.player_name === selectedGame.winner_name);
                                            if (winner) {
                                                return (
                                                    <div className="flex items-center gap-1.5 bg-background/40 px-3 py-1.5 rounded-full border">
                                                        <Target className="w-4 h-4 text-purple-500" />
                                                        <span>{winner.tricks_landed}/{winner.tricks_attempted} tricks</span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Clock3 className="w-4 h-4" />
                                                <span>{formatDistanceToNow(new Date(selectedGame.end_time), { addSuffix: true })}</span>
                                            </div>
                                            {selectedGame.start_time && (
                                                <div className="flex items-center gap-1.5">
                                                    <Clock3 className="w-4 h-4 opacity-70" />
                                                    <span>{formatGameDuration(selectedGame.start_time, selectedGame.end_time)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-lg font-medium">Runner-ups</h3>
                                    {selectedGame.players
                                        ?.filter((player: PlayerResult) => player.player_name !== selectedGame.winner_name)
                                        .map((player: PlayerResult) => (
                                            <div key={player.player_name} className="py-1.5">
                                                <div className="p-2.5 rounded-lg border border-border hover:bg-accent/20 transition-colors">
                                                    <div className="flex justify-between items-center ">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-sm">
                                                                {player.player_name}
                                                            </span>
                                                        </div>
                                                        <div className="text-right mb-1">
                                                            <p className="font-medium text-sm">{player.final_score} pts</p>
                                                            {player.tricks_attempted > 0 && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    {player.tricks_landed || 0}/{player.tricks_attempted} tricks
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {player.final_letters && player.final_letters.length > 0 && (
                                                        <div className=" pt-2 border-t border-border">
                                                            <SkateLetters
                                                                letters={player.final_letters.split('')}
                                                                className="scale-85 -mx-8"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default GameHistory;
