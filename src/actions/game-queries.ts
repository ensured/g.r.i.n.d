"use server";

import pool from "@/lib/db";
import { unstable_cache, revalidateTag } from "next/cache";

const CACHE_DURATION = 3600; // 1 hour in seconds

// Cache status tracking
interface CacheStats {
  hits: number;
  misses: number;
  lastUpdated: string;
}

const cacheStats: CacheStats = {
  hits: 0,
  misses: 0,
  lastUpdated: new Date().toISOString(),
};

// Helper function to log cache status
function logCacheStatus(key: string, type: "hit" | "miss") {
  const now = new Date().toISOString();
  if (type === "hit") cacheStats.hits++;
  if (type === "miss") cacheStats.misses++;
  cacheStats.lastUpdated = now;

  if (process.env.NODE_ENV !== "production") {
    console.log(`[${now}] Cache ${type.toUpperCase()}: ${key}`);
    console.log(
      `Cache Stats - Hits: ${cacheStats.hits}, Misses: ${cacheStats.misses}`
    );
  }
}

// Function to check cache status
export async function getCacheStatus() {
  return {
    ...cacheStats,
    hitRate:
      cacheStats.hits + cacheStats.misses > 0
        ? (
            (cacheStats.hits / (cacheStats.hits + cacheStats.misses)) *
            100
          ).toFixed(2) + "%"
        : "N/A",
  };
}

// Function to clear specific cache
export async function clearCache(tag: string) {
  revalidateTag(tag);
  return {
    status: "success",
    message: `Cache cleared for ${tag} at ${new Date().toISOString()}`,
  };
}

export type GameResult = {
  game_id: string;
  start_time: string;
  end_time: string;
  total_rounds: number;
  winner_name: string;
  winner_score: number;
  total_players: number;
  players: PlayerResult[];
};

export type PlayerResult = {
  player_name: string;
  final_score: number;
  final_position: number | null;
  tricks_landed: number;
  tricks_attempted: number;
  final_letters?: string;
};
export type GameWithDetails = GameResult & {
  players: PlayerResult[];
};

// Get a list of recent games without caching
export async function getRecentGames(limit = 10): Promise<GameResult[]> {
  "use server";

  const client = await pool.connect();
  try {
    // First, get the list of recent games
    const gamesResult = await client.query<GameResult>(
      `SELECT 
        g.game_id,
        g.start_time,
        g.end_time,
        g.total_rounds,
        g.winner_name,
        g.winner_score,
        g.total_players
      FROM games g
      ORDER BY g.end_time DESC 
      LIMIT $1`,
      [limit]
    );

    // If no games found, return empty array
    if (gamesResult.rows.length === 0) {
      return [];
    }

    // Get all game IDs to fetch player results in a single query
    const gameIds = gamesResult.rows.map(game => game.game_id);
    
    // Fetch all player results for these games
    const playersResult = await client.query(
      `SELECT 
        game_id,
        player_name,
        final_score,
        final_position,
        tricks_landed,
        tricks_attempted,
        final_letters
      FROM player_results 
      WHERE game_id = ANY($1)
      ORDER BY final_position NULLS LAST`,
      [gameIds]
    );

    // Group players by game_id
    const playersByGameId = playersResult.rows.reduce((acc, player) => {
      const gameId = player.game_id;
      if (!acc[gameId]) {
        acc[gameId] = [];
      }
      acc[gameId].push({
        player_name: player.player_name,
        final_score: player.final_score,
        final_position: player.final_position,
        tricks_landed: player.tricks_landed,
        tricks_attempted: player.tricks_attempted,
        final_letters: player.final_letters?.toString() || ""
      });
      return acc;
    }, {} as Record<string, PlayerResult[]>);

    // Merge game data with player data
    const gamesWithPlayers = gamesResult.rows.map(game => ({
      ...game,
      players: playersByGameId[game.game_id] || []
    }));

    return gamesWithPlayers;
  } catch (error) {
    console.error("Error in getRecentGames:", error);
    return [];
  } finally {
    client.release();
  }
}

// Get detailed game data including players without caching
export async function getGameDetails(
  gameId: string
): Promise<GameWithDetails | null> {
  "use server";

  const client = await pool.connect();
  try {
    // Always fetch fresh game data from the database
    const gameResult = await client.query(
      `SELECT * FROM games WHERE game_id = $1`,
      [gameId]
    );

    if (gameResult.rows.length === 0) {
      return null;
    }

    // Always fetch fresh player results for this game
    const playersResult = await client.query(
      `SELECT 
        player_name,
        final_score,
        final_position,
        tricks_landed,
        tricks_attempted,
        final_letters
      FROM player_results 
      WHERE game_id = $1
      ORDER BY final_position NULLS LAST`,
      [gameId]
    );

    // Ensure final_letters is a string and handle null/undefined cases
    const processedPlayers = playersResult.rows.map((player) => ({
      ...player,
      final_letters: player.final_letters?.toString() || "",
    }));

    return {
      ...gameResult.rows[0],
      players: processedPlayers,
    };
  } catch (error) {
    console.error("Error in getGameDetails:", error);
    return null;
  } finally {
    client.release();
  }
}

type PlayerStats = {
  games_played: number;
  games_won: number;
  avg_score: number;
  total_tricks_landed: number;
  total_tricks_attempted: number;
};

// Get player statistics
export async function getPlayerStats(playerName: string): Promise<PlayerStats> {
  "use server";

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 
            COUNT(*) as games_played,
            SUM(CASE WHEN player_name = winner_name THEN 1 ELSE 0 END) as games_won,
            AVG(final_score) as avg_score,
            SUM(tricks_landed) as total_tricks_landed,
            SUM(tricks_attempted) as total_tricks_attempted
          FROM player_results
          WHERE player_name = $1`,
      [playerName]
    );
    return (result.rows[0] as PlayerStats) || null;
  } finally {
    client.release();
  }
}
