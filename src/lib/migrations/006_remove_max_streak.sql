-- Remove max_streak column from player_results table
ALTER TABLE player_results 
DROP COLUMN IF EXISTS max_streak;

-- Update the player_results JSONB column in games table to remove max_streak
UPDATE games 
SET player_results = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'player_name', pr.player_name,
      'final_score', pr.final_score,
      'final_letters', pr.final_letters,
      'final_position', pr.final_position,
      'tricks_landed', pr.tricks_landed,
      'tricks_attempted', pr.tricks_attempted
    )
  )
  FROM player_results pr
  WHERE pr.game_id = games.game_id
)
WHERE EXISTS (SELECT 1 FROM player_results pr WHERE pr.game_id = games.game_id);

-- Recreate the view without max_streak
CREATE OR REPLACE VIEW game_history AS
SELECT 
  g.game_id,
  g.winner_name,
  g.winner_score,
  g.total_players,
  g.total_rounds,
  g.end_time,
  g.player_results
FROM games g
ORDER BY g.end_time DESC;
