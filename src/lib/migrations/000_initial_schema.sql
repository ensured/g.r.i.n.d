-- UP migration: Create games table and indexes
DROP TABLE IF EXISTS games CASCADE;

-- Create games table with simplified schema
CREATE TABLE games (
    game_id SERIAL PRIMARY KEY,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    player_results JSONB,
    game_state JSONB,
    winner_name TEXT,
    winner_score INTEGER,
    total_players INTEGER,
    total_rounds INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,
    creator_username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_games_creator_username ON games(creator_username);
CREATE INDEX idx_games_is_active ON games(is_active);
CREATE INDEX idx_games_created_at ON games(created_at);

-- DOWN
DROP TABLE IF EXISTS games CASCADE;