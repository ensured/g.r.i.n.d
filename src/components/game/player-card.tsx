import { cn } from '@/lib/utils';
import { Crown, Award, BarChart4 } from 'lucide-react';
import { Player } from '@/types/types';
import { SkateLetters } from './skate-letters';


interface PlayerCardProps {
  player: Player;
  isCurrent: boolean;
  isLeader: boolean;
  isFollower: boolean;
  resetKey: number;
}

export function PlayerCard({ player, isCurrent, isLeader, isFollower, resetKey }: PlayerCardProps) {
  return (
    <div
      className={cn(
        'relative p-3 sm:p-4 rounded-lg border transition-all',
        isCurrent
          ? 'border-primary bg-primary/10'
          : 'border-border/50 hover:border-border',
        player.isEliminated && 'opacity-50',
        'w-full' // Ensure full width on all screens
      )}
    >
      <div className="flex sm:items-center justify-between gap-2 sm:gap-4">
        {/* Player Info Section */}
        <div className="flex-1 min-w-0">

          <div className="flex items-center gap-1 justify-between flex-wrap">
            <h2
              className={cn(
                'text-sm sm:text-base font-medium leading-tight truncate flex items-center gap-1',
                isCurrent && 'text-primary font-semibold',
                'min-w-0'
              )}
              title={player.name}
            >
              {player.name}
              {isLeader && (
                <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
              )}
            </h2>

            <div className="flex items-center gap-1.5  flex-shrink-0">

              <div className="flex items-center gap-1.5 ">


                {/* Streak indicator */}
                {isLeader && player.streak > 0 && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="text-xs sm:text-sm font-medium">{player.streak}</span>
                    <span className="text-sm">🔥</span>
                  </div>
                )}
              </div>

              {/* Follower badge */}
              {isFollower && (
                <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                  Follower
                </span>
              )}

              {/* Eliminated badge */}
              {player.isEliminated && (
                <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full whitespace-nowrap">
                  Eliminated
                </span>
              )}
            </div>
            {/* Stats Section */}
            <div className="flex flex-col justify-start w-full bg-background/10 rounded-md gap-0.5 border border-border">
              <div className="flex items-center gap-1 px-2 py-1  border-b border-border">
                <Award className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                <span className="text-xs font-medium">Score: {player.score || 0}</span>
              </div>
              {/* seperator */}
              {player.tricksAttempted > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 border-b border-border">
                  <BarChart4 className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                  <span className="text-xs font-medium">{Math.round(((player.tricksLanded || 0) / player.tricksAttempted) * 100)}% trick success</span>
                </div>
              )}
            </div>
          </div>


        </div>


      </div>

      {/* Skate Letters Section */}
      <div className="mt-1 sm:mt-2">
        <SkateLetters key={`skate-letters-${resetKey}`} letters={player.letters} />

      </div>
    </div>
  );
}
