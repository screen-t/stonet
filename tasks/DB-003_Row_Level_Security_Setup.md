# TASK: DB-003 - Row Level Security Setup

**Assigned To:** Database Developer  
**Priority:** HIGH  
**Estimate:** 8 hours  
**Deadline:** February 8, 2026  
**Status:** Not Started  
**Dependencies:** DB-002A (Update Database Migration), BE-001 (Supabase Project Setup)  
**Created:** February 5, 2026

---

## Objective

Implement comprehensive Row Level Security (RLS) policies for all user data tables to ensure users can only access and modify their own data, with proper admin overrides.

## Prerequisites

- DB-002A (Update Database Migration) completed
- Understanding of PostgreSQL RLS concepts
- Knowledge of Supabase Auth system
- Familiarity with SQL policy creation
- Access to Supabase SQL Editor or migration system

## Instructions

### Step 1: Enable RLS on All User Tables

Create a new migration file: `supabase/migrations/20260206_enable_rls.sql`

```sql
-- Enable Row Level Security on all user-related tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS education ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- Note: auth.users table RLS is managed by Supabase Auth automatically
```

### Step 2: Create Profile RLS Policies

```sql
-- Profiles table RLS policies
-- Users can read any profile (for public profile viewing)
CREATE POLICY "Anyone can read profiles" ON profiles
  FOR SELECT
  USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users cannot delete profiles (business rule)
CREATE POLICY "No profile deletion" ON profiles
  FOR DELETE
  USING (false);

-- Admin users can manage all profiles
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'super_admin')
    )
  );
```

### Step 3: Create Work Experience RLS Policies

```sql
-- Work Experience table RLS policies
-- Users can read work experience for profiles they can view
CREATE POLICY "Users can read work experience" ON work_experience
  FOR SELECT
  USING (
    -- Public profiles or own profile
    user_id IN (
      SELECT id FROM profiles 
      WHERE privacy_settings->>'work_experience' = 'public'
      OR id = auth.uid()
    )
    OR
    -- Connected users (if privacy is 'connections')
    (
      user_id IN (
        SELECT id FROM profiles 
        WHERE privacy_settings->>'work_experience' = 'connections'
      )
      AND EXISTS (
        SELECT 1 FROM connections 
        WHERE (user1_id = auth.uid() AND user2_id = work_experience.user_id)
        OR (user2_id = auth.uid() AND user1_id = work_experience.user_id)
        AND status = 'accepted'
      )
    )
  );

-- Users can only insert their own work experience
CREATE POLICY "Users can insert own work experience" ON work_experience
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own work experience
CREATE POLICY "Users can update own work experience" ON work_experience
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own work experience
CREATE POLICY "Users can delete own work experience" ON work_experience
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Step 4: Create Education RLS Policies

```sql
-- Education table RLS policies (similar to work experience)
CREATE POLICY "Users can read education" ON education
  FOR SELECT
  USING (
    -- Public profiles or own profile
    user_id IN (
      SELECT id FROM profiles 
      WHERE privacy_settings->>'education' = 'public'
      OR id = auth.uid()
    )
    OR
    -- Connected users (if privacy is 'connections')
    (
      user_id IN (
        SELECT id FROM profiles 
        WHERE privacy_settings->>'education' = 'connections'
      )
      AND EXISTS (
        SELECT 1 FROM connections 
        WHERE (user1_id = auth.uid() AND user2_id = education.user_id)
        OR (user2_id = auth.uid() AND user1_id = education.user_id)
        AND status = 'accepted'
      )
    )
  );

CREATE POLICY "Users can insert own education" ON education
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own education" ON education
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own education" ON education
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Step 5: Create Posts and Comments RLS Policies

```sql
-- Posts table RLS policies
-- Users can read posts based on privacy settings
CREATE POLICY "Users can read posts" ON posts
  FOR SELECT
  USING (
    -- Public posts
    visibility = 'public'
    OR
    -- Own posts
    author_id = auth.uid()
    OR
    -- Connection-only posts from connected users
    (
      visibility = 'connections'
      AND EXISTS (
        SELECT 1 FROM connections
        WHERE (user1_id = auth.uid() AND user2_id = posts.author_id)
        OR (user2_id = auth.uid() AND user1_id = posts.author_id)
        AND status = 'accepted'
      )
    )
  );

-- Users can insert posts
CREATE POLICY "Users can create posts" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE
  USING (auth.uid() = author_id);

-- Comments table RLS policies
-- Users can read comments on posts they can see
CREATE POLICY "Users can read comments" ON comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      -- Use the same visibility logic as posts
      AND (
        posts.visibility = 'public'
        OR posts.author_id = auth.uid()
        OR (
          posts.visibility = 'connections'
          AND EXISTS (
            SELECT 1 FROM connections
            WHERE (user1_id = auth.uid() AND user2_id = posts.author_id)
            OR (user2_id = auth.uid() AND user1_id = posts.author_id)
            AND status = 'accepted'
          )
        )
      )
    )
  );

-- Users can create comments on posts they can see
CREATE POLICY "Users can create comments" ON comments
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND (
        posts.visibility = 'public'
        OR posts.author_id = auth.uid()
        OR (
          posts.visibility = 'connections'
          AND EXISTS (
            SELECT 1 FROM connections
            WHERE (user1_id = auth.uid() AND user2_id = posts.author_id)
            OR (user2_id = auth.uid() AND user1_id = posts.author_id)
            AND status = 'accepted'
          )
        )
      )
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE
  USING (auth.uid() = author_id);
```

### Step 6: Create Connections RLS Policies

```sql
-- Connections table RLS policies
-- Users can read connections involving them
CREATE POLICY "Users can read own connections" ON connections
  FOR SELECT
  USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Users can create connection records (handled by connection request system)
CREATE POLICY "Users can create connections" ON connections
  FOR INSERT
  WITH CHECK (
    (user1_id = auth.uid() OR user2_id = auth.uid())
    AND user1_id != user2_id
  );

-- Users can update connection status for their connections
CREATE POLICY "Users can update own connections" ON connections
  FOR UPDATE
  USING (user1_id = auth.uid() OR user2_id = auth.uid())
  WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- Users can delete their connections
CREATE POLICY "Users can delete own connections" ON connections
  FOR DELETE
  USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Connection requests table RLS policies
-- Users can read requests sent to them or by them
CREATE POLICY "Users can read own connection requests" ON connection_requests
  FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Users can create connection requests
CREATE POLICY "Users can create connection requests" ON connection_requests
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND sender_id != recipient_id
  );

-- Users can update requests sent to them (accepting/rejecting)
CREATE POLICY "Users can update received requests" ON connection_requests
  FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Users can delete their own requests (cancelling)
CREATE POLICY "Users can delete own requests" ON connection_requests
  FOR DELETE
  USING (sender_id = auth.uid());
```

### Step 7: Create Messages RLS Policies

```sql
-- Messages table RLS policies
-- Users can read messages they sent or received
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Users can send messages
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND sender_id != recipient_id
    -- Only allow messaging between connected users
    AND EXISTS (
      SELECT 1 FROM connections
      WHERE (user1_id = sender_id AND user2_id = recipient_id)
      OR (user1_id = recipient_id AND user2_id = sender_id)
      AND status = 'accepted'
    )
  );

-- Users can update their own messages (marking as read, editing if allowed)
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE
  USING (sender_id = auth.uid() OR recipient_id = auth.uid())
  WITH CHECK (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages" ON messages
  FOR DELETE
  USING (sender_id = auth.uid());
```

### Step 8: Create Notifications RLS Policies

```sql
-- Notifications table RLS policies
-- Users can only read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- System can create notifications (no user insert policy needed)
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT
  WITH CHECK (true); -- This will be restricted by application logic

-- Users can update their own notifications (marking as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE
  USING (user_id = auth.uid());
```

### Step 9: Create RLS Testing Functions

Add testing helpers to verify RLS policies:

