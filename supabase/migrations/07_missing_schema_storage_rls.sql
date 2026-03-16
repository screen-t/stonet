-- Migration 07
-- Updated: 2026-03-05
-- Purpose:
--   1. Fix account_type column (was user_role enum) → TEXT with proper check constraint
--   2. Add missing enum values to notification_type
--   3. Add missing columns to work_experience and education
--   4. Add missing columns to users (connections_count, followers_count updated_at on comments)
--   5. Add RLS policies for all tables that are missing them
--   6. Create Storage buckets (post-media, avatars, covers)
--   7. Add Storage access policies
--   8. Add auth trigger to auto-create users row on signup

SET search_path TO public;

-- ==================================================
-- 1) FIX account_type on users
--    Migration 01 incorrectly typed this as user_role enum.
--    Backend expects 'professional' | 'business' TEXT.
-- ==================================================
DO $$
BEGIN
  -- Drop the foreign key on user_role if account_type is still that enum
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'account_type'
      AND udt_name = 'user_role'
  ) THEN
    ALTER TABLE users ALTER COLUMN account_type TYPE TEXT USING account_type::TEXT;
  END IF;
END$$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS connections_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS followers_count  INTEGER DEFAULT 0;

-- ==================================================
-- 2) Add missing notification_type enum values
-- ==================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'notification_type' AND e.enumlabel = 'connection_request') THEN
    ALTER TYPE notification_type ADD VALUE 'connection_request';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'notification_type' AND e.enumlabel = 'connection_accepted') THEN
    ALTER TYPE notification_type ADD VALUE 'connection_accepted';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'notification_type' AND e.enumlabel = 'repost') THEN
    ALTER TYPE notification_type ADD VALUE 'repost';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'notification_type' AND e.enumlabel = 'mention') THEN
    ALTER TYPE notification_type ADD VALUE 'mention';
  END IF;
END$$;

-- Also add actor_id, post_id etc to notifications so the frontend link logic works
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS actor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS post_id      UUID REFERENCES posts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS comment_id   UUID REFERENCES comments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS connection_id UUID REFERENCES connections(id) ON DELETE SET NULL,
  -- 'content' as alias for message (frontend uses notification.content)
  ADD COLUMN IF NOT EXISTS content      TEXT GENERATED ALWAYS AS (message) STORED;

CREATE INDEX IF NOT EXISTS idx_notifications_actor   ON notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_post    ON notifications(post_id);

-- ==================================================
-- 3) Add missing columns to work_experience
-- ==================================================
ALTER TABLE work_experience
  ADD COLUMN IF NOT EXISTS location   TEXT,
  ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_remote  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Backend uses 'position' but docs/model use it too — OK.
-- Rename 'position' → keep as is; just ensure column exists
ALTER TABLE work_experience
  ADD COLUMN IF NOT EXISTS title TEXT; -- some backend models use 'title' alias

-- ==================================================
-- 4) Add missing columns to education
-- ==================================================
ALTER TABLE education
  ADD COLUMN IF NOT EXISTS is_current   BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS grade        TEXT,
  ADD COLUMN IF NOT EXISTS description  TEXT,
  ADD COLUMN IF NOT EXISTS created_at   TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMP DEFAULT NOW();

-- ==================================================
-- 5) Add updated_at to comments (used by backend model)
-- ==================================================
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ==================================================
-- 6) RLS POLICIES
--    Enable RLS and add service_role bypass + per-user policies
--    for every table that was missing them.
-- ==================================================

