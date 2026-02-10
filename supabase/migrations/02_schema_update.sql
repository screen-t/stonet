-- Updated: 2026-01-29
-- Purpose: Reconcile schema with docs/DATABASE_SCHEMA.md
-- Adds missing enum values, safe unique constraint (user_skills), RLS policies for sensitive tables,
-- and helpful indexes. Run this in Supabase SQL editor.

-- =========================
-- 1) Add missing enum values to post_type (safe)
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'post_type' AND e.enumlabel = 'text'
  ) THEN
    ALTER TYPE post_type ADD VALUE 'text';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'post_type' AND e.enumlabel = 'image'
  ) THEN
    ALTER TYPE post_type ADD VALUE 'image';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'post_type' AND e.enumlabel = 'video'
  ) THEN
    ALTER TYPE post_type ADD VALUE 'video';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'post_type' AND e.enumlabel = 'poll'
  ) THEN
    ALTER TYPE post_type ADD VALUE 'poll';
  END IF;
END$$;

-- =========================
-- 2) Add UNIQUE constraint to user_skills (only if no duplicates)
-- =========================
DO $$
BEGIN
  -- Only add constraint if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'unique_user_skill' AND table_name = 'user_skills'
  ) THEN

    -- Check for duplicates and raise notice if present (will NOT add constraint)
    IF EXISTS (
      SELECT 1 FROM (
        SELECT user_id, skill, COUNT(*) cnt FROM user_skills GROUP BY user_id, skill HAVING COUNT(*) > 1
      ) s
    ) THEN
      RAISE NOTICE 'Duplicate user_skill rows exist. Please deduplicate before adding unique constraint.';
    ELSE
      ALTER TABLE user_skills ADD CONSTRAINT unique_user_skill UNIQUE (user_id, skill);
    END IF;
  END IF;
END$$;

-- Create supporting index (no-op if exists)
CREATE INDEX IF NOT EXISTS idx_user_skills_user_skill ON user_skills(user_id, skill);

-- =========================
-- 3) Add RLS policies for sensitive tables
-- NOTE: These are minimal templates. Adjust to your application rules as needed.
-- =========================

-- USERS table: users can SELECT/UPDATE their own rows
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_select_own') THEN
    CREATE POLICY users_select_own ON users
      FOR SELECT USING (auth.uid()::uuid = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_update_self') THEN
    CREATE POLICY users_update_self ON users
      FOR UPDATE USING (auth.uid()::uuid = id) WITH CHECK (auth.uid()::uuid = id);
  END IF;
END$$;

-- MESSAGES: participants only
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'messages_select_participant') THEN
    CREATE POLICY messages_select_participant ON messages
      FOR SELECT USING (EXISTS (
        SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()::uuid
      ));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'messages_insert_sender') THEN
    CREATE POLICY messages_insert_sender ON messages
      FOR INSERT WITH CHECK (sender_id = auth.uid()::uuid);
  END IF;
END$$;

-- NOTIFICATIONS: owner only
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'notifications_owner') THEN
    CREATE POLICY notifications_owner ON notifications
      FOR ALL USING (user_id = auth.uid()::uuid) WITH CHECK (user_id = auth.uid()::uuid);
  END IF;
END$$;

-- LOGIN ACTIVITY: user can read their own activities
ALTER TABLE login_activity ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'login_activity' AND policyname = 'login_activity_owner') THEN
    CREATE POLICY login_activity_owner ON login_activity
      FOR SELECT USING (user_id = auth.uid()::uuid);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'login_activity' AND policyname = 'login_activity_update_self') THEN
    CREATE POLICY login_activity_update_self ON login_activity
      FOR UPDATE USING (user_id = auth.uid()::uuid) WITH CHECK (user_id = auth.uid()::uuid);
  END IF;
END$$;

-- =========================
-- 4) Useful indexes
-- =========================
CREATE INDEX IF NOT EXISTS idx_login_activity_session ON login_activity(session_id);

-- =========================
-- 5) Verification helper queries (not executed by migration)
-- Use these in SQL editor to verify before/after running migration:
-- SELECT user_id, skill, COUNT(*) FROM user_skills GROUP BY user_id, skill HAVING COUNT(*) > 1;
-- SELECT t.typname AS enum_name, e.enumlabel AS enum_value FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'post_type' ORDER BY e.enumsortorder;
-- SELECT * FROM pg_policies WHERE schemaname='public' AND tablename IN ('users','messages','notifications','login_activity');

-- End of migration
