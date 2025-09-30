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
