import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Check, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface PlayerInputProps {
  name: string;
  index: number;
  playerNames: string[];
  onNameChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onAddPlayer?: () => void;
  error?: string;
  showSuccess: boolean;
  inputRef?: (el: HTMLInputElement | null) => void;
  className?: string;
}

export function PlayerInput({
  name,
  index,
  playerNames,
  onNameChange,
  onRemove,
  onAddPlayer,
  error,
  showSuccess,
  inputRef,
  className,
}: PlayerInputProps) {
  // Add haptic feedback on interaction
  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if ('vibrate' in navigator) {
      navigator.vibrate?.(5);
    }
    // Prevent double-tap zoom
    e.preventDefault();
  };

  return (
    <motion.div
      className={cn("", className)}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1, delay: index * 0.02 }}
    >
      <div className="relative w-full group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg opacity-0 group-hover:opacity-20 dark:group-hover:opacity-30 blur transition duration-200" />
        <div className="relative">
          <Input
            ref={inputRef}
            className={cn(
              "w-full min-w-[180px] pr-20 bg-background/90 dark:bg-background/80 backdrop-blur-sm transition-all duration-200",
              "border border-border/70 dark:border-border/50 focus:border-primary/50",
              "focus:ring-2 focus:ring-primary/20 dark:focus:ring-purple-500/20 text-base sm:text-sm",
              "h-12 py-3 px-4 text-foreground/90", // Better touch target and text visibility
              "text-base sm:text-sm md:text-base", // Responsive text size
              error
                ? 'border-destructive/80 focus:border-destructive focus:ring-destructive/20 dark:border-destructive dark:focus:ring-destructive/30'
                : showSuccess && 'border-green-500/80 focus:border-green-500 focus:ring-green-500/20 dark:border-green-500 dark:focus:ring-green-500/30',
              "dark:focus:ring-2",
              "touch-manipulation" // Disable double-tap zoom on mobile
            )}
            placeholder={`Player ${index + 1}`}
            value={name}
            onChange={(e) => onNameChange(index, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim() && onAddPlayer) {
                e.preventDefault();
                onAddPlayer();
              }
            }}
            inputMode="text"
            autoCapitalize="words"
            autoCorrect="off"
            autoComplete="name"
            enterKeyHint={index === playerNames.length - 1 ? 'done' : 'next'}
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  className="text-green-500"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Check className="h-5 w-5" />
                </motion.div>
              )}
              {error && (
                <motion.div
                  className="text-destructive"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key="remove"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer h-10 w-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20 active:scale-95 touch-manipulation"
                  onClick={(e) => {
                    handleInteraction(e);
                    onRemove(index);
                  }}
                  onTouchStart={handleInteraction}
                  aria-label={`Remove player ${index + 1}`}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </motion.div>

            </AnimatePresence>
          </div>
        </div>
      </div>
      {error && (
        <motion.p
          className="text-sm text-destructive px-2"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