```sql
-- Function to test RLS policies
CREATE OR REPLACE FUNCTION test_rls_policies()
RETURNS TABLE(
  table_name text,
  policy_count integer,
  rls_enabled boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text,
    COUNT(p.policyname)::integer,
    t.rowsecurity::boolean
  FROM information_schema.tables t
  LEFT JOIN pg_policies p ON p.tablename = t.table_name
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name IN (
      'profiles', 'work_experience', 'education', 'posts', 
      'comments', 'connections', 'connection_requests', 
      'messages', 'notifications'
    )
  GROUP BY t.table_name, t.rowsecurity
  ORDER BY t.table_name;
END;
$$ LANGUAGE plpgsql;

-- Function to check RLS status
CREATE OR REPLACE FUNCTION check_rls_status()
RETURNS TABLE(
  table_name text,
  rls_enabled boolean,
  policy_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.relname::text,
    c.relrowsecurity,
    COUNT(pol.policyname)::integer
  FROM pg_class c
  LEFT JOIN pg_policies pol ON pol.tablename = c.relname
  WHERE c.relname IN (
    'profiles', 'work_experience', 'education', 'posts',
    'comments', 'connections', 'connection_requests',
    'messages', 'notifications'
  )
  GROUP BY c.relname, c.relrowsecurity
  ORDER BY c.relname;
END;
$$ LANGUAGE plpgsql;
```

### Step 10: Apply Migration and Verify

```bash
# Run the migration
supabase db push

# Or if using local development
supabase migration up

# Test RLS status
# In Supabase SQL Editor, run:
SELECT * FROM check_rls_status();

# Verify policies are working by testing with different users
```

## Deliverables

- [ ] RLS enabled on all user-related tables
- [ ] Complete profile RLS policies
- [ ] Work experience and education RLS policies
- [ ] Posts and comments RLS policies
- [ ] Connections and requests RLS policies
- [ ] Messages RLS policies
- [ ] Notifications RLS policies
- [ ] Admin override policies
- [ ] RLS testing functions
- [ ] Migration file created and applied
- [ ] RLS verification completed

## Acceptance Criteria

1. **Security Requirements:**
   - Users can only access their own private data
   - Public data is accessible according to privacy settings
   - Connected users can access shared data based on privacy rules
   - Admin users can access all data when needed

2. **Data Protection:**
   - No user can access another user's private information
   - Work experience and education follow privacy settings
   - Messages are only visible to participants
   - Notifications are user-specific

3. **Connection-Based Access:**
   - Connected users can see shared content
   - Connection requests work bidirectionally
   - Message sending requires existing connection
   - Privacy settings are respected

4. **Testing and Verification:**
   - All tables have RLS enabled
   - Policy counts match expected numbers
   - No unauthorized data access possible
   - Performance impact is acceptable

## Security Testing Commands

```sql
-- Test as different users to verify RLS
SET ROLE authenticated;
-- Set auth.uid() to test user ID
-- Try accessing different data to verify policies

-- Check policy details
SELECT schemaname, tablename, policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE tablename IN (
  'profiles', 'work_experience', 'education', 'posts',
  'comments', 'connections', 'messages', 'notifications'
)
ORDER BY tablename, policyname;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN (
  'profiles', 'work_experience', 'education', 'posts',
  'comments', 'connections', 'messages', 'notifications'
);
```

## Questions or Issues?

Contact:
- **Project Manager:** Daniel
- **Database Lead:** [TBD]
- **Security Consultant:** [TBD]
- **Backend Lead:** [For integration testing]

## Next Steps After Completion

1. Test RLS policies with different user scenarios
2. Performance testing with large datasets
3. Security audit of all policies
4. Documentation for development team
5. Integration with frontend privacy controls
6. Monitoring setup for policy violations

---

**Status Updates:**
- [ ] Started: _________
- [ ] RLS Enabled on Tables: _________
- [ ] Profile Policies: _________
- [ ] Work/Education Policies: _________
- [ ] Posts/Comments Policies: _________
- [ ] Connection Policies: _________
- [ ] Message Policies: _________
- [ ] Notification Policies: _________
- [ ] Testing Functions: _________
- [ ] Migration Applied: _________
- [ ] Security Testing: _________
- [ ] Completed: _________