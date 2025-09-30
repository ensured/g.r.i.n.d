import { getRecentGames } from '@/actions/game-queries';
import GameHistory from '@/components/game/GameHistory';

export default async function GamesPage() {
  const games = await getRecentGames();
  return (
    <div className="min-h-screen w-full flex justify-center p-4 pt-8">
      <div className="w-full max-w-5xl">
        <GameHistory games={games} />
      </div>
    </div>
  );
}