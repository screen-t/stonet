-- Updated: 2026-01-30
-- Purpose: Add `last_active_at` column to `users` to support backend login updates
-- Run in Supabase SQL editor (staging) and then verify the login endpoint

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP;

-- Add an index to speed up queries that sort/filter by last_active_at
CREATE INDEX IF NOT EXISTS idx_users_last_active_at ON users(last_active_at);

-- Verification queries (run after applying):
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' AND column_name='last_active_at';
-- SELECT * FROM users ORDER BY last_active_at DESC LIMIT 5;

-- Notes:
-- No data migration required; column will be NULL for existing rows and set by application on login.
-- After running this SQL, your backend call to update last_active_at should succeed and the PGRST204 error will be resolved.