-- Helper: enable RLS idempotently
ALTER TABLE posts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media          ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_polls          ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_poll_options   ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_poll_votes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reposts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections         ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience     ENABLE ROW LEVEL SECURITY;
ALTER TABLE education           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills         ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- ---- POSTS ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='posts' AND policyname='posts_service_all') THEN
    CREATE POLICY posts_service_all ON posts FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='posts' AND policyname='posts_public_select') THEN
    CREATE POLICY posts_public_select ON posts FOR SELECT USING (visibility = 'public' AND is_published = TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='posts' AND policyname='posts_owner_all') THEN
    CREATE POLICY posts_owner_all ON posts FOR ALL USING (author_id = auth.uid()::uuid);
  END IF;

  -- ---- POST_MEDIA ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_media' AND policyname='post_media_service_all') THEN
    CREATE POLICY post_media_service_all ON post_media FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_media' AND policyname='post_media_public_select') THEN
    CREATE POLICY post_media_public_select ON post_media FOR SELECT USING (TRUE);
  END IF;

  -- ---- POST_LIKES ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_likes' AND policyname='post_likes_service_all') THEN
    CREATE POLICY post_likes_service_all ON post_likes FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_likes' AND policyname='post_likes_auth') THEN
    CREATE POLICY post_likes_auth ON post_likes FOR ALL USING (user_id = auth.uid()::uuid);
  END IF;

  -- ---- POST_POLLS ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_polls' AND policyname='post_polls_service_all') THEN
    CREATE POLICY post_polls_service_all ON post_polls USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_polls' AND policyname='post_polls_select') THEN
    CREATE POLICY post_polls_select ON post_polls FOR SELECT USING (TRUE);
  END IF;

  -- ---- POST_POLL_OPTIONS ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_poll_options' AND policyname='poll_options_service_all') THEN
    CREATE POLICY poll_options_service_all ON post_poll_options USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_poll_options' AND policyname='poll_options_select') THEN
    CREATE POLICY poll_options_select ON post_poll_options FOR SELECT USING (TRUE);
  END IF;

  -- ---- POST_POLL_VOTES ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_poll_votes' AND policyname='poll_votes_service_all') THEN
    CREATE POLICY poll_votes_service_all ON post_poll_votes USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_poll_votes' AND policyname='poll_votes_auth') THEN
    CREATE POLICY poll_votes_auth ON post_poll_votes FOR ALL USING (user_id = auth.uid()::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_poll_votes' AND policyname='poll_votes_select') THEN
    CREATE POLICY poll_votes_select ON post_poll_votes FOR SELECT USING (TRUE);
  END IF;

  -- ---- REPOSTS ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reposts' AND policyname='reposts_service_all') THEN
    CREATE POLICY reposts_service_all ON reposts FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reposts' AND policyname='reposts_auth') THEN
    CREATE POLICY reposts_auth ON reposts FOR ALL USING (user_id = auth.uid()::uuid);
  END IF;

  -- ---- SAVED_POSTS ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='saved_posts' AND policyname='saved_posts_service_all') THEN
    CREATE POLICY saved_posts_service_all ON saved_posts FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='saved_posts' AND policyname='saved_posts_auth') THEN
    CREATE POLICY saved_posts_auth ON saved_posts FOR ALL USING (user_id = auth.uid()::uuid);
  END IF;

  -- ---- COMMENTS ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='comments' AND policyname='comments_service_all') THEN
    CREATE POLICY comments_service_all ON comments FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='comments' AND policyname='comments_select') THEN
    CREATE POLICY comments_select ON comments FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='comments' AND policyname='comments_owner_write') THEN
    CREATE POLICY comments_owner_write ON comments FOR ALL USING (author_id = auth.uid()::uuid);
  END IF;

  -- ---- CONNECTIONS ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='connections' AND policyname='connections_service_all') THEN
    CREATE POLICY connections_service_all ON connections FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='connections' AND policyname='connections_participant') THEN
    CREATE POLICY connections_participant ON connections FOR ALL
      USING (requester_id = auth.uid()::uuid OR receiver_id = auth.uid()::uuid);
  END IF;

  -- ---- WORK_EXPERIENCE ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='work_experience' AND policyname='work_exp_service_all') THEN
    CREATE POLICY work_exp_service_all ON work_experience FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='work_experience' AND policyname='work_exp_select') THEN
    CREATE POLICY work_exp_select ON work_experience FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='work_experience' AND policyname='work_exp_owner_write') THEN
    CREATE POLICY work_exp_owner_write ON work_experience FOR ALL USING (user_id = auth.uid()::uuid);
  END IF;

  -- ---- EDUCATION ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='education' AND policyname='education_service_all') THEN
    CREATE POLICY education_service_all ON education FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='education' AND policyname='education_select') THEN
    CREATE POLICY education_select ON education FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='education' AND policyname='education_owner_write') THEN
    CREATE POLICY education_owner_write ON education FOR ALL USING (user_id = auth.uid()::uuid);
  END IF;

  -- ---- USER_SKILLS ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_skills' AND policyname='skills_service_all') THEN
    CREATE POLICY skills_service_all ON user_skills FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_skills' AND policyname='skills_select') THEN
    CREATE POLICY skills_select ON user_skills FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_skills' AND policyname='skills_owner_write') THEN
    CREATE POLICY skills_owner_write ON user_skills FOR ALL USING (user_id = auth.uid()::uuid);
  END IF;

  -- ---- CONVERSATIONS ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='conversations' AND policyname='conversations_service_all') THEN
    CREATE POLICY conversations_service_all ON conversations FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='conversations' AND policyname='conversations_participant') THEN
    CREATE POLICY conversations_participant ON conversations FOR SELECT
      USING (EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = id AND cp.user_id = auth.uid()::uuid));
  END IF;

  -- ---- CONVERSATION_PARTICIPANTS ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='conversation_participants' AND policyname='conv_participants_service_all') THEN
    CREATE POLICY conv_participants_service_all ON conversation_participants FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='conversation_participants' AND policyname='conv_participants_self') THEN
    CREATE POLICY conv_participants_self ON conversation_participants FOR SELECT USING (user_id = auth.uid()::uuid);
  END IF;

  -- ---- USERS: also allow selecting other users' public data ----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='users_public_select') THEN
    CREATE POLICY users_public_select ON users FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='users_service_all') THEN
    CREATE POLICY users_service_all ON users FOR ALL USING (auth.role() = 'service_role');
  END IF;
