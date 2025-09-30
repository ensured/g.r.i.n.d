"use server";

import pool from "@/lib/db";

export type GameResult = {
  game_id: string;
  start_time: string;
  end_time: string;
  total_rounds: number;
  winner_name: string;
  winner_score: number;
  total_players: number;
  creator_username?: string;
  players: PlayerResult[];
};

export type PlayerResult = {
  player_name: string;
  final_score: number;
  tricks_landed: number;
  tricks_attempted: number;
  final_letters?: string;
};
export type GameWithDetails = GameResult & {
  players: PlayerResult[];
};

export async function getRecentGames(limit = 10): Promise<GameResult[]> {
  "use server";

  const client = await pool.connect();
  try {
    // Get the list of recent games with their player results
    const gamesResult = await client.query<GameResult>(
      `SELECT 
        game_id,
        start_time,
        end_time,
        total_rounds,
        winner_name,
        winner_score,
        total_players,
        creator_username,
        player_results as players
      FROM games 
      WHERE end_time IS NOT NULL
      ORDER BY end_time DESC 
      LIMIT $1`,
      [limit]
    );

    // Process each game's player results
    const gamesWithPlayers = gamesResult.rows.map(game => {
      // Process player results from JSONB
      const players: PlayerResult[] = game.players || [];
      const processedPlayers = players.map(player => ({
        player_name: player.player_name,
        final_score: player.final_score || 0,
        tricks_landed: player.tricks_landed || 0,
        tricks_attempted: player.tricks_attempted || 0,
        final_letters: player.final_letters?.toString() || "",
      }));

      return {
        game_id: game.game_id,
        start_time: game.start_time,
        end_time: game.end_time,
        total_rounds: game.total_rounds,
        winner_name: game.winner_name,
        winner_score: game.winner_score,
        total_players: game.total_players,
        creator_username: game.creator_username,
        players: processedPlayers
      };
    });

    return gamesWithPlayers;
  } catch (error) {
    console.error("Error in getRecentGames:", error);
    return [];
  } finally {
    client.release();
  }
}

// Get detailed game data including players
export async function getGameDetails(
  gameId: string
): Promise<GameWithDetails | null> {
  "use server";

  const client = await pool.connect();
  try {
    // Fetch the game data
    const gameResult = await client.query(
      `SELECT 
        game_id,
        start_time,
        end_time,
        player_results as players,
        game_state,
        winner_name,
        winner_score,
        total_players,
        total_rounds,
        current_round,
        is_active,
        creator_username,
        created_at,
        updated_at
      FROM games 
      WHERE game_id = $1`,
      [gameId]
    );

    if (gameResult.rows.length === 0) {
      return null;
    }

    const game = gameResult.rows[0];
    
    // Process player results from JSONB
    const players: PlayerResult[] = game.players || [];
    const processedPlayers = players.map(player => ({
      ...player,
      // Ensure all required fields have default values
      final_letters: player.final_letters?.toString() || "",
      tricks_landed: player.tricks_landed || 0,
      tricks_attempted: player.tricks_attempted || 0,
      final_score: player.final_score || 0
    }));

    // Extract game state if needed
    const gameState = game.game_state || {};

    return {
      game_id: game.game_id,
      start_time: game.start_time,
      end_time: game.end_time,
      total_rounds: game.total_rounds,
      winner_name: game.winner_name,
      winner_score: game.winner_score,
      total_players: game.total_players,
      creator_username: game.creator_username,
      players: processedPlayers,
      // Include any additional fields from game_state if needed
      ...gameState
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
    // Get all games where the player participated
    const result = await client.query(
      `WITH player_games AS (
        SELECT 
          jsonb_array_elements(player_results) as player_data,
          winner_name
        FROM games
        WHERE player_results @> $1::jsonb
      )
      SELECT 
        COUNT(*) as games_played,
        SUM(CASE WHEN (player_data->>'player_name') = winner_name THEN 1 ELSE 0 END) as games_won,
        AVG((player_data->>'final_score')::numeric) as avg_score,
        COALESCE(SUM((player_data->>'tricks_landed')::integer), 0) as total_tricks_landed,
        COALESCE(SUM((player_data->>'tricks_attempted')::integer), 0) as total_tricks_attempted
      FROM player_games
      WHERE player_data->>'player_name' = $2`,
      [JSON.stringify([{ player_name: playerName }]), playerName]
    );
    
    // Ensure we return default values if no games found
    const stats = result.rows[0] || {};
    return {
      games_played: Number(stats.games_played) || 0,
      games_won: Number(stats.games_won) || 0,
      avg_score: Number(stats.avg_score) || 0,
      total_tricks_landed: Number(stats.total_tricks_landed) || 0,
      total_tricks_attempted: Number(stats.total_tricks_attempted) || 0
    };
  } finally {
    client.release();
  }
}
