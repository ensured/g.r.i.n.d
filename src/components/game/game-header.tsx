import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function GameHeader({ onNewGame, onResetGame, currentRound }: { onNewGame: () => void, onResetGame: () => void, currentRound: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div >
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <div className="w-full flex justify-end items-center gap-2 pt-2">
            <p className="text-sm sm:text-base">Round {currentRound}</p>
            <Button
              variant="outline"
              size="sm"
              className="text-sm sm:text-base"  // Slightly larger on larger screens
            >
              Reset Game
            </Button>

          </div>
        </AlertDialogTrigger>

        <AlertDialogContent className="max-w-md bg-background backdrop-blur-sm select-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot be undone</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset your current progress and start a fresh game.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onNewGame} asChild>
              <Button variant="default" size="sm">
                New Game
              </Button>
            </AlertDialogAction>
            <AlertDialogAction onClick={onResetGame} asChild>
              <Button variant="default" size="sm">
                Reset Game
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog >
    </div >
  );
}