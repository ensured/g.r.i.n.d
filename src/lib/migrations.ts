// This file contains SQL migrations as strings
export const migrations = {
  '005_add_max_streak': `
    -- Add max_streak column to player_results table
    ALTER TABLE player_results 
    ADD COLUMN IF NOT EXISTS max_streak INTEGER DEFAULT 0;

    -- Update the player_results JSONB column in games table to include max_streak
    UPDATE games 
    SET player_results = (
      SELECT jsonb_agg(
        jsonb_build_object(
          'player_name', pr.player_name,
          'final_score', pr.final_score,
          'final_position', pr.final_position,
          'tricks_landed', pr.tricks_landed,
          'tricks_attempted', pr.tricks_attempted,
          'final_letters', pr.final_letters,
          'max_streak', COALESCE(pr.max_streak, 0)
        )
      )
      FROM player_results pr
      WHERE pr.game_id = games.game_id
      GROUP BY pr.game_id
    )
    WHERE EXISTS (SELECT 1 FROM player_results pr WHERE pr.game_id = games.game_id);

    -- Create or replace the view to include max_streak
    CREATE OR REPLACE VIEW game_history AS
    SELECT 
      g.game_id,
      g.winner_name,
      g.winner_score,
      g.total_players,
      g.end_time,
      g.player_results,
      jsonb_array_elements(g.player_results) AS player_result
    FROM games g
    ORDER BY g.end_time DESC;
  `,
  '003_create_profiles': `
    -- Create profiles table
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL UNIQUE,  -- Clerk user ID
      username TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
  `,
  '002_drop_game_turns': `
    -- Drop indexes first
    DROP INDEX IF EXISTS idx_game_turns_game_id;
    DROP INDEX IF EXISTS idx_game_turns_player_id;
    
    -- Then drop the table
    DROP TABLE IF EXISTS game_turns;
  `,
  '001_initial_schema': `
    -- Create games table
    CREATE TABLE IF NOT EXISTS games (
        game_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        end_time TIMESTAMP WITH TIME ZONE,
        total_rounds INTEGER NOT NULL,
        winner_name TEXT,
        winner_score INTEGER,
        total_players INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create player_results table
    CREATE TABLE IF NOT EXISTS player_results (
        result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID REFERENCES games(game_id) ON DELETE CASCADE,
        player_name TEXT NOT NULL,
        final_score INTEGER NOT NULL,
        final_letters TEXT,
        final_position INTEGER,
        tricks_landed INTEGER NOT NULL DEFAULT 0,
        tricks_attempted INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create game_turns table
    CREATE TABLE IF NOT EXISTS game_turns (
        turn_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID REFERENCES games(game_id) ON DELETE CASCADE,
        player_id UUID REFERENCES player_results(result_id) ON DELETE CASCADE,
        round_number INTEGER NOT NULL,
        trick_name TEXT NOT NULL,
        trick_difficulty TEXT NOT NULL,
        trick_points INTEGER NOT NULL,
        result TEXT NOT NULL,
        turn_type TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create index for better query performance
    CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at);
    CREATE INDEX IF NOT EXISTS idx_player_results_game_id ON player_results(game_id);
    CREATE INDEX IF NOT EXISTS idx_game_turns_game_id ON game_turns(game_id);
    CREATE INDEX IF NOT EXISTS idx_game_turns_player_id ON game_turns(player_id);
  `
} as const;
