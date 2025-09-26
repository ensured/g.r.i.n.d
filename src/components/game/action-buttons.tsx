// src/components/game/action-buttons.tsx
import * as React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, CheckCircle, X, XCircle } from 'lucide-react';
import { GameState } from "@/types/types";

type AttemptResult = 'landed' | 'failed';

interface ActionButtonsProps {
  gameState: GameState;
  onAttempt: (result: AttemptResult) => void;
}

export function ActionButtons({
  onAttempt,
}: ActionButtonsProps) {
  return (
    <div className="flex justify-center items-center w-full gap-12">
      <Button
        variant="default"
        className="size-20 bg-green-600 hover:bg-green-700 text-white cursor-pointer user-select-none"
        onClick={() => onAttempt('landed')}
      >
        <Check className="!h-7 !w-7" />
      </Button>

      <Button
        variant="destructive"
        className="size-20 hover:bg-red-900 text-white cursor-pointer user-select-none"
        onClick={() => onAttempt('failed')}
      >
        <X className="!h-7 !w-7 " />
      </Button>
    </div>
  );
}