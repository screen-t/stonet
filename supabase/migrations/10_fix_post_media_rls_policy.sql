-- Fix post_media RLS policy so INSERT/UPDATE are explicitly allowed for service_role.
-- Root cause pattern: policy existed with USING only and did not reliably allow writes.

ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS post_media_service_all ON post_media;
DROP POLICY IF EXISTS post_media_public_select ON post_media;

CREATE POLICY post_media_service_all
  ON post_media
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY post_media_public_select
  ON post_media
  FOR SELECT
  USING (TRUE);
