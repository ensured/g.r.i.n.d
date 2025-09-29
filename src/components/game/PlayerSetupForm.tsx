import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlayerInput } from "@/components/game/player-input";
import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Info, Crown, Users, Award, Clock, X, ArrowUp, Trash2 } from "lucide-react";
import { GAME_SETTINGS } from "@/constants";
import { GameRulesList } from "./game-rules-list";

interface PlayerSetupFormProps {
  initialPlayers: string[];
  onPlayerNameChange?: (index: number, value: string) => void;
  onRemovePlayer?: (index: number) => void;
  onAddPlayer?: () => void;
  onClearAllPlayers?: () => void;
  onShufflePlayers?: (newOrder?: string[]) => void;
  onStartGame: (playerNames: string[], gameWord?: string) => void;
  isLoading?: boolean;
  validPlayerCount?: boolean;
}

export function PlayerSetupForm({
  initialPlayers: initialPlayersProp = [],
  onPlayerNameChange = () => { },
  onRemovePlayer = () => { },
  onAddPlayer = () => { },
  onClearAllPlayers = () => { },
  onShufflePlayers = () => { },
  onStartGame,
  isLoading = false,
  validPlayerCount = false,
}: PlayerSetupFormProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const previousPlayerCount = useRef(initialPlayersProp?.length || 0);
  const initialPlayers = useMemo(() => initialPlayersProp || [], [initialPlayersProp]);

  // Focus the first input on initial mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      const input = inputRefs.current[0];
      input.focus();
      const length = input.value.length;
      input.setSelectionRange(0, length);
    }
  }, []);

  // Focus new input when a player is added
  useEffect(() => {
    if (initialPlayers.length > previousPlayerCount.current) {
      const lastIndex = initialPlayers.length - 1;
      const input = inputRefs.current[lastIndex];
      if (input) {
        input.focus();
        const length = input.value.length;
        input.setSelectionRange(0, length);
      }
    }
    previousPlayerCount.current = initialPlayers.length;
  }, [initialPlayers, initialPlayers.length]);

  const [showRules, setShowRules] = useState(false);
  const controls = useAnimationControls();
  const [isShuffling, setIsShuffling] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const initialOrder = useRef<string[]>([]);
  const [hasBeenShuffled, setHasBeenShuffled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle scroll to top
  const scrollToTop = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container) {
        setShowScrollToTop(container.scrollTop > 100);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Save the current order before first shuffle
  const saveInitialOrder = () => {
    if (initialPlayers.length > 0 && !hasBeenShuffled) {
      initialOrder.current = [...initialPlayers];
      setHasBeenShuffled(true);
    }
  };

  // Check if current order matches initial order
  const isInitialOrder = useMemo(() => {
    if (!hasBeenShuffled || initialOrder.current.length !== initialPlayers.length) {
      return false;
    }
    return initialOrder.current.every((name, i) => name === initialPlayers[i]);
  }, [initialPlayers, hasBeenShuffled]);

  // Reset to the initial order
  const handleResetOrder = () => {
    if (initialOrder.current.length > 0) {
      onShufflePlayers?.([...initialOrder.current]);
    }
  };

  // Handle shuffle with animation
  const handleShuffleClick = async () => {
    if (isShuffling || initialPlayers.length < 2) {
      return;
    }

    try {
      setIsShuffling(true);

      // First, animate all cards up and fade out (faster)
      await controls.start({
        y: -20,
        opacity: 0,
        transition: {
          duration: 0.08,  // Faster initial animation
          ease: "easeInOut"
        }
      });

      // Save the initial order before first shuffle
      if (!hasBeenShuffled) {
        saveInitialOrder();
      }

      // Trigger the actual shuffle
      onShufflePlayers?.();

      // Shorter delay to ensure the shuffle is processed
      await new Promise(resolve => setTimeout(resolve, 30));

      // Animate the new order in (faster)
      await controls.start({
        y: 20,
        opacity: 0,
        transition: {
          duration: 0.08,  // Faster second animation
          ease: "easeInOut"
        }
      });

      // Animate back to normal position with snappier spring
      await controls.start({
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 400,  // Snappier spring
          damping: 25,
          mass: 0.4       // Lighter mass for faster movement
        }
      });
    } catch (error) {
      console.error("Error during shuffle animation:", error);
    } finally {
      setIsShuffling(false);
    }
  };

  if (!initialPlayers) return null;
  return (
    <div className=" flex flex-col items-center justify-center text-foreground py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className=" "
      >
        <Card className="sm:w-xl w-[92vw] shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border/50 dark:border-border/30 select-none">
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">Start a New Game</CardTitle>
                <CardDescription className={cn("select-none", initialPlayers.length === GAME_SETTINGS.MAX_PLAYERS ? "text-green-500" : "text-muted-foreground")}>
                  {initialPlayers.length === GAME_SETTINGS.MAX_PLAYERS
                    ? `Max players reached! (${GAME_SETTINGS.MAX_PLAYERS})`
                    : initialPlayers.length < 2
                      ? "Add at least 2 players to begin"
                      : `Ready with ${initialPlayers.length} player${initialPlayers.length !== 1 ? 's' : ''}`}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground   "
                onClick={() => setShowRules(!showRules)}
              >
                {showRules ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          <AnimatePresence>
            {showRules && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.2 }}
                className="px-6"
              >
                <GameRulesList />
              </motion.div>
            )}
          </AnimatePresence>

          <CardContent className="space-y-4">

            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => onStartGame(initialPlayers)}

                disabled={isLoading || !validPlayerCount || initialPlayers.length < 2}
                className="!text-xl h-16 cursor-pointer w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting Game...
                  </>
                ) : (
                  `Start Game`
                )}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <AnimatedButton
                  onClick={onAddPlayer}
                  disabled={initialPlayers.length >= GAME_SETTINGS.MAX_PLAYERS || isLoading}
                  className="w-full cursor-pointer"
                  variant="outline"
                  size="sm"
                  animate={initialPlayers.length < 2}
                  showParticles={initialPlayers.length < 2}
                >
                  + Add Player
                </AnimatedButton>
                <Button
                  onClick={() => {
                    onClearAllPlayers?.();
                    inputRefs.current[0]?.focus();
                  }}
                  disabled={initialPlayers.length < GAME_SETTINGS.MIN_PLAYERS}
                  className="w-[calc(100%)] cursor-pointer"
                  variant="outline"
                  size={'sm'}
                >
                  Clear All
                  <Trash2 className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  onClick={handleShuffleClick}
                  disabled={initialPlayers.length < 2 || isLoading || isShuffling}
                  className="w-[calc(100%)] cursor-pointer relative overflow-hidden group"
                  variant="outline"
                  size={'sm'}
                >
                  <span className={`transition-transform duration-300 ${isShuffling ? 'scale-0' : 'scale-100'}`}>
                    🔀 Shuffle
                  </span>
                  {isShuffling && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        className="w-4 h-4 rounded-full bg-foreground/20 mx-0.5"
                        animate={{
                          y: [0, -8, 0],
                          scale: [1, 1.5, 1],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          times: [0, 0.5, 1],
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        className="w-4 h-4 rounded-full bg-foreground/30 mx-0.5"
                        animate={{
                          y: [0, -12, 0],
                          scale: [1, 1.8, 1],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          times: [0, 0.5, 1],
                          ease: "easeInOut",
                          delay: 0.1
                        }}
                      />
                      <motion.div
                        className="w-4 h-4 rounded-full bg-foreground/40 mx-0.5"
                        animate={{
                          y: [0, -8, 0],
                          scale: [1, 1.5, 1],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          times: [0, 0.5, 1],
                          ease: "easeInOut",
                          delay: 0.2
                        }}
                      />
                    </motion.div>
                  )}
                </Button>
                <Button
                  onClick={handleResetOrder}
                  disabled={!hasBeenShuffled || isShuffling || isInitialOrder}
                  className="w-[calc(100%)] cursor-pointer"
                  variant="outline"
                  size={'sm'}
                  title={isInitialOrder ? "Already in original order" : "Reset to original order"}
                >
                  ↩️ Reset Order
                </Button>



              </div>

            </div>


            <div className="relative">
              <div
                ref={scrollContainerRef}
                className="grid grid-flow-row auto-rows-min gap-1.5 sm:grid-cols-2 overflow-y-auto minimal-scrollbar max-h-[30rem] h-[20rem] content-start"
              >
                {/* Render actual player inputs */}
                {initialPlayers.map((name, i) => {
                  const showError = name.trim() !== '' && name.trim().length < 2;
                  const showSuccess = name.trim() !== '' && name.trim().length >= 2;

                  return (
                    <motion.div
                      key={`player-${i}`}
                      layout
                      initial={{ opacity: 1, y: 0 }}
                      animate={controls}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        mass: 1
                      }}
                    >
                      <PlayerInput
                        name={name}
                        index={i}
                        playerNames={initialPlayers}
                        onNameChange={(index, value) => onPlayerNameChange?.(index, value)}
                        onRemove={(index) => {
                          onRemovePlayer?.(index);
                          inputRefs.current[0]?.focus();
                        }}
                        onAddPlayer={i === initialPlayers.length - 1 ? onAddPlayer : undefined}
                        error={showError ? "Player name must be at least 2 characters" : undefined}
                        showSuccess={showSuccess}
                        inputRef={el => inputRefs.current[i] = el}
                        className="rounded-md flex-1"
                      />
                    </motion.div>
                  );
                })}
              </div>

              <AnimatePresence>
                {showScrollToTop && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10"
                  >
                    <Button
                      onClick={scrollToTop}
                      size="icon"
                      className="rounded-full w-8 h-8 shadow-lg backdrop-blur-sm cursor-pointer"
                      aria-label="Scroll to top"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
