-- Fix poll RLS policies so INSERT/UPDATE work correctly.
-- Root cause: policies created with FOR ALL USING (...) only.
-- INSERT/UPDATE operations need WITH CHECK (...).

ALTER TABLE post_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_poll_votes ENABLE ROW LEVEL SECURITY;

-- Recreate post_polls policies
DROP POLICY IF EXISTS post_polls_service_all ON post_polls;
DROP POLICY IF EXISTS post_polls_select ON post_polls;

CREATE POLICY post_polls_service_all
  ON post_polls
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY post_polls_select
  ON post_polls
  FOR SELECT
  USING (TRUE);

-- Recreate post_poll_options policies
DROP POLICY IF EXISTS poll_options_service_all ON post_poll_options;
DROP POLICY IF EXISTS poll_options_select ON post_poll_options;

CREATE POLICY poll_options_service_all
  ON post_poll_options
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY poll_options_select
  ON post_poll_options
  FOR SELECT
  USING (TRUE);

-- Recreate post_poll_votes policies
DROP POLICY IF EXISTS poll_votes_service_all ON post_poll_votes;
DROP POLICY IF EXISTS poll_votes_auth ON post_poll_votes;
DROP POLICY IF EXISTS poll_votes_select ON post_poll_votes;

CREATE POLICY poll_votes_service_all
  ON post_poll_votes
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY poll_votes_auth
  ON post_poll_votes
  FOR ALL
  USING (user_id = auth.uid()::uuid)
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY poll_votes_select
  ON post_poll_votes
  FOR SELECT
  USING (TRUE);
