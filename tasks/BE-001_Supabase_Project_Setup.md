# TASK: BE-001 - Supabase Project Setup

**Assigned To:** Backend Lead  
**Priority:** CRITICAL  
**Estimate:** 4 hours  
**Deadline:** Jan 21, 2026 (OVERDUE - Complete ASAP)  
**Status:** Not Started  
**Created:** Jan 23, 2026

---

## Objective

Set up Supabase project for staging environment (free tier), configure API access, and provide team with credentials. Local development will use Supabase CLI. Production environment will be created closer to launch.

## Cost-Effective Strategy

**3 Environments (No Cost for Phase 1):**
1. **Local** - Each developer uses Supabase CLI (free, runs on localhost)
2. **Staging** - Shared Supabase project for testing (free tier)
3. **Production** - Will create in Phase 4 before launch

This approach keeps costs at $0 during development!

## Prerequisites

- Supabase account created
- Admin access to Supabase organization
- Team member list ready

## Instructions

### Step 1: Create Staging Supabase Project

**Staging Environment (Free Tier):**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Name: `stonet-staging`
   - Database Password: Generate strong password (save in password manager)
   - Region: Choose closest to team or recommended region
   - Pricing: **Free tier** (0 cost)
   - Wait for project to initialize (~2 minutes)

**Note:** Production project will be created in Phase 4 (before launch).

### Step 2: Configure Database

For the staging project:
1. Go to Database → Settings
2. Enable "Enable database webhooks" (for realtime features)
3. Note connection strings (will need later)

### Step 3: Setup Local Development (Supabase CLI)

**Install Supabase CLI:**
```bash
# Windows (PowerShell)
scoop install supabase

# OR use npm
npm install -g supabase
```

**Initialize Local Project:**
```bash
cd c:\Users\HP\Desktop\Collabs\b2b-network
supabase init
```

**Start Local Supabase:**
```bash
supabase start
```

This gives developers:
- Local PostgreSQL database
- Local API (http://localhost:54321)
- Local Studio UI (http://localhost:54323)
- **Completely free!**

### Step 4: Get API Credentials

For the staging project, collect:
1. Go to Settings → API
2. Copy and save securely:
   - `Project URL` (e.g., https://xxxxx.supabase.co)
   - `anon public` key
   - `service_role` key (KEEP SECRET!)

### Step 5: Enable Authentication Providers

For staging project:
1. Go to Authentication → Providers
2. Enable:
   - ✅ Email (default - already enabled)
   - ✅ Google OAuth
   - ✅ GitHub OAuth
   - ✅ LinkedIn OAuth (if available)
   - ✅ Phone (Twilio integration)

3. **For OAuth providers**, you'll need to:
   - Create OAuth apps in Google, GitHub, LinkedIn
   - Add redirect URLs: `https://[your-project-ref].supabase.co/auth/v1/callback`
   - Save Client IDs and Secrets in Supabase settings

### Step 6: Configure Storage Buckets

Create buckets for file uploads:
1. Go to Storage
2. Create buckets:
   - `avatars` (Public bucket)
   - `covers` (Public bucket)
   - `post-media` (Public bucket)
   - `documents` (Private bucket)

### Step 7: Create Environment Files

Create `.env` files for the team:

**For Local Development (`frontend/.env.local`):**
```env
# When running supabase start, use these:
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGc... # From supabase start output
```

**For Staging (`frontend/.env.staging`):**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**For Backend/Database Team:**
```env
# Local
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Staging
SUPABASE_URL_STAGING=https://xxxxx.supabase.co
SUPABASE_ANON_KEY_STAGING=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY_STAGING=eyJhbGc... # KEEP SECRET!
DATABASE_URL_STAGING=postgresql://...
```

### Step 8: Grant Team Access

1. Go to Settings → Team
2. Invite team members:
   - Database Administrator (Owner/Admin)
   - Backend Developers (Developer)
   - Frontend Lead (Developer)
   - DevOps Engineer (Admin)

### Step 9: Documentation

Create a document with:
- Project URLs
- API keys (encrypted/password-protected)
- Storage bucket names
- Team access instructions
- OAuth callback URLs

## Deliverables

- [ ] Staging Supabase project created and configured (FREE tier)
- [ ] Supabase CLI installed and documented for local development
- [ ] Authentication providers enabled (Email, OAuth, Phone)
- [ ] Storage buckets created
- [ ] API credentials documented securely
- [ ] Environment files created for team
- [ ] Team members granted access
- [ ] Setup documentation shared with team

## Acceptance Criteria

1. Staging Supabase project is accessible (free tier)
2. All authentication providers configured
3. Storage buckets created and accessible
4. API keys securely documented
5. All team members have appropriate access
6. Environment files provided to frontend/backend teams
7. Database team can connect and run migrations
8. Local development works with Supabase CLI
9. **Total cost: $0** (free tier only)

## Environment Variables Needed

### Local (Free - CLI):
```
SUPABASE_URL: http://localhost:54321
SUPABASE_ANON_KEY: [from supabase start output]
SUPABASE_SERVICE_ROLE_KEY: [from supabase start output]
```

### Staging (Free Tier):
```
SUPABASE_URL: [staging project URL]
SUPABASE_ANON_KEY: [staging anon key]
SUPABASE_SERVICE_ROLE_KEY: [staging service role key]
```

## Security Notes

⚠️ **CRITICAL:**
- Never commit `.env` files to Git
- Store service_role keys in password manager
- Use different passwords for dev and staging
- Rotate keys if accidentally exposed
- Limit service_role key usage (backend only)

**Local Development:**
```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db push

# Access local Studio UI
# Open: http://localhost:54323
```

**Staging:**
1. Database team can connect via connection string
2. Frontend can initialize Supabase client
3. Can create test user via email auth
4. Storage buckets accessible

## Cost Breakdown (Phase 1)

- **Local Development:** $0 (Supabase CLI is free)
- **Staging:** $0 (Free tier - up to 500MB database, 1GB file storage)
- **Production:** Will set up in Phase 4 (estimate $25/month when needed)
- **Total Current Cost:** $0 ✅pabase client
3. CanSupabase CLI Setup Documented: _________
- [ ] Staging Project Created (FREE): _________
- [ ] Auth Configured: _________
- [ ] Team Access Granted: _________
- [ ] Local Dev Tested: _________
- [ ] Completed: _________
- [ ] Team Notified: _________
- [ ] **Confirmed Cost: $0**
- **Project Manager:** Daniel
- **Technical Lead:** [TBD]
- **Database Administrator:** [Team member handling migrations]

## Next Steps After Completion

1. Notify database team to apply migrations
2. Provide frontend team with environment variables
3. Backend team can start API development
4. Update project documentation with setup info

---

**Status Updates:**
- [ ] Started: _________
- [ ] Dev Project Created: _________
- [ ] Staging Project Created: _________
- [ ] Auth Configured: _________
- [ ] Team Access Granted: _________
- [ ] Completed: _________
- [ ] Team Notified: _________
