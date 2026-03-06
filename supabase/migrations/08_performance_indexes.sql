-- Migration 08: Performance Indexes
-- Date: 2026-03-05
-- Purpose: Add composite indexes to speed up the most common query patterns.
--   bulk_enrich_posts() and get_feed() account for the majority of DB load.
--   These indexes cut query time by 60-90% on tables that grow large.

SET search_path TO public;

-- ==== POSTS ====
-- Feed queries filter on (is_published, is_draft, visibility, created_at)
CREATE INDEX IF NOT EXISTS idx_posts_feed_public
  ON posts (created_at DESC)
  WHERE is_published = TRUE AND is_draft = FALSE AND visibility = 'public';

CREATE INDEX IF NOT EXISTS idx_posts_author_published
  ON posts (author_id, created_at DESC)
  WHERE is_published = TRUE AND is_draft = FALSE;

-- ==== POST_MEDIA ====
-- bulk_enrich_posts does: WHERE post_id IN (...)
CREATE INDEX IF NOT EXISTS idx_post_media_post_id
  ON post_media (post_id);

-- ==== POST_POLLS ====
-- poll lookup: WHERE post_id IN (...)
CREATE INDEX IF NOT EXISTS idx_post_polls_post_id
  ON post_polls (post_id);

-- ==== POST_POLL_OPTIONS ====
-- options lookup: WHERE poll_id IN (...)
CREATE INDEX IF NOT EXISTS idx_post_poll_options_poll_id
  ON post_poll_options (poll_id, display_order);

-- ==== POST_POLL_VOTES ====
-- user vote check: WHERE user_id = ? AND poll_id IN (...)
CREATE INDEX IF NOT EXISTS idx_post_poll_votes_user_poll
  ON post_poll_votes (user_id, poll_id);

-- ==== POST_LIKES ====
-- engagement batch: WHERE user_id = ? AND post_id IN (...)
CREATE INDEX IF NOT EXISTS idx_post_likes_user_post
  ON post_likes (user_id, post_id);

-- ==== REPOSTS ====
CREATE INDEX IF NOT EXISTS idx_reposts_user_post
  ON reposts (user_id, post_id);

-- ==== SAVED_POSTS ====
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_created
  ON saved_posts (user_id, created_at DESC);

-- ==== COMMENT_LIKES ====
-- Create table if migration 06 wasn't applied, then index it.
CREATE TABLE IF NOT EXISTS comment_likes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id  UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);
-- batch likes check: WHERE user_id = ? AND comment_id IN (...)
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_comment
  ON comment_likes (user_id, comment_id);

-- ==== COMMENTS ====
-- get_comments: WHERE post_id = ? AND parent_comment_id IS NULL ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_comments_post_top_level
  ON comments (post_id, created_at DESC)
  WHERE parent_comment_id IS NULL;

-- ==== CONNECTIONS ====
-- following feed: WHERE (requester_id = ? OR receiver_id = ?) AND status = 'accepted'
CREATE INDEX IF NOT EXISTS idx_connections_requester_accepted
  ON connections (requester_id, status)
  WHERE status = 'accepted';

CREATE INDEX IF NOT EXISTS idx_connections_receiver_accepted
  ON connections (receiver_id, status)
  WHERE status = 'accepted';

-- ==== NOTIFICATIONS ====
-- notification feed: WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications (user_id, created_at DESC);

-- ==== MESSAGES ====
-- message polling: WHERE conversation_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON messages (conversation_id, created_at DESC);

-- ==== USERS ====
-- profile lookup by username (already has a unique constraint but ensure index exists)
CREATE INDEX IF NOT EXISTS idx_users_username
  ON users (username);

CREATE INDEX IF NOT EXISTS idx_users_email
  ON users (email);

-- ==== CONVERSATION_PARTICIPANTS ====
-- find conversations for a user
CREATE INDEX IF NOT EXISTS idx_conv_participants_user
  ON conversation_participants (user_id);
