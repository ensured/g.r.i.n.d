"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Player } from "@/types/types";
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';

interface GameOverDialogProps {
    isOpen: boolean;
    onNewGame: () => void;
    onSetupNewGame: () => void;
    winner: Player | null;
    players: Player[];
}

export function GameOverDialog({ isOpen, onNewGame, onSetupNewGame, winner, players }: GameOverDialogProps) {
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiRef = useRef<HTMLDivElement>(null);

    // Sort players by their score (fewer letters is better)
    const sortedPlayers = [...players].sort((a, b) => a.letters.length - b.letters.length);

    // Trigger confetti when the dialog opens
    useEffect(() => {
        if (isOpen && winner) {
            setShowConfetti(true);

            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                // Launch from the left
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                    colors: ['#FFC107', '#FF9800', '#FF5722']
                });

                // Launch from the right
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                    colors: ['#4CAF50', '#8BC34A', '#CDDC39']
                });
            }, 250);

            // Cleanup
            return () => {
                clearInterval(interval);
                setShowConfetti(false);
            };
        }
    }, [isOpen, winner]);

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="sm:max-w-[500px] rounded-lg overflow-hidden p-0 border-0 bg-card">
                <div className="relative">
                    {/* Confetti container */}
                    <div
                        ref={confettiRef}
                        className="absolute inset-0 pointer-events-none overflow-hidden"
                        style={{ zIndex: 1 }}
                    />

                    {/* Header with gradient background */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
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
                                    <div className="text-3xl font-bold bg-white/20 px-6 py-2 rounded-full inline-block">
                                        {winner.name}
                                    </div>
                                </motion.div>
                            )}
                        </AlertDialogHeader>
                    </div>

                    {/* Players list */}
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-center mb-4">Final Scores</h3>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {sortedPlayers.map((player, index) => (
                                <motion.div
                                    key={player.id}
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1, type: 'spring' }}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-lg border",
                                        player.id === winner?.id
                                            ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"
                                            : "bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-center">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3",
                                            player.id === winner?.id
                                                ? "bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-md"
                                                : "bg-gray-400"
                                        )}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium">{player.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {player.letters.length} {player.letters.length === 1 ? 'letter' : 'letters'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1">
                                        {player.letters.map((letter, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "w-8 h-8 flex items-center justify-center rounded font-bold",
                                                    player.id === winner?.id
                                                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                                        : "bg-gray-100 text-gray-700 border border-gray-200"
                                                )}
                                            >
                                                {letter}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-8 space-y-3">
                            <AlertDialogAction
                                onClick={onNewGame}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            >
                                Play Again (Same Players)
                            </AlertDialogAction>

                            <AlertDialogAction
                                onClick={onSetupNewGame}
                                className="w-full border border-input hover:bg-accent hover:text-accent-foreground"
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
