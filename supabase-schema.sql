-- NYE Countdown App - Supabase Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/rghzopkeoqrfooroisqb/sql/new

-- ============================================
-- TABLE: rooms
-- Stores room metadata and game state
-- ============================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  game_type VARCHAR(50),
  game_state JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'lobby',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '6 hours')
);

-- ============================================
-- TABLE: players
-- Stores player information within rooms
-- ============================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  avatar_color VARCHAR(20) DEFAULT '#9333ea',
  avatar_emoji VARCHAR(10) DEFAULT '😀',
  is_host BOOLEAN DEFAULT FALSE,
  is_connected BOOLEAN DEFAULT TRUE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  player_state JSONB DEFAULT '{}',
  UNIQUE(room_id, name)
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_expires_at ON rooms(expires_at);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_players_connected ON players(room_id, is_connected);

-- ============================================
-- ENABLE REALTIME
-- This allows live updates to be pushed to clients
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Rooms: Anyone can read and create, updates handled by app logic
CREATE POLICY "rooms_read" ON rooms FOR SELECT USING (true);
CREATE POLICY "rooms_insert" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "rooms_update" ON rooms FOR UPDATE USING (true);
CREATE POLICY "rooms_delete" ON rooms FOR DELETE USING (true);

-- Players: Anyone can read and create, updates handled by app logic
CREATE POLICY "players_read" ON players FOR SELECT USING (true);
CREATE POLICY "players_insert" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "players_update" ON players FOR UPDATE USING (true);
CREATE POLICY "players_delete" ON players FOR DELETE USING (true);

-- ============================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FUNCTION: Cleanup expired rooms (optional cron job)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- To run cleanup periodically, you can use pg_cron extension or
-- call this function from a scheduled Edge Function
