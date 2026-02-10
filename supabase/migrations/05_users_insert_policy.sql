-- Updated: 2026-01-30
-- Purpose: Add RLS INSERT policy to allow the backend service role to insert into `users`
-- Run this in Supabase SQL editor (staging/production) to fix 422 on signup when RLS blocks inserts

-- Ensure RLS is enabled for users (idempotent)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_insert_service'
  ) THEN
    CREATE POLICY users_insert_service ON users
      FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
END$$;

-- Verification query (run manually after applying):
-- SELECT polname, * FROM pg_policies WHERE schemaname='public' AND tablename='users';

-- Notes:
-- - This policy allows the Supabase Service Role (server-side key) to insert rows into `users`.
-- - This keeps RLS in place for end-users while letting trusted backend code (using service role) write user records.
-- - If you prefer a different model (e.g., permitting inserts by "auth" user immediately after signup), we can add
--   a different policy such as: FOR INSERT WITH CHECK (auth.uid()::uuid = id)
--   but that may not work because the new auth user isn't authenticated yet in that request.
