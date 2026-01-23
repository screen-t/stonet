-- Updated: January 23, 2026
-- Complete schema implementation for Stonet Phase 1
-- Based on: docs/DATABASE_SCHEMA.md

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- ENUM TYPES
-- =========================
CREATE TYPE user_role AS ENUM ('founder','developer','consultant','investor','other');
CREATE TYPE post_type AS ENUM ('insight','question','case_study','hiring');
CREATE TYPE visibility_type AS ENUM ('public','connections');
CREATE TYPE connection_status AS ENUM ('pending','accepted','declined','blocked');
CREATE TYPE media_type AS ENUM ('image','video','link');
CREATE TYPE notification_type AS ENUM ('like','comment','connection','message','system');

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    username TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    additional_name TEXT,
    pronouns TEXT,
    headline TEXT,
    bio TEXT,
    birthdate DATE,
    website TEXT,
    location TEXT,
    postal_code TEXT,
    address TEXT,
    current_position TEXT,
    current_company TEXT,
    industry TEXT,
    account_type user_role,
    avatar_url TEXT,
    cover_url TEXT,

    email_visible BOOLEAN DEFAULT FALSE,
    phone_visible BOOLEAN DEFAULT FALSE,
    birthday_visible BOOLEAN DEFAULT FALSE,
    location_visible BOOLEAN DEFAULT TRUE,
    work_history_visible BOOLEAN DEFAULT TRUE,
    connections_visible BOOLEAN DEFAULT TRUE,
    activity_status_visible BOOLEAN DEFAULT TRUE,

    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- WORK EXPERIENCE
-- =========================
CREATE TABLE work_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company TEXT,
    position TEXT,
    start_date DATE,
    end_date DATE,
    description TEXT
);

-- =========================
-- EDUCATION
-- =========================
CREATE TABLE education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    institution TEXT,
    degree TEXT,
    field_of_study TEXT,
    start_date DATE,
    end_date DATE
);

-- =========================
-- USER SKILLS
-- =========================
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill TEXT,
    endorsement_count INTEGER DEFAULT 0
);

-- =========================
-- POSTS
-- =========================
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    post_type post_type,
    visibility visibility_type,
    scheduled_at TIMESTAMP,
    is_published BOOLEAN DEFAULT TRUE,
    is_draft BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    repost_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    edited_at TIMESTAMP
);

-- =========================
-- POST MEDIA
-- =========================
CREATE TABLE post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    media_type media_type,
    url TEXT NOT NULL,
    thumbnail_url TEXT
);

-- =========================
-- POLLS
-- =========================
CREATE TABLE post_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    question TEXT,
    ends_at TIMESTAMP
);

CREATE TABLE post_poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES post_polls(id) ON DELETE CASCADE,
    option_text TEXT,
    vote_count INTEGER DEFAULT 0,
    display_order INTEGER
);

CREATE TABLE post_poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES post_polls(id) ON DELETE CASCADE,
    option_id UUID REFERENCES post_poll_options(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (poll_id, user_id)
);

-- =========================
-- ENGAGEMENT
-- =========================
CREATE TABLE post_likes (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id),
    content TEXT,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reposts (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE saved_posts (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- =========================
-- CONNECTIONS
-- =========================
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status connection_status,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (requester_id, receiver_id)
);

-- =========================
-- MESSAGING
-- =========================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type,
    title TEXT,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- LOGIN ACTIVITY
-- =========================
CREATE TABLE login_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device TEXT,
    browser TEXT,
    location TEXT,
    ip_address TEXT,
    status TEXT,
    session_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
