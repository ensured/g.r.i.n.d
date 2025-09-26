import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Crown, Sparkles } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';
import type { GameState, Player } from '@/types/types';
import { difficultyColors } from '@/types/tricks';

interface TrickCardProps {
  gameState: GameState;
  currentPlayer: Player;
  children?: React.ReactNode;
  className?: string;
}

export function TrickCard({
  gameState,
  currentPlayer,
  children,
  className
}: TrickCardProps) {
  const { currentCard: trick } = gameState;

  // Get the appropriate color classes based on difficulty
  const getDifficultyClasses = (difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro' | '') => {
    const defaultClasses = {
      bg: 'bg-gray-200 dark:bg-gray-700',
      text: 'text-gray-500',
      display: 'Unknown',
      border: 'border-gray-300 dark:border-gray-600'
    };

    if (!difficulty) return defaultClasses;

    const colors = difficultyColors[difficulty];
    if (!colors) return defaultClasses;

    return {
      bg: colors.bg,
      text: colors.text,
      display: difficulty,
      border: colors.border
    };
  };

  const difficultyClasses = trick ? getDifficultyClasses(trick.difficulty) : getDifficultyClasses('');
  const isLeadersTurn = gameState.turnPhase === 'leader';
  const currentPlayerName = currentPlayer.name;

  const isMobile = useMediaQuery('(max-width: 640px)');
  const playerNameSize = isMobile ? 'text-3xl' : 'text-4xl';
  const cardPadding = isMobile ? 'p-3' : 'p-4 sm:p-6';
  const trickNameSize = isMobile ? 'text-2xl' : 'text-3xl';
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (open) {
      timer = setTimeout(() => setOpen(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn("relative w-full touch-manipulation", className)}
    >
      <Card className={cn(
        "overflow-hidden border-2 bg-card/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl",
        isLeadersTurn ? 'border-purple-400/30' : 'border-green-400/30',
        "hover:shadow-purple-500/10 dark:hover:shadow-purple-400/10"
      )}>
        <div className={cn("grid grid-cols-1 gap-4 sm:gap-6", cardPadding)}>
          {/* Player Header */}
          <div className="flex flex-col items-center space-y-2 sm:space-y-3">
            <div className="flex items-center gap-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`player-${currentPlayerName}`}
                  className="relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.span
                    className={cn(
                      "font-bold text-center tracking-tight inline-flex items-center gap-2",
                      playerNameSize,
                      isLeadersTurn
                        ? 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-md'
                        : 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-md',
                      "font-display"
                    )}
                  >
                    {currentPlayerName}
                    {isLeadersTurn && (
                      <motion.span
                        key="leader-crown"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          transition: {
                            type: 'spring',
                            stiffness: 500,
                            damping: 25,
                            delay: 0.1
                          }
                        }}
                        className="inline-flex"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Crown
                          className={cn(
                            "h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300",
                            "text-purple-600 dark:text-purple-400",
                            isLeadersTurn && 'animate-pulse'
                          )}
                        />
                      </motion.span>
                    )}
                  </motion.span>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-1"></div>
          </div>

          {/* Trick Info */}
          <motion.div
            className="text-center space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="space-y-1">
              <TooltipProvider>
                <Tooltip open={open} onOpenChange={setOpen}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "font-extrabold tracking-tight text-foreground/90 text-left",
                        "hover:text-foreground transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary/50 rounded-md px-2 -ml-2",
                        trickNameSize
                      )}
                      onClick={() => setOpen(!open)}
                    >
                      {trick?.name || 'No trick selected'}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-4 space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">{trick?.name || 'No trick selected'}</h4>
                      {trick?.description && (
                        <p className="text-muted-foreground text-sm">{trick.description}</p>
                      )}
                      {difficultyClasses && (
                        <div className="flex items-center gap-2 pt-2">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            {
                              'bg-blue-400': difficultyClasses.display === 'Pro',
                              'bg-purple-400': difficultyClasses.display === 'Advanced',
                              'bg-amber-300': difficultyClasses.display === 'Intermediate',
                              'bg-green-400': difficultyClasses.display === 'Beginner',
                            }
                          )} />
                          <span className="text-xs text-muted-foreground">
                            {difficultyClasses.display} Difficulty
                          </span>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {!trick?.description && (
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Draw a card to start
                </p>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}