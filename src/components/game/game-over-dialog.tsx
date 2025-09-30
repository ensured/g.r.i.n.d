"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Player } from "@/types/types";
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';
import { GAME_SETTINGS } from "@/constants";

interface GameOverDialogProps {
    isOpen: boolean;
    onNewGame: () => void;
    onSetupNewGame: () => void;
    winner: Player | null;
    players: Player[];
    startTime?: Date;
    endTime?: Date;
}

function formatDuration(start: Date, end: Date): string {
    const durationMs = end.getTime() - start.getTime();
    const seconds = Math.floor((durationMs / 1000) % 60);
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    const hours = Math.floor(durationMs / (1000 * 60 * 60));

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
}

export function GameOverDialog({ isOpen, onNewGame, onSetupNewGame, winner, players, startTime, endTime }: GameOverDialogProps) {
    const confettiRef = useRef<HTMLDivElement>(null);

    // Sort players by fewest letters first, then by highest score
    const sortedPlayers = [...players].sort((a, b) => {
        // First sort by number of letters (ascending)
        if (a.letters.length !== b.letters.length) {
            return a.letters.length - b.letters.length;
        }
        // If letters are equal, sort by score (descending)
        return b.score - a.score;
    });

    // Trigger confetti when the dialog opens and when winner changes
    useEffect(() => {
        if (isOpen && winner) {
            const triggerConfetti = (originX: number, originY: number) => {
                confetti({
                    particleCount: 20,
                    angle: 60,
                    spread: 44,
                    origin: { x: originX, y: originY },
                    colors: ['#FFD700', '#FFA500', '#FF8C00'],
                    zIndex: 1000,
                    gravity: 0.8,
                    ticks: 100,
                    scalar: 0.8
                });

                confetti({
                    particleCount: 20,
                    angle: 120,
                    spread: 44,
                    origin: { x: originX, y: originY },
                    colors: ['#FFD700', '#FFA500', '#FF8C00'],
                    zIndex: 1000,
                    gravity: 0.8,
                    ticks: 100,
                    scalar: 0.8
                });
            };

            // Initial burst
            triggerConfetti(0.5, 0.5);

            // Set up interval for subtle ongoing confetti
            const interval = setInterval(() => {
                triggerConfetti(Math.random() * 0.4 + 0.1, 0.1);
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [isOpen, winner?.id]); // Only re-run if winner changes

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="sm:max-w-[500px] rounded-lg overflow-hidden p-0 border-0 bg-card">
                <div className="relative">
                    {/* Confetti container */}
                    <div ref={confettiRef}>
                        {/* Header with gradient background */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-3xl font-bold text-center mb-2">
                                    Game Over!
                                </AlertDialogTitle>
                                {winner && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                        className="text-center"
                                    >
                                        <div className="text-2xl font-semibold mb-1">🎉 Winner! 🎉</div>
                                        <div className="text-3xl font-bold bg-white/20 dark:bg-white/20 px-6 py-2 rounded-full inline-block mb-2">
                                            {winner.name}
                                        </div>
                                        {startTime && endTime && (
                                            <div className="text-lg font-medium text-white/90">
                                                Game Duration: {formatDuration(startTime, endTime)}
                                            </div>
                                        )}

                                    </motion.div>
                                )}
                            </AlertDialogHeader>
                        </div>
                    </div>

                    {/* Players list */}
                    <div className="p-6">
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                            {sortedPlayers.map((player, index) => (
                                <motion.div
                                    key={player.id}
                                    initial={{ x: -30, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1, type: 'spring' }}
                                    className={cn(
                                        "relative p-4 rounded-lg border overflow-hidden",
                                        !player.isEliminated
                                            ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20"
                                            : "border-border/50"
                                    )}
                                >

                                    <div className="flex items-start">
                                        {/* Position Badge */}
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg mr-3",
                                            !player.isEliminated
                                                ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-900"
                                                : "bg-muted-foreground/10"
                                        )}>
                                            {index + 1}
                                        </div>

                                        {/* Player Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="font-bold text-lg truncate">
                                                        {player.name}
                                                    </span>
                                                    {!player.isEliminated && (
                                                        <span
                                                            className="flex-shrink-0 text-xs bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded-full border border-yellow-500/30 shadow-sm relative overflow-visible"
                                                            id={`winner-${player.id}`}
                                                        >
                                                            Winner
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                                    {player.score} pts
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mt-2 h-2 bg-muted-foreground/10 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full",
                                                        !player.isEliminated
                                                            ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                                            : "bg-gradient-to-r from-amber-500 to-orange-500"
                                                    )}
                                                    style={{
                                                        width: `${Math.min(100, ((player.tricksLanded || 0) / Math.max(1, (player.tricksAttempted || 1))) * 100)}%`,
                                                        transition: 'width 0.5s ease-in-out'
                                                    }}
                                                />
                                            </div>
                                            {/* Stats Row */}
                                            <div className="flex justify-between items-center mt-2 text-xs">
                                                <div className="flex items-center text-muted-foreground">
                                                    {player.letters.length > 0 ? (
                                                        <div className="flex flex-col space-y-1">
                                                            <div className="flex items-center space-x-1">
                                                                {GAME_SETTINGS.SKATE_LETTERS.map((letter, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className={cn(
                                                                            "w-5 h-5 flex items-center justify-center font-mono font-bold rounded text-xs transition-all",
                                                                            player.letters.includes(letter)
                                                                                ? "bg-purple-600 dark:bg-purple-500 text-white shadow-md shadow-purple-500/20"
                                                                                : "bg-muted-foreground/10"
                                                                        )}
                                                                    >
                                                                        {letter}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            {/* {player.maxStreak > 0 && (
                                                                <div className="text-xs text-amber-500 flex items-center">
                                                                    <span className="font-medium">Max Streak:</span>
                                                                    <span className="ml-1 font-bold">{player.maxStreak}🔥</span>
                                                                </div>
                                                            )} */}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground/70">No letters</span>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium text-foreground">
                                                        {player.tricksLanded || 0} / {player.tricksAttempted || 0} tricks
                                                    </div>
                                                    <div className="text-muted-foreground text-xs">
                                                        {player.tricksAttempted > 0
                                                            ? `${Math.round(((player.tricksLanded || 0) / player.tricksAttempted) * 100)}% success`
                                                            : 'No attempts'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-8 space-y-3">
                            <AlertDialogAction
                                onClick={onNewGame}
                                className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2"
                            >
                                <span>Play Again!</span>
                                <span role="img" aria-label="smile">😊</span>
                            </AlertDialogAction>

                            <AlertDialogAction
                                onClick={onSetupNewGame}
                                className="cursor-pointer w-full  border border-border"
                            >
                                Setup New Game
                            </AlertDialogAction>
                        </div>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
