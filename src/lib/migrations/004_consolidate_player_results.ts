import { Pool } from 'pg';

export async function up(client: Pool) {
  // Add player_results JSONB column to games table
  await client.query(`
    ALTER TABLE games 
    ADD COLUMN IF NOT EXISTS player_results JSONB DEFAULT '[]'::jsonb;
  `);

  // Migrate existing player results
  await client.query(`
    UPDATE games g
    SET player_results = (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'player_name', pr.player_name,
          'final_score', pr.final_score,
          'final_position', pr.final_position,
          'tricks_landed', pr.tricks_landed,
          'tricks_attempted', pr.tricks_attempted,
          'final_letters', pr.final_letters
        )
      ), '[]'::jsonb)
      FROM player_results pr
      WHERE pr.game_id = g.game_id
    );
  `);

  // Create GIN index for better JSONB query performance
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_games_player_results 
    ON games USING GIN (player_results);
  `);
}

export async function down(client: Pool) {
  // Drop the index first
  await client.query(`
    DROP INDEX IF EXISTS idx_games_player_results;
  `);

  // Remove the column
  await client.query(`
    ALTER TABLE games 
    DROP COLUMN IF EXISTS player_results;
  `);
}