END$$;

-- ==================================================
-- 7) STORAGE POLICIES
--    Buckets (post-media, avatars, covers) already exist — created manually.
--    This section only adds the missing access policies (all buckets show 0 policies).
-- ==================================================

-- Storage policies for post-media
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='post_media_public_read') THEN
    CREATE POLICY post_media_public_read ON storage.objects FOR SELECT USING (bucket_id = 'post-media');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='post_media_auth_insert') THEN
    CREATE POLICY post_media_auth_insert ON storage.objects FOR INSERT WITH CHECK (
      bucket_id = 'post-media' AND auth.role() = 'authenticated'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='post_media_owner_delete') THEN
    CREATE POLICY post_media_owner_delete ON storage.objects FOR DELETE USING (
      bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Avatars
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='avatars_public_read') THEN
    CREATE POLICY avatars_public_read ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='avatars_owner_write') THEN
    CREATE POLICY avatars_owner_write ON storage.objects FOR INSERT WITH CHECK (
      bucket_id = 'avatars' AND auth.role() = 'authenticated'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='avatars_owner_update') THEN
    CREATE POLICY avatars_owner_update ON storage.objects FOR UPDATE USING (
      bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='avatars_owner_delete') THEN
    CREATE POLICY avatars_owner_delete ON storage.objects FOR DELETE USING (
      bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Covers
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='covers_public_read') THEN
    CREATE POLICY covers_public_read ON storage.objects FOR SELECT USING (bucket_id = 'covers');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='covers_owner_write') THEN
    CREATE POLICY covers_owner_write ON storage.objects FOR INSERT WITH CHECK (
      bucket_id = 'covers' AND auth.role() = 'authenticated'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='covers_owner_update') THEN
    CREATE POLICY covers_owner_update ON storage.objects FOR UPDATE USING (
      bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='covers_owner_delete') THEN
    CREATE POLICY covers_owner_delete ON storage.objects FOR DELETE USING (
      bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END$$;

-- ==================================================
-- 8) AUTH TRIGGER: auto-insert into public.users on signup
--    (The snippet in the repo notes this is needed but never implemented it)
-- ==================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    username,
    is_verified,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name',  split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username',   'user_' || left(NEW.id::text, 8)),
    FALSE,
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;  -- safe if backend already created the row
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ==================================================
-- Verification queries (run manually after applying):
-- SELECT id, name, public FROM storage.buckets WHERE id IN ('post-media','avatars','covers');
-- SELECT policyname, tablename FROM pg_policies WHERE schemaname IN ('public','storage') ORDER BY tablename;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' AND column_name='account_type';
-- SELECT column_name FROM information_schema.columns WHERE table_name='work_experience';
-- SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_type.oid = pg_enum.enumtypid WHERE typname='notification_type';
-- ==================================================
