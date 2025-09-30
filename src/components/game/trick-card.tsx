import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Crown, Info } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useState } from 'react';
import type { GameState, Player } from '@/types/types';
import { difficultyColors } from '@/types/tricks';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
interface TrickCardProps {
  gameState: GameState;
  currentPlayer: Player | null;
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
      bg: 'bg-background',
      text: 'text-foreground',
      display: 'Unknown',
      border: 'border-gray-300',
      gradient: 'from-gray-400 to-gray-500',
      shadow: 'shadow-gray-500/20'
    };

    if (!difficulty) return defaultClasses;

    const colors = difficultyColors[difficulty];
    if (!colors) return defaultClasses;

    return {
      bg: colors.bg,
      text: colors.text,
      display: difficulty,
      border: colors.border,
      gradient: colors.gradient,
      shadow: colors.shadow
    };
  };

  const difficultyClasses = trick ? getDifficultyClasses(trick.difficulty) : getDifficultyClasses('');
  const isLeadersTurn = gameState.turnPhase === 'leader';
  const currentPlayerName = currentPlayer?.name;

  const isMobile = useMediaQuery('(max-width: 640px)');
  const playerNameSize = isMobile ? 'text-4xl' : 'text-5xl';
  const cardPadding = isMobile ? 'p-3' : 'p-4 sm:p-6';

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn("relative w-full touch-manipulation select-none", className)}
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
                        ? ''
                        : '',
                      "font-display "
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
                            "!text-purple-800 dark:text-purple-400",
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
            className="text-center space-y-3 "
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className={cn("space-y-3", isDialogOpen ? "blur" : "")}>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      "cursor-pointer text-2xl sm:text-3xl font-bold",

                      "group relative",
                    )}
                  >
                    {/* Difficulty indicator bar */}
                    <div
                      className={cn(
                        "absolute top-0 left-0 right-0 h-0.5",
                        difficultyClasses ? `${difficultyClasses.gradient}` : "bg-gradient-to-r from-primary to-primary/70",
                        "opacity-70 group-hover:opacity-100 transition-opacity duration-200"
                      )}
                    />
                    <span className="relative z-10 flex items-center">
                      {trick?.name || 'No trick selected'}
                      <Info className={cn("ml-3 !h-6 !w-6 opacity-70 transition-transform group-hover:scale-110", `${difficultyClasses.bg} rounded-full`)} />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                      top: '2px', // Adjust to account for the indicator bar
                      height: 'calc(100% - 2px)' // Reduce height to avoid overlapping with the indicator
                    }} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-lg border border-border/40 shadow-2xl rounded-2xl p-0 overflow-hidden">
                  <div className="relative">
                    {/* Decorative gradient bar */}
                    <div className={cn(
                      "h-1.5 w-full",
                      difficultyClasses ? `bg-gradient-to-r ${difficultyClasses.gradient}` : "bg-gradient-to-r from-primary to-primary/70"
                    )} />

                    <DialogHeader className="px-8 pt-8 pb-2">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      >
                        <DialogTitle className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                          {trick?.name}
                        </DialogTitle>
                      </motion.div>
                    </DialogHeader>

                    <div className="px-8 pt-2 pb-6 space-y-6">
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: { opacity: 0 },
                          visible: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.1,
                              delayChildren: 0.2
                            }
                          }
                        }}
                        className="flex flex-col items-center space-y-4"
                      >
                        {difficultyClasses && (
                          <motion.div
                            variants={{
                              hidden: { scale: 0.9, opacity: 0, y: 10 },
                              visible: {
                                scale: 1,
                                opacity: 1,
                                y: 0,
                                transition: {
                                  type: 'spring',
                                  stiffness: 400,
                                  damping: 15
                                }
                              }
                            }}
                            className="relative w-full max-w-xs"
                          >
                            <div className={cn(
                              'absolute -inset-0.5 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500',
                              `bg-gradient-to-r ${difficultyClasses.gradient}`
                            )} />
                            <Badge
                              className={cn(
                                difficultyClasses.bg,
                                difficultyClasses.text,
                                difficultyClasses.border,
                                'relative border-0 w-full',
                                'text-sm font-bold py-3 px-5 rounded-full',
                                'shadow-lg',
                                'transform transition-all duration-300',
                                'group-hover:scale-[1.02] group-hover:shadow-xl',
                                'overflow-hidden',
                                'z-10',
                                'before:absolute before:inset-0 before:bg-white/10 before:opacity-0',
                                'group-hover:before:opacity-100',
                                'cursor-default group'
                              )}
                            >
                              <span className="relative z-10 flex items-center justify-between w-full">
                                <span className="text-xs font-semibold opacity-90 tracking-wider">DIFFICULTY</span>
                                <span className="flex-1 w-4 h-px mx-3 bg-current/30" />
                                <span className="font-bold text-sm tracking-wide">{difficultyClasses.display}</span>
                              </span>
                            </Badge>
                          </motion.div>
                        )}

                        <motion.div
                          variants={{
                            hidden: { scale: 0.95, opacity: 0 },
                            visible: {
                              scale: 1,
                              opacity: 1,
                              transition: { duration: 0.3 }
                            }
                          }}
                          className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent px-6 py-1"
                        >
                          {trick?.points} points
                        </motion.div>
                      </motion.div>

                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                              duration: 0.4,
                              ease: 'easeOut'
                            }
                          }
                        }}
                        className="pt-2 pb-6"
                      >
                        <div className="relative">
                          <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <p className="text-foreground/90 text-center leading-relaxed text-pretty text-base md:text-[15px] px-2">
                            {trick?.description || 'No description available.'}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {!trick?.description && (
                <p className="text-muted-foreground text-sm">
                  No description available
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
        </div >
      </Card >
    </motion.div >
  );
}