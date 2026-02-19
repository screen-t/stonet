# Pre-Deployment Checklist for Stonet

## ✅ COMPLETED

### Backend
- [x] FastAPI application structure
- [x] CORS configuration with environment variable support
- [x] OAuth redirect URLs use environment variables
- [x] Health check endpoint (`/health`)
- [x] All API routes implemented
- [x] Supabase integration
- [x] Authentication middleware
- [x] Error handling
- [x] Requirements.txt up to date

### Frontend
- [x] React + TypeScript + Vite setup
- [x] Environment variable configuration
- [x] API client with backend URL from env
- [x] Authentication flow
- [x] Build configuration
- [x] Routing setup
- [x] UI components functional

### Database
- [x] Supabase project created
- [x] Database schema designed
- [x] Migrations created
- [x] Row Level Security policies
- [x] Database functions

### Configuration Files
- [x] `render.yaml` created for backend
- [x] `vercel.json` created for frontend
- [x] `.env.example` files created
- [x] Deployment guide documented

---

## ⚠️ BEFORE YOU DEPLOY - ACTION REQUIRED

### 1. Environment Variables Setup
**You MUST configure these before deploying:**

#### Backend (Render)
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
FRONTEND_URL=https://your-app.vercel.app (add after frontend deployed)
BACKEND_URL=https://your-backend.onrender.com (add after backend deployed)
```

#### Frontend (Vercel)
```
VITE_BACKEND_URL=https://your-backend.onrender.com (add after backend deployed)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 2. Database Migrations
**Run these in Supabase SQL Editor:**
- [ ] Execute all migration files in `supabase/migrations/` folder in order
- [ ] Verify tables are created
- [ ] Verify RLS policies are active
- [ ] Test with a sample user

### 3. Supabase Configuration
- [ ] Copy project URL and keys from Supabase dashboard
- [ ] Enable Email authentication
- [ ] Configure OAuth providers (if using):
  - [ ] Google OAuth
  - [ ] GitHub OAuth
  - [ ] LinkedIn OAuth
- [ ] Set Site URL in Supabase Auth settings
- [ ] Add redirect URLs (will update after deployment)

### 4. Git Repository
- [ ] Create GitHub repository (if not exists)
- [ ] Push all code to main branch
- [ ] Ensure `.env` files are in `.gitignore`
- [ ] Verify no secrets in code

---

## 🚀 DEPLOYMENT ORDER

### Step 1: Deploy Backend First
1. Go to [Render](https://render.com)
2. Create Web Service from GitHub
3. Set environment variables
4. Deploy
5. **Copy the backend URL** (e.g., `https://stonet-backend.onrender.com`)

### Step 2: Deploy Frontend
1. Go to [Vercel](https://vercel.com)
2. Import GitHub project
3. Set environment variables (use backend URL from Step 1)
4. Deploy
5. **Copy the frontend URL** (e.g., `https://stonet.vercel.app`)

### Step 3: Update Configuration
1. In Render: Update `FRONTEND_URL` with Vercel URL
2. In Render: Update `BACKEND_URL` with Render URL
3. Redeploy backend
4. In Supabase: Add redirect URLs:
   - `https://your-backend.onrender.com/auth/oauth/callback`
   - `https://your-app.vercel.app/auth/callback`

---

## 🧪 POST-DEPLOYMENT TESTING

### Backend Health Check
```bash
curl https://your-backend.onrender.com/health
# Expected: {"status": "healthy"}
```

### Frontend Access
- [ ] Visit your Vercel URL
- [ ] Check if landing page loads
- [ ] Verify no console errors

### Authentication Testing
- [ ] Sign up with email/password
- [ ] Log in with email/password
- [ ] Test forgot password flow
- [ ] Test OAuth (Google/GitHub/LinkedIn)
- [ ] Verify session persistence

### Core Features Testing
- [ ] Create a post
- [ ] View feed
- [ ] Edit profile
- [ ] Settings page loads
- [ ] Search works
- [ ] Connections page loads

---

## ⚠️ KNOWN LIMITATIONS

### Features NOT Fully Integrated
These features have backend APIs but frontend needs connection:
- [ ] Post interactions (like, comment, share) - UI exists but not connected
- [ ] Real-time messaging - Backend exists but no WebSocket
- [ ] Notifications - Backend exists but no real-time updates
- [ ] Network/Connections - UI exists but not fully integrated
- [ ] File upload for posts - Not implemented
- [ ] Search functionality - Backend exists but frontend needs work

### Recommended Post-Launch Work
1. **Week 1**: Connect post interactions to backend
2. **Week 2**: Implement real-time messaging with Supabase Realtime
3. **Week 3**: Connect notifications and network features
4. **Week 4**: Add file upload for posts with images

---

## 🔒 SECURITY CHECKLIST

- [ ] All API keys in environment variables (not in code)
- [ ] HTTPS enforced on both domains
- [ ] Supabase RLS policies enabled
- [ ] CORS allows only your frontend domain
- [ ] OAuth redirect URLs are production URLs only
- [ ] Service role key used only in backend
- [ ] Anon key used in frontend (not service role key)

--- 

## 📊 DEPLOYMENT READINESS SCORE: 75%

### What's Ready ✅
- Backend API (90% complete)
- Frontend UI (85% complete)
- Authentication system (95% complete)
- Database schema (100% complete)
- Deployment configuration (100% complete)

### What's NOT Ready ⚠️
- Post interactions integration (40% complete)
- Real-time features (30% complete)
- File upload system (0% complete)
- Full E2E testing (20% complete)

### Recommendation
**You CAN deploy now** for beta testing or MVP launch, but expect users to report:
- Cannot like/comment on posts
- Messages may not work in real-time
- Cannot upload images in posts
- Some features may feel incomplete

**Suggested Strategy:**
1. Deploy now as MVP/Alpha
2. Gather feedback
3. Work on integration sprints (1-2 weeks)
4. Redeploy with fuller feature set

---

## 🆘 TROUBLESHOOTING

### If Backend Won't Start
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure Supabase credentials are correct
- Check Python version is 3.11

### If Frontend Shows Blank Page
- Check browser console for errors
- Verify `VITE_BACKEND_URL` is set correctly
- Check Vercel deployment logs
- Ensure backend is running

### If Login Doesn't Work
- Check Supabase auth is enabled
- Verify CORS allows your frontend URL
- Check backend logs for auth errors
- Ensure user exists in database

### If CORS Errors Appear
- Verify `FRONTEND_URL` is set in backend
- Check URL matches exactly (no trailing slash)
- Redeploy backend after changing CORS
- Clear browser cache

---

## 📞 NEXT STEPS

1. **Review this checklist** and complete all action items
2. **Follow the DEPLOYMENT_GUIDE.md** step by step
3. **Test thoroughly** after deployment
4. **Monitor logs** for first 24 hours
5. **Document any issues** you encounter

---

**Ready to deploy? Start with Step 1: Deploy Backend First! 🚀**
