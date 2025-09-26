import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';
import { Player } from '@/types/types';

interface PlayerCardProps {
  player: Player;
  isCurrent: boolean;
  isLeader: boolean;
  isFollower: boolean;
}

export function PlayerCard({ player, isCurrent, isLeader, isFollower }: PlayerCardProps) {
  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border transition-all',
        isCurrent
          ? 'border-primary bg-primary/10'
          : 'border-border/50 hover:border-border',
        player.isEliminated && 'opacity-50'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-1.5">
          <h3
            className={cn(
              'font-medium leading-none',
              isCurrent && 'text-primary font-semibold'
            )}
          >
            {player.name}
          </h3>
          {isLeader && (
            <Crown className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0 -translate-y-0.5" />
          )}
          {isFollower && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
              Follower
            </span>
          )}
          {player.isEliminated && (
            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
              Eliminated
            </span>
          )}
        </div>
        {isLeader && player.streak > 0 && (
          <div className="text-xs text-muted-foreground">
            {player.streak}/3 {player.streak > 0 ? "🔥" : ""}
          </div>
        )}
        <div className="flex items-center gap-1">
          {/* <span
            className={cn(
              'font-mono font-bold',
              isCurrent ? 'text-primary' : 'text-foreground/80'
            )}
          >
            {player.score}
          </span> */}
        </div>
      </div>

      {/* Player's collected letters and streak */}
      <div className="flex items-center gap-1 mt-2">

        {player.letters.map((letter, idx) => (
          <div
            key={idx}
            className="flex items-center justify-center w-5 h-5 text-xs font-bold rounded bg-red-500 text-white"
          >
            {letter}
          </div>
        ))}
        <div className="flex-1" />

      </div>
    </div>
  );
}
