-- Purpose: Add database functions for post engagement counter updates
-- Run this in Supabase SQL editor

-- Increment post likes
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET like_count = like_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement post likes
CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Increment post comments
CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET comment_count = comment_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement post comments
CREATE OR REPLACE FUNCTION decrement_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Increment post reposts
CREATE OR REPLACE FUNCTION increment_post_reposts(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET repost_count = repost_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement post reposts
CREATE OR REPLACE FUNCTION decrement_post_reposts(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET repost_count = GREATEST(repost_count - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Increment poll option votes
CREATE OR REPLACE FUNCTION increment_poll_option_votes(option_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE post_poll_options SET vote_count = vote_count + 1 WHERE id = option_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement poll option votes
CREATE OR REPLACE FUNCTION decrement_poll_option_votes(option_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE post_poll_options SET vote_count = GREATEST(vote_count - 1, 0) WHERE id = option_id;
END;
$$ LANGUAGE plpgsql;

-- Add comment_likes table if it doesn't exist (for comment like tracking)
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (comment_id, user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON comment_likes(user_id);
