"use server";

import { GameState } from "@/types/types";
import pool from "@/lib/db";

interface GameHistoryRow {
  game_id: string;
  start_time: string;
  end_time: string;
  winner_name: string;
  winner_score: number;
  total_players: number;
  total_rounds: number;
  creator_username?: string;
  players: any[];
  settings: Record<string, any>;
}

export async function saveGameResults(
  gameState: GameState
): Promise<{ success: boolean; gameId: string }> {
  console.log("Saving game results:", {
    isGameOver: gameState.isGameOver,
    winner: gameState.winner,
    players: gameState.players,
  });

  if (!gameState.isGameOver || !gameState.winner) {
    throw new Error(
      "Cannot save game results: Game is not over or has no winner"
    );
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Prepare player results as JSONB
    const playerResults = gameState.players.map((player) => ({
      player_name: player.name,
      final_score: player.score,
      final_letters: player.letters.join(","),
      tricks_landed: player.tricksLanded,
      tricks_attempted: player.tricksAttempted,
      is_eliminated: player.isEliminated || false,
      letters: player.letters,
      score: player.score,
      tricks: player.tricks || [],
    }));

    const gameStateToStore = {
      currentRound: gameState.currentRound,
      isGameOver: gameState.isGameOver,
      players: gameState.players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        letters: p.letters,
        isEliminated: p.isEliminated,
        tricksLanded: p.tricksLanded || 0,
        tricksAttempted: p.tricksAttempted || 0,
        tricks: p.tricks || [],
      })),
      winner: gameState.winner,
      startTime: gameState.startTime,
      endTime: gameState.endTime,
      settings: gameState.settings || {},
    };

    // Ensure dates are properly formatted
    const startTime = gameState.startTime
      ? new Date(gameState.startTime)
      : new Date();
    const endTime = gameState.endTime
      ? new Date(gameState.endTime)
      : new Date();
    const creatorUsername = gameState.creatorUsername || "unknown";

    // First, check if game_state column exists
    const checkColumn = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'game_state'
      )`);

    const hasGameStateColumn = checkColumn.rows[0].exists;

    // Build the query dynamically based on column existence
    const columns = [
      "start_time",
      "end_time",
      "player_results",
      "winner_name",
      "winner_score",
      "total_players",
      "total_rounds",
      "is_active",
      "settings",
      "creator_username",
    ];

    const values = [
      startTime.toISOString(),
      endTime.toISOString(),
      JSON.stringify(playerResults),
      gameState.winner.name,
      gameState.winner.score,
      gameState.players.length,
      gameState.currentRound,
      !gameState.isGameOver, // is_active
      JSON.stringify(gameState.settings || {}),
      creatorUsername,
    ];

    // Add game_state if the column exists
    if (hasGameStateColumn) {
      columns.push("game_state");
      values.push(JSON.stringify(gameStateToStore));
    }

    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
    const query = {
      text: `
        INSERT INTO games (
          ${columns.join(", ")}
        ) VALUES (${placeholders})
        RETURNING game_id
      `,
      values,
    };

    const result = await client.query(query);
    const gameId = result.rows[0].game_id;

    console.log("Game results saved successfully");
    await client.query("COMMIT");
    return { success: true, gameId };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to save game results:", error);
    throw error;
  }
}

export async function getGameHistory(limit = 10): Promise<GameHistoryRow[]> {
  const client = await pool.connect();
  try {
    // First, check if game_state column exists
    const checkColumn = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'game_state'
      )`);

    const hasGameStateColumn = checkColumn.rows[0].exists;

    // Build the query dynamically based on column existence
    const selectFields = [
      "game_id",
      "start_time",
      "end_time",
      "winner_name",
      "winner_score",
      "total_players",
      "total_rounds",
      "creator_username",
      "COALESCE(player_results, '[]'::jsonb) as players",
    ];

    if (hasGameStateColumn) {
      selectFields.push(`COALESCE(game_state->>'settings', '{}') as settings`);
    } else {
      selectFields.push(`'{}'::jsonb as settings`);
    }

    const query = {
      text: `
        SELECT ${selectFields.join(", ")}
        FROM games
        WHERE is_active = false
        ORDER BY end_time DESC
        LIMIT $1
      `,
      values: [limit],
    };

    const result = await client.query(query);

    // Transform the data to match the expected format
    return result.rows.map(
      (row): GameHistoryRow => ({
        game_id: row.game_id,
        start_time: row.start_time,
        end_time: row.end_time,
        winner_name: row.winner_name,
        winner_score: row.winner_score,
        total_players: row.total_players,
        total_rounds: row.current_round,
        creator_username: row.creator_username,
        players: row.players || [],
        settings: row.settings
          ? typeof row.settings === "string"
            ? JSON.parse(row.settings)
            : row.settings
          : {},
      })
    );
  } catch (error) {
    console.error("Failed to fetch game history:", error);
    throw error;
  } finally {
    client.release();
  }
}
