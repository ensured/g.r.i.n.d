import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlayerInput } from "@/components/game/player-input";
import { useEffect, useRef, useMemo } from "react";
import { GAME_SETTINGS } from "@/constants";
import { cn } from "@/lib/utils";

interface PlayerSetupFormProps {
  initialPlayers: string[];  // Changed from playerNames to initialPlayers
  onPlayerNameChange?: (index: number, value: string) => void;
  onRemovePlayer?: (index: number) => void;
  onAddPlayer?: () => void;
  onClearAllPlayers?: () => void;
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

  if (!initialPlayers) return null;
  return (
    <div className="min-h-screen w-[95%]  flex flex-col items-center justify-center text-foreground ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border/50 dark:border-border/30 select-none">
          <CardHeader className="space-y-1 ">
            <CardTitle className="text-2xl font-bold ">Start a New Game</CardTitle>
            <CardDescription className={cn("select-none", initialPlayers.length === GAME_SETTINGS.MAX_PLAYERS ? "text-green-600" : "text-muted-foreground")}>
              {initialPlayers.length === GAME_SETTINGS.MAX_PLAYERS ? "Max players reached! " + GAME_SETTINGS.MAX_PLAYERS : initialPlayers.length < 2 ? "Add at least 2 players to begin" : `Ready with ${initialPlayers.length} player${initialPlayers.length !== 1 ? 's' : ''}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2 ">

            <div className="flex flex-col gap-2 pt-2 ">
              <Button
                onClick={() => onStartGame(initialPlayers)}
                disabled={isLoading || !validPlayerCount || initialPlayers.length < 2}
                className="h-16 cursor-pointer w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-[1.02]"
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
              <div className="w-full flex flex-row gap-4 ">
                <Button
                  onClick={onAddPlayer}
                  disabled={initialPlayers.length >= GAME_SETTINGS.MAX_PLAYERS || isLoading}
                  className="w-[calc(100%/2-0.5rem)] cursor-pointer"
                >
                  + Add Player
                </Button>


                <Button
                  onClick={() => {
                    onClearAllPlayers?.();
                    inputRefs.current[0]?.focus();
                  }}
                  disabled={initialPlayers.length < GAME_SETTINGS.MIN_PLAYERS}
                  className="w-[calc(100%/2-0.5rem)] cursor-pointer"
                >
                  Clear All Players
                </Button>
              </div>

            </div>

            <div className="grid grid-flow-row auto-rows-min gap-1.5 sm:grid-cols-2 overflow-y-auto minimal-scrollbar max-h-[320px] h-[180px] content-start">
              {initialPlayers.map((name, i) => {
                const showError = name.trim() !== '' && name.trim().length < 2;
                const showSuccess = name.trim() !== '' && name.trim().length >= 2;

                return (
                  <PlayerInput
                    key={i}
                    name={name}
                    index={i}
                    playerNames={initialPlayers}
                    onNameChange={(index, value) => onPlayerNameChange?.(index, value)}
                    onRemove={(index) => onRemovePlayer?.(index)}
                    onAddPlayer={i === initialPlayers.length - 1 ? onAddPlayer : undefined}
                    error={showError ? "Player name must be at least 2 characters" : undefined}
                    showSuccess={showSuccess}
                    inputRef={el => inputRefs.current[i] = el}
                    className=" rounded-md flex-1"
                  />
                );
              })}
            </div>


          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
