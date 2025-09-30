"use server";

import { GameState } from "@/types/types";
import pool from "@/lib/db";

export async function saveGameResults(
  gameState: GameState
): Promise<{ success: boolean; gameId: string }> {
  console.log("Saving game results:", {
    isGameOver: gameState.isGameOver,
    winner: gameState.winner,
    players: gameState.players.map((p) => `${p.name}: ${p.score} points`),
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
    const playerResults = gameState.players.map((player) => {
      const tricksLanded = player.tricksLanded || 0;
      const tricksAttempted = player.tricksAttempted || 0;

      const finalPosition = player.isEliminated
        ? null
        : gameState.players
            .filter((p) => !p.isEliminated)
            .sort((a, b) => b.score - a.score)
            .findIndex((p) => p.id === player.id) + 1;

      return {
        player_name: player.name,
        final_score: player.score,
        final_letters: player.letters.join(","),
        final_position: finalPosition,
        tricks_landed: tricksLanded,
        tricks_attempted: tricksAttempted,
      };
    });

    // 1. Insert game record with player results in JSONB
    // Ensure dates are properly formatted for the database with null checks
    let startTime = gameState.startTime
      ? new Date(gameState.startTime)
      : new Date();
    const endTime = gameState.endTime
      ? new Date(gameState.endTime)
      : new Date();

    // If startTime is still invalid (shouldn't happen), use current time as fallback
    if (isNaN(startTime.getTime())) {
      console.warn("Invalid startTime, using current time as fallback");
      startTime = new Date();
    }

    const gameResult = await client.query(
      `INSERT INTO games 
       (total_rounds, winner_name, winner_score, total_players, start_time, end_time, player_results)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING game_id`,
      [
        gameState.round || 1, // Default to 1 if currentRound is not set
        gameState.winner.name,
        gameState.winner.score,
        gameState.players.length,
        startTime.toISOString(), // Convert to ISO string for consistent formatting
        endTime.toISOString(),
        JSON.stringify(playerResults),
      ]
    );

    const gameId = gameResult.rows[0].game_id;

    // 2. For backward compatibility, keep inserting into player_results
    await Promise.all(
      gameState.players.map(async (player) => {
        const tricksLanded = player.tricksLanded || 0;
        const tricksAttempted = player.tricksAttempted || 0;

        const finalPosition = player.isEliminated
          ? null
          : gameState.players
              .filter((p) => !p.isEliminated)
              .sort((a, b) => b.score - a.score)
              .findIndex((p) => p.id === player.id) + 1;

        await client.query(
          `INSERT INTO player_results 
           (game_id, player_name, final_score, final_letters, final_position, tricks_landed, tricks_attempted)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            gameId,
            player.name,
            player.score,
            player.letters.join(","),
            finalPosition,
            tricksLanded,
            tricksAttempted,
          ]
        );
      })
    );

    console.log("Game results saved successfully");
    await client.query("COMMIT");
    return { success: true, gameId };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to save game results:", error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getGameHistory(limit = 10) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 
        game_id,
        start_time,
        end_time,
        winner_name,
        winner_score,
        total_players,
        total_rounds,
        COALESCE(player_results, '[]'::jsonb) as players
      FROM games
      ORDER BY end_time DESC
      LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (error) {
    console.error("Failed to fetch game history:", error);
    throw error;
  } finally {
    client.release();
  }
}
