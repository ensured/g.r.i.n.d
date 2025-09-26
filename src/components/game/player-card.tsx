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
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              'font-medium',
              isCurrent && 'text-primary font-semibold'
            )}
          >
            {player.name}
          </h3>
          {isLeader && (
            <>
              <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                Leader
              </span>
            </>
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

      {/* Player's collected letters */}
      {/* if leader show streak */}
      {isLeader && (
        <div className="flex items-center gap-1 mt-2">
          <div className="text-xs text-muted-foreground">{player.streak}/3</div>
          <div className="flex-1" />
          <div className="flex gap-1">
            {player.letters.map((letter, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center w-5 h-5 text-xs font-bold rounded bg-red-500 text-white"
              >
                {letter}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
