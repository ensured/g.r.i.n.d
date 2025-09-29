import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Trash2 } from 'lucide-react';
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

  return (
    <div className={cn("relative group", className)}>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.1, delay: index * 0.02 }}
        className="relative"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400/30 to-indigo-400/30 dark:from-purple-500/20 dark:to-indigo-500/20 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300 ease-out" />

        <div className="relative">
          <Input
            ref={inputRef}
            className={cn(
              "w-full min-w-[180px] pr-12 bg-background/90 dark:bg-background/80 backdrop-blur-sm transition-all duration-200",
              "border border-border/70 dark:border-border/50 focus:border-primary/50",
              "focus:ring-2 focus:ring-primary/20 dark:focus:ring-purple-500/20 text-base sm:text-sm",
              "h-12 py-3 px-4 text-foreground/90",
              {
                'border-destructive/80 focus:border-destructive focus:ring-destructive/20': error,
                'border-green-500/80 focus:border-green-500 focus:ring-green-500/20': showSuccess && !error,
              },
              "dark:focus:ring-2 touch-manipulation"
            )}
            placeholder={`Player ${index + 1}`}
            value={name}
            onChange={(e) => onNameChange(index, e.target.value)}
            onKeyDown={handleKeyDown}
            inputMode="text"
            autoCapitalize="words"
            autoCorrect="off"
            autoComplete="name"
            enterKeyHint={index === playerNames.length - 1 ? 'done' : 'next'}
          />

          {name && (
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
