# TASK: DB-002A - Update Database Migration

**Assigned To:** Database Administrator  
**Priority:** CRITICAL (Blocking backend team)  
**Estimate:** 4-6 hours  
**Deadline:** TODAY (Jan 23, 2026) - End of day  
**Status:** Not Started  
**Created:** Jan 23, 2026

---

## Objective

Update the existing migration file `supabase/migrations/20260106_init.sql` to match the complete database schema requirements documented in `docs/DATABASE_SCHEMA.md`.

## Current Problem

The migration file is incomplete. It's missing critical tables and fields needed for Phase 1 features (authentication, profiles, posts, connections).

## Instructions

### Step 1: Review Reference Document
- Open `docs/DATABASE_SCHEMA.md` 
- This contains the COMPLETE schema we need
- Familiarize yourself with all tables and relationships

### Step 2: Update Migration File
- Open `supabase/migrations/20260106_init.sql`
- Replace entire content with complete schema from DATABASE_SCHEMA.md
- Ensure ALL tables and fields are included

### Step 3: Critical Tables to Include

#### User & Profile Tables:
- ✅ Enhanced `users` table with:
  - Basic info: first_name, last_name, additional_name, pronouns
  - Contact: email, phone, website
  - Profile: headline, bio, birthdate, location, postal_code, address
  - Professional: current_position, current_company, industry
  - Settings: account_type, avatar_url, cover_url
  - Privacy settings: email_visible, phone_visible, birthday_visible, location_visible, work_history_visible, connections_visible, activity_status_visible
  - Metadata: is_verified, is_active, created_at, updated_at
- ✅ `work_experience` table (company, position, dates, description)
- ✅ `education` table (institution, degree, field_of_study, dates)
- ✅ `user_skills` table (skill, endorsement_count)

#### Post & Content Tables:
- ✅ Enhanced `posts` table with:
  - Content: content, post_type, visibility
  - Scheduling: scheduled_at
  - Engagement: like_count, comment_count, repost_count, share_count
  - Status: is_published, is_draft, edited_at
- ✅ `post_media` table (media_type, url, thumbnail_url)
- ✅ `post_polls` table (question, ends_at)
- ✅ `post_poll_options` table (option_text, vote_count, display_order)
- ✅ `post_poll_votes` table (poll_id, option_id, user_id)
- ✅ `post_tags` table (tag)

#### Engagement Tables:
- ✅ Enhanced `comments` table (parent_comment_id, like_count)
- ✅ `post_likes` table
- ✅ `reposts` table
- ✅ `saved_posts` table

#### Connection Tables:
- ✅ Enhanced `connections` table with:
  - status: 'pending', 'accepted', 'declined', 'blocked'
  - timestamps: created_at, updated_at

#### Messaging Tables:
- ✅ `conversations` table
- ✅ `conversation_participants` table
- ✅ `messages` table (content, is_read)

#### System Tables:
- ✅ `notifications` table (type, title, message, link, is_read)
- ✅ `login_activity` table (device, browser, location, ip_address, status, session_id, is_active)

### Step 4: Remove These Tables (Not in Scope)
- ❌ `companies` table
- ❌ `company_members` table
- ❌ `follows` table (we use `connections` instead)

### Step 5: Add All Indexes

Ensure all CREATE INDEX statements from DATABASE_SCHEMA.md are included:
- Users indexes (username, email)
- Posts indexes (user_id, created_at, scheduled_at)
- Engagement indexes (post_id, user_id)
- Connection indexes (requester_id, receiver_id, status)
- Message indexes (conversation_id, sender_id)
- Notification indexes (user_id, unread)
- And all others from the schema doc

### Step 6: Test Locally

```bash
cd supabase
supabase db reset
```

Verify:
- No errors during migration
- All tables created successfully
- All indexes in place

### Step 7: Document Changes

Add a comment at the top of the migration file:
```sql
-- Updated: January 23, 2026
-- Complete schema implementation for Stonet Phase 1
-- Based on: docs/DATABASE_SCHEMA.md
```

## Deliverables

- [ ] Updated `supabase/migrations/20260106_init.sql` file
- [ ] All tables from DATABASE_SCHEMA.md created
- [ ] All indexes added
- [ ] Companies/company_members tables removed
- [ ] Migration tested locally (no errors)
- [ ] Documentation comment added
- [ ] Team notified when complete

## Acceptance Criteria

1. Migration file runs without errors
2. All required tables from DATABASE_SCHEMA.md are created
3. All indexes are in place
4. No out-of-scope tables included
5. Can successfully reset local database: `supabase db reset`
6. Backend team notified (they are waiting on this)

## File Paths

```
File to update: supabase/migrations/20260106_init.sql
Reference doc:  docs/DATABASE_SCHEMA.md
```

## Why This is Critical

⚠️ **BLOCKING ISSUE:** Backend team cannot start authentication APIs until this is complete. This is blocking multiple team members and putting us behind schedule.

## Questions or Issues?

Contact immediately if blocked:
- **Project Manager:** Daniel
- **Technical Lead:** [TBD]

## Notes

- Focus on getting it correct, not fast
- Double-check all field names and types match DATABASE_SCHEMA.md
- Test the migration before marking complete
- This is foundation for entire project - accuracy is critical

---

**Status Updates:**
- [ ] Started: _________
- [ ] Completed: _________
- [ ] Tested: _________
- [ ] Team Notified: _________
