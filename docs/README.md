# SM1 (B2B) Documentation

This directory contains comprehensive documentation for backend and database teams working on the SM1 (B2B) professional networking platform.

## Documentation Files

### For Database Team

**[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**
- Complete database schema with all required tables
- Column definitions and data types
- Indexes and foreign key relationships
- Row Level Security (RLS) policies
- Database triggers and functions
- Migration guidelines

### For Backend Team

**[API_REQUIREMENTS.md](./API_REQUIREMENTS.md)**
- All API endpoint specifications
- Request/response formats
- Authentication flows
- Query parameters
- Error handling
- Rate limiting requirements

**[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)**
- Step-by-step integration instructions
- Authentication implementation
- Critical endpoint priorities
- Real-time features setup
- Security best practices
- Testing procedures
- Common issues and solutions

### For Both Teams

**[FRONTEND_DATA_MODELS.md](./FRONTEND_DATA_MODELS.md)**
- TypeScript interfaces for all data models
- State management patterns
- TanStack Query usage
- Real-time subscription examples
- Component props patterns
- Validation schemas

## Quick Start

### Database Team

1. Read [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
2. Set up PostgreSQL database via Supabase
3. Run migrations in order
4. Enable RLS on all tables
5. Test with sample data
6. Review [FRONTEND_DATA_MODELS.md](./FRONTEND_DATA_MODELS.md) for data requirements

### Backend Team

1. Read [API_REQUIREMENTS.md](./API_REQUIREMENTS.md)
2. Review [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
3. Set up Supabase authentication
4. Implement critical endpoints (see priorities)
5. Test with frontend application
6. Review [FRONTEND_DATA_MODELS.md](./FRONTEND_DATA_MODELS.md) for expected responses

## Architecture Overview

```
┌─────────────┐
│   Frontend  │  React + TypeScript + Vite
│  (Port 8080)│  TanStack Query for state
└──────┬──────┘
       │
       │ REST API + Realtime
       │
┌──────▼──────┐
│   Supabase  │  PostgreSQL + Auth + Storage
│   Backend   │  Row Level Security
└──────┬──────┘
       │
       │
┌──────▼──────┐
│  PostgreSQL │  Primary database
│   Database  │  with Realtime enabled
└─────────────┘
```

## Feature Implementation Priority

### Phase 1 - Critical (Week 1)
1. User authentication (email, phone, OAuth)
2. User profiles (CRUD operations)
3. Posts feed (For You / Following)
4. Post creation (text, images)
5. Connections system

### Phase 2 - Important (Week 2)
6. Messages and conversations
7. Notifications
8. Post interactions (like, comment, repost)
9. Poll creation and voting
10. Profile editing with work history

### Phase 3 - Enhanced (Week 3)
11. Search functionality
12. Login activity tracking
13. Security settings
14. Video posts
15. Scheduled posts

## Technology Stack

- **Frontend**: React 18.3, TypeScript, Vite 5.4
- **UI**: Tailwind CSS, shadcn/ui components
- **State**: TanStack Query v5
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Authentication**: JWT via Supabase Auth
- **File Storage**: Supabase Storage

## Data Flow Examples

### Creating a Post

```
Frontend                Backend                Database
   │                       │                      │
   │  POST /posts          │                      │
   ├──────────────────────>│                      │
   │                       │  INSERT INTO posts   │
   │                       ├─────────────────────>│
   │                       │                      │
   │                       │  Parse hashtags      │
   │                       ├─────────────────────>│
   │                       │  INSERT INTO post_tags
   │                       │                      │
   │                       │  Create notifications│
   │                       ├─────────────────────>│
   │                       │                      │
   │  { post object }      │                      │
   │<──────────────────────┤                      │
   │                       │                      │
   │  Invalidate cache     │                      │
   │  Refetch feed         │                      │
```

### Real-time Messages

```
Frontend A              Backend                 Frontend B
   │                       │                        │
   │  Send message         │                        │
   ├──────────────────────>│                        │
   │                       │  INSERT INTO messages  │
   │                       │                        │
   │                       │  Realtime broadcast    │
   │                       ├───────────────────────>│
   │                       │                        │
   │  Message sent         │  New message received  │
   │<──────────────────────┤                        │
```

## Testing

### Sample Test Data

Create these test accounts:

```sql
-- User 1: Professional
INSERT INTO users (email, first_name, last_name, username, account_type)
VALUES ('john@example.com', 'John', 'Doe', 'johndoe', 'professional');

-- User 2: Business
INSERT INTO users (email, first_name, last_name, username, account_type)
VALUES ('jane@example.com', 'Jane', 'Smith', 'janesmith', 'business');

-- Connection between users
INSERT INTO connections (requester_id, receiver_id, status)
VALUES ('{user1_id}', '{user2_id}', 'accepted');

-- Sample posts
INSERT INTO posts (user_id, content, visibility)
VALUES ('{user1_id}', 'Just launched our new product! #excited', 'public');
```

### Test Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get feed
curl http://localhost:3000/posts?feed=for-you \
  -H "Authorization: Bearer {token}"
```

## Security Requirements

1. **Authentication**: All endpoints except `/auth/*` and `/health` require JWT
2. **Row Level Security**: Enable on ALL tables in production
3. **Input Validation**: Sanitize all user inputs
4. **Rate Limiting**: Implement per endpoint (see API_REQUIREMENTS.md)
5. **HTTPS Only**: Force HTTPS in production
6. **CORS**: Whitelist frontend domains only

## Performance Targets

- API Response Time: < 500ms (p95)
- Feed Loading: < 1s
- Database Queries: < 100ms (p95)
- Realtime Latency: < 200ms
- Concurrent Users: 10,000+
- Posts per second: 100+

## Monitoring & Logging

Required logs:
- Authentication attempts (success/failure)
- API requests (endpoint, user, response time)
- Database query performance
- Error stack traces
- File uploads
- Rate limit violations

Recommended tools:
- Supabase Dashboard for database monitoring
- Sentry for error tracking
- DataDog/New Relic for APM
- CloudWatch/Stackdriver for logs

## Deployment

### Environment Variables

```env
# Backend
DATABASE_URL=postgresql://...
SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_KEY=...
JWT_SECRET=...
STORAGE_BUCKET=sm1-files

# Frontend
VITE_SUPABASE_URL=https://....supabase.co
VITE_SUPABASE_ANON_KEY=...
```

### Database Migrations

```bash
# Run migrations
supabase db push

# Reset database (development only!)
supabase db reset

# Create new migration
supabase migration new migration_name
```

## Support & Contact

- Technical Questions: Open GitHub issue
- Database Schema: See DATABASE_SCHEMA.md
- API Endpoints: See API_REQUIREMENTS.md
- Integration Help: See INTEGRATION_GUIDE.md

## Changelog

- **v1.0.0** (2026-01-11): Initial documentation release
  - Complete database schema
  - API requirements
  - Integration guide
  - Data models

## License

Proprietary - SM1 (B2B) Platform
