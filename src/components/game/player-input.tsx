import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Lock, Trash2, Crown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

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
  creatorIndex?: number;
  currentIndex: number;
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
  creatorIndex,
  currentIndex,
}: PlayerInputProps) {
  const handleRemove = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if ('vibrate' in navigator) {
      navigator.vibrate?.(5);
    }
    onRemove(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && name.trim() && onAddPlayer) {
      e.preventDefault();
      onAddPlayer();
    }
  };

  const handleNameChange = (value: string) => {
    // Don't allow changing the creator's name
    if (creatorIndex === currentIndex) return;

    // Don't allow setting a name that already exists (case-insensitive)
    const normalizedValue = value.trim();
    if (normalizedValue === '') {
      onNameChange(currentIndex, value);
      return;
    }

    const isDuplicate = playerNames.some((p, idx) =>
      idx !== currentIndex && p.trim().toLowerCase() === normalizedValue.toLowerCase()
    );

    if (isDuplicate) {
      toast.error('Username already taken', {
        description: 'Please choose a different username',
        duration: 2000,
      });
      return;
    }

    onNameChange(currentIndex, value);
  };

  return (
    <div className={cn("relative group", className)}>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400/30 to-indigo-400/30 dark:from-purple-500/20 dark:to-indigo-500/20 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300 ease-out" />

        <div className="relative">
          <div className="relative">
            <div className="relative overflow-visible">
              <Input
                ref={inputRef}
                className={cn(
                  "focus:ring-2 focus:ring-primary/20 dark:focus:ring-purple-500/20 text-base sm:text-sm",
                  "h-12 py-3 px-4 text-foreground/90",
                  {
                    'border-destructive/80 focus:border-destructive focus:ring-destructive/20': error,
                    'border-green-500/80 focus:border-green-500 focus:ring-green-500/20': showSuccess && !error,
                    'pr-10': creatorIndex === currentIndex,
                    'opacity-80 bg-muted/30': creatorIndex === currentIndex,
                  },
                  "dark:focus:ring-2 touch-manipulation"
                )}
                placeholder={`Player ${index + 1}`}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onKeyDown={handleKeyDown}
                inputMode="text"
                autoCapitalize="words"
                autoCorrect="off"
                enterKeyHint={index === playerNames.length - 1 ? 'done' : 'next'}
                readOnly={creatorIndex === currentIndex}
              />
              {creatorIndex === currentIndex && (
                <div className="absolute -right-1 -top-2 z-50">
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-yellow-400/40 rounded-lg blur-sm animate-pulse" />
                    <Badge
                      variant="secondary"
                      className="relative h-5 px-2 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 border border-amber-200 dark:border-amber-400/50 rounded-full shadow-sm text-[11px] font-medium text-amber-900 dark:text-amber-50 whitespace-nowrap"
                    >
                      <Crown className="h-2.5 w-2.5 flex-shrink-0" />
                      <span>Creator</span>
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            {creatorIndex === currentIndex && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50">
                <Lock className="h-4 w-4" />
              </div>
            )}
            {name && creatorIndex !== currentIndex && (
              <button
                type="button"
                onClick={handleRemove}
                onTouchStart={handleRemove}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2",
                  "h-10 w-10 flex items-center justify-center",
                  "text-muted-foreground hover:text-destructive",
                  "rounded-full hover:bg-destructive/10 dark:hover:bg-destructive/20",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive/50",
                  "transition-colors duration-200 z-10 cursor-pointer user-select-none"
                )}
                aria-label={`Remove player ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <motion.p
            className="text-sm text-destructive px-2 mt-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
