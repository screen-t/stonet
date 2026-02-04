# TASK: DB-001 - Database Schema Design

**Assigned To:** Database Administrator  
**Priority:** CRITICAL  
**Estimate:** 8 hours  
**Deadline:** February 7, 2026  
**Status:** Not Started  
**Dependencies:** None  
**Created:** February 5, 2026

---

## Objective

Design a comprehensive database schema for the professional networking platform, including all necessary tables, relationships, indexes, and constraints to support Phase 1 features.

## Prerequisites

- Understanding of PostgreSQL database design
- Knowledge of Supabase-specific features
- Familiarity with social media platform requirements
- Understanding of data normalization principles

## Instructions

### Step 1: Core User Management Tables

```sql
-- Users table (managed by Supabase Auth)
-- This is automatically created by Supabase, but we reference it

-- User profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    cover_image_url TEXT,
    location TEXT,
    website TEXT,
    date_of_birth DATE,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    
    -- Privacy settings as JSONB
    privacy_settings JSONB DEFAULT '{
        "profile_visibility": "public",
        "work_experience": "public", 
        "education": "public",
        "contact_info": "connections"
    }'::jsonb,
    
    -- Verification status
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    profile_complete BOOLEAN DEFAULT false,
    
    -- Activity tracking
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Step 2: Professional Background Tables

```sql
-- Work experience table
CREATE TABLE work_experience (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    position_title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Education table
CREATE TABLE education (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT,
    level TEXT NOT NULL CHECK (level IN (
        'high_school', 'associate', 'bachelor', 
        'master', 'doctorate', 'certificate', 'other'
    )),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    gpa DECIMAL(3,2),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Step 3: Social Features Tables

```sql
-- Posts table
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[],
    post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'poll')),
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
    
    -- Engagement metrics
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- Poll data (if applicable)
    poll_options JSONB,
    poll_expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES comments(id), -- For nested comments
    
    likes_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Post likes table
CREATE TABLE post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(post_id, user_id)
);

-- Comment likes table
CREATE TABLE comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(comment_id, user_id)
);
```

### Step 4: Connection System Tables

```sql
-- Connections table (bidirectional relationships)
CREATE TABLE connections (
    id SERIAL PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'accepted' CHECK (status IN ('accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id != user2_id),
    CHECK (user1_id < user2_id) -- Ensure consistent ordering
);

-- Connection requests table
CREATE TABLE connection_requests (
    id SERIAL PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(sender_id, recipient_id),
    CHECK (sender_id != recipient_id)
);
```

### Step 5: Messaging System Tables

```sql
-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[],
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    
    -- Message status
    read_at TIMESTAMP WITH TIME ZONE,
    deleted_by_sender BOOLEAN DEFAULT false,
    deleted_by_recipient BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CHECK (sender_id != recipient_id)
);
```

### Step 6: Notification System Tables

```sql
-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'connection_request', 'connection_accepted', 'post_like', 
        'post_comment', 'comment_like', 'message', 'system'
    )),
    title TEXT NOT NULL,
    content TEXT,
    
    -- Reference to related entities
    related_user_id UUID REFERENCES profiles(id),
    related_post_id INTEGER REFERENCES posts(id),
    related_comment_id INTEGER REFERENCES comments(id),
    related_message_id INTEGER REFERENCES messages(id),
    
    -- Notification metadata
    data JSONB,
    
    -- Status tracking
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Step 7: Create Indexes for Performance

```sql
-- Profile indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_last_active ON profiles(last_active_at);

-- Work experience indexes
CREATE INDEX idx_work_experience_user_id ON work_experience(user_id);
CREATE INDEX idx_work_experience_dates ON work_experience(start_date, end_date);

-- Education indexes
CREATE INDEX idx_education_user_id ON education(user_id);
CREATE INDEX idx_education_dates ON education(start_date, end_date);

-- Post indexes
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_type ON posts(post_type);

-- Comment indexes
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- Like indexes
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);

-- Connection indexes
CREATE INDEX idx_connections_user1_id ON connections(user1_id);
CREATE INDEX idx_connections_user2_id ON connections(user2_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connection_requests_sender ON connection_requests(sender_id);
CREATE INDEX idx_connection_requests_recipient ON connection_requests(recipient_id);
CREATE INDEX idx_connection_requests_status ON connection_requests(status);

-- Message indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_read_at ON messages(read_at);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
```

### Step 8: Create Triggers for Updated_at

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_experience_updated_at 
    BEFORE UPDATE ON work_experience 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at 
    BEFORE UPDATE ON education 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connection_requests_updated_at 
    BEFORE UPDATE ON connection_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Deliverables

- [ ] Complete schema design document
- [ ] Table definitions with all constraints
- [ ] Index specifications for performance
- [ ] Trigger implementations
- [ ] Relationship diagram
- [ ] Schema validation scripts

## Acceptance Criteria

1. **Schema Completeness:**
   - All Phase 1 features supported by schema
   - All relationships properly defined
   - Appropriate constraints and validations

2. **Performance Optimization:**
   - Indexes created for common query patterns
   - Foreign keys properly defined
   - No redundant or missing indexes

3. **Data Integrity:**
   - Proper constraints prevent invalid data
   - Cascading deletes configured appropriately
   - Check constraints validate enum values

4. **Documentation:**
   - All tables documented
   - Relationships clearly defined
   - Business rules captured in constraints

## Schema Validation Commands

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check indexes
SELECT indexname, tablename, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public';

-- Check constraints
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace;

-- Check triggers
SELECT trigger_name, event_object_table, action_statement 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## Questions or Issues?

Contact:
- **Project Manager:** Daniel
- **Database Lead:** [TBD]
- **Technical Lead:** [TBD]

## Next Steps After Completion

1. Review schema with development team
2. Create DB-002 migration files
3. Set up test database with schema
4. Begin DB-003 RLS policy implementation
5. Share schema documentation with backend team

---

**Status Updates:**
- [ ] Started: _________
- [ ] Core Tables Designed: _________
- [ ] Indexes Created: _________
- [ ] Triggers Implemented: _________
- [ ] Schema Validated: _________
- [ ] Documentation Complete: _________
- [ ] Team Review Complete: _________
- [ ] Completed: _________