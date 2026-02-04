# TASK: BE-004 - OAuth Integration (Google, GitHub, LinkedIn)

**Assigned To:** Backend Developer  
**Priority:** HIGH  
**Estimate:** 16 hours  
**Deadline:** Feb 7, 2026  
**Status:** In Progress  
**Created:** Jan 31, 2026

---

## Objective

Implement complete OAuth authentication flow for Google, GitHub, and LinkedIn providers, including Supabase configuration, backend API endpoints, and frontend integration.

## Prerequisites

- Supabase project access (admin)
- Google Developer Console account
- GitHub Developer account  
- LinkedIn Developer account
- Backend authentication system (BE-003) completed
- Frontend authentication UI (FE-002) exists

---

## Instructions

### Phase 1: Supabase OAuth Configuration

#### Step 1: Google OAuth Setup

**Google Developer Console:**
1. Go to https://console.developers.google.com
2. Create new project or select existing: `stonet`
3. Enable Google+ API and Google Identity services
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Name: `Stonet - Google Auth`
   - Authorized origins: 
     - `https://your-project.supabase.co`
     - `http://localhost:8002` (development)
   - Authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret

**Supabase Configuration:**
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add Google Client ID: `your-google-client-id`
4. Add Google Client Secret: `your-google-client-secret`
5. Save configuration

#### Step 2: GitHub OAuth Setup

**GitHub Developer Settings:**
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Application details:
   - Application name: `Stonet`
   - Homepage URL: `http://localhost:3000` (or your domain)
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret

**Supabase Configuration:**
1. Authentication → Providers → GitHub
2. Enable GitHub provider
3. Add GitHub Client ID and Secret
4. Save configuration

#### Step 3: LinkedIn OAuth Setup

**LinkedIn Developer Portal:**
1. Go to https://www.linkedin.com/developers/apps
2. Create new app:
   - App name: `Stonet`
   - Company: Your company
   - Privacy policy: Your privacy URL
   - App logo: Upload logo
3. Products → Request "Sign In with LinkedIn using OpenID Connect"
4. Auth settings:
   - Redirect URLs: `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret

**Supabase Configuration:**
1. Authentication → Providers → LinkedIn (OIDC)
2. Enable LinkedIn provider  
3. Add LinkedIn Client ID and Secret
4. Save configuration

### Phase 2: Backend API Implementation

#### Step 4: Create OAuth Endpoints

**File:** `backend/app/routes/oauth.py`

```python
from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from app.lib.supabase import supabase
import os

router = APIRouter(prefix="/auth/oauth", tags=["OAuth"])

@router.get("/google")
async def google_oauth(request: Request):
    """Initiate Google OAuth flow"""
    try:
        redirect_url = f"{request.base_url}auth/callback"
        auth_url = supabase.auth.get_session_from_url({
            'provider': 'google',
            'options': {
                'redirect_to': redirect_url
            }
        })
        return {"url": auth_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth initiation failed: {str(e)}")

@router.get("/github") 
async def github_oauth(request: Request):
    """Initiate GitHub OAuth flow"""
    try:
        redirect_url = f"{request.base_url}auth/callback"
        auth_url = supabase.auth.get_session_from_url({
            'provider': 'github',
            'options': {
                'redirect_to': redirect_url
            }
        })
        return {"url": auth_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth initiation failed: {str(e)}")

@router.get("/linkedin")
async def linkedin_oauth(request: Request):
    """Initiate LinkedIn OAuth flow"""
    try:
        redirect_url = f"{request.base_url}auth/callback"
        auth_url = supabase.auth.get_session_from_url({
            'provider': 'linkedin',
            'options': {
                'redirect_to': redirect_url
            }
        })
        return {"url": auth_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth initiation failed: {str(e)}")

@router.get("/callback")
async def oauth_callback(request: Request):
    """Handle OAuth callback and create user session"""
    try:
        # Extract session from URL parameters
        session = supabase.auth.get_session_from_url(str(request.url))
        
        if not session or not session.user:
            raise HTTPException(status_code=400, detail="OAuth authentication failed")
        
        # Create or update user profile
        user_data = {
            "id": session.user.id,
            "email": session.user.email,
            "first_name": session.user.user_metadata.get("full_name", "").split(" ")[0] if session.user.user_metadata.get("full_name") else "",
            "last_name": " ".join(session.user.user_metadata.get("full_name", "").split(" ")[1:]) if session.user.user_metadata.get("full_name") else "",
            "avatar_url": session.user.user_metadata.get("avatar_url"),
            "is_active": True
        }
        
        # Upsert user profile
        supabase.table("users").upsert(user_data).execute()
        
        # Redirect to frontend with session
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(
            url=f"{frontend_url}/auth/callback?access_token={session.access_token}&refresh_token={session.refresh_token}"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth callback failed: {str(e)}")
```

#### Step 5: Update Main Application

**File:** `backend/app/main.py`

Add OAuth router to main application:

```python
from app.routes.oauth import router as oauth_router

# Include OAuth routes
app.include_router(oauth_router)
```

#### Step 6: Environment Variables

**File:** `backend/.env`

Add OAuth configuration:

```bash
# OAuth Configuration
FRONTEND_URL=http://localhost:3000
OAUTH_REDIRECT_URL=http://localhost:8002/auth/callback

# Supabase OAuth (optional - handled by Supabase)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GITHUB_CLIENT_ID=your-github-client-id  
# GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Phase 3: Frontend Integration

#### Step 7: Update Frontend API

**File:** `frontend/src/lib/api.ts`

Add OAuth endpoints:

```typescript
export const authApi = {
  // ... existing methods
  
  // OAuth methods
  googleOAuth: () => jsonFetch('/auth/oauth/google'),
  githubOAuth: () => jsonFetch('/auth/oauth/github'), 
  linkedinOAuth: () => jsonFetch('/auth/oauth/linkedin'),
}
```

#### Step 8: Connect OAuth Buttons

**File:** `frontend/src/pages/Login.tsx`

Update OAuth button handlers:

```typescript
const handleGoogleLogin = async () => {
  try {
    setLoading(true)
    const response = await authApi.googleOAuth()
    if (response.url) {
      window.location.href = response.url
    }
  } catch (err: any) {
    setError(err.message || 'Google login failed')
  } finally {
    setLoading(false)
  }
}

const handleGithubLogin = async () => {
  try {
    setLoading(true)
    const response = await authApi.githubOAuth()
    if (response.url) {
      window.location.href = response.url
    }
  } catch (err: any) {
    setError(err.message || 'GitHub login failed')
  } finally {
    setLoading(false)
  }
}

const handleLinkedinLogin = async () => {
  try {
    setLoading(true)  
    const response = await authApi.linkedinOAuth()
    if (response.url) {
      window.location.href = response.url
    }
  } catch (err: any) {
    setError(err.message || 'LinkedIn login failed')
  } finally {
    setLoading(false)
  }
}
```

#### Step 9: OAuth Callback Page

**File:** `frontend/src/pages/OAuthCallback.tsx`

Create OAuth callback handler:

```typescript
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  
  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      const error = searchParams.get('error')
      
      if (error) {
        navigate('/login?error=oauth_failed')
        return
      }
      
      if (accessToken && refreshToken) {
        // Set tokens and redirect to dashboard
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        
        // Fetch user data and set in auth context
        try {
          const user = await authApi.me(accessToken)
          // Update auth context with user data
          navigate('/feed')
        } catch (err) {
          navigate('/login?error=session_failed')
        }
      } else {
        navigate('/login?error=missing_tokens')
      }
    }
    
    handleCallback()
  }, [searchParams, navigate])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}
```

#### Step 10: Add OAuth Route

**File:** `frontend/src/App.tsx`

Add OAuth callback route:

```typescript
import OAuthCallback from './pages/OAuthCallback'

// Add to routes
<Route path="/auth/callback" element={<OAuthCallback />} />
```

### Phase 4: Testing & Validation

#### Step 11: End-to-End Testing

**Test Google OAuth:**
1. Click "Continue with Google" button
2. Verify redirect to Google consent screen
3. Grant permissions
4. Verify redirect back to application
5. Confirm user is logged in and profile created

**Test GitHub OAuth:**
1. Click "Continue with GitHub" button  
2. Verify GitHub authorization flow
3. Check user profile data mapping
4. Verify session creation

**Test LinkedIn OAuth:**
1. Click "Continue with LinkedIn" button
2. Complete LinkedIn authorization
3. Verify professional profile data import
4. Test session management

#### Step 12: Error Handling Testing

**Test scenarios:**
- User denies OAuth permissions
- Network failures during OAuth flow  
- Invalid OAuth configuration
- Callback URL mismatch
- Token exchange failures

---

## Deliverables

- [ ] Google OAuth fully configured in Supabase
- [ ] GitHub OAuth fully configured in Supabase  
- [ ] LinkedIn OAuth fully configured in Supabase
- [ ] Backend OAuth endpoints implemented (`/auth/oauth/*`)
- [ ] OAuth callback handler implemented
- [ ] Frontend OAuth buttons connected to backend
- [ ] OAuth callback page created and working
- [ ] User profile creation/update from OAuth data
- [ ] Session management for OAuth users
- [ ] Error handling for OAuth failures
- [ ] End-to-end testing completed
- [ ] Documentation updated

## Acceptance Criteria

1. **Google Authentication:**
   - ✅ User can click "Continue with Google"
   - ✅ Redirects to Google consent screen
   - ✅ Successfully creates user account
   - ✅ User is logged in after OAuth completion
   - ✅ Profile data imported from Google

2. **GitHub Authentication:**
   - ✅ User can authenticate with GitHub
   - ✅ GitHub profile data mapped correctly
   - ✅ Username and avatar imported
   - ✅ Session persists after login

3. **LinkedIn Authentication:**
   - ✅ Professional profile data imported
   - ✅ Current position and company mapped
   - ✅ LinkedIn avatar and headline imported
   - ✅ Business-appropriate data handling

4. **Error Handling:**
   - ✅ Clear error messages for OAuth failures
   - ✅ Graceful handling of denied permissions
   - ✅ Proper redirects on errors
   - ✅ No sensitive data exposed in errors

5. **Session Management:**
   - ✅ OAuth tokens stored securely
   - ✅ Refresh token handling
   - ✅ Session persistence across page reloads
   - ✅ Proper logout functionality

## Testing Checklist

**Development Environment:**
- [ ] All three OAuth providers working locally
- [ ] Callback URLs configured for localhost
- [ ] Error scenarios tested locally

**Staging Environment:**
- [ ] OAuth providers configured for staging domain
- [ ] SSL certificate working for HTTPS callbacks
- [ ] Production-like OAuth flow tested

**Cross-Browser Testing:**
- [ ] Chrome/Edge OAuth flow
- [ ] Firefox OAuth flow  
- [ ] Safari OAuth flow (if applicable)
- [ ] Mobile browser OAuth flow

**Security Testing:**
- [ ] CSRF protection in place
- [ ] State parameter validation
- [ ] Secure token storage
- [ ] No token leakage in URLs

## Environment Setup Requirements

**Development URLs:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8002`
- Supabase: `https://your-project.supabase.co`

**Staging URLs:**
- Frontend: `https://your-app-staging.vercel.app`
- Backend: `https://your-backend-staging.render.com`

**Production URLs:**
- Frontend: `https://your-app.com`
- Backend: `https://api.your-app.com`

## Common Issues & Solutions

**Issue 1: "redirect_uri_mismatch"**
- **Cause:** OAuth redirect URL doesn't match configured URL
- **Solution:** Ensure exact match in provider settings and Supabase config

**Issue 2: OAuth callback fails**
- **Cause:** Frontend callback route not configured
- **Solution:** Add `/auth/callback` route and OAuthCallback component

**Issue 3: User profile not created**
- **Cause:** Missing user data mapping from OAuth response
- **Solution:** Check OAuth response structure and map fields correctly

**Issue 4: Session not persisting**
- **Cause:** Tokens not stored in frontend auth context
- **Solution:** Update auth context with OAuth session data

## Questions or Issues?

Contact:
- **Project Manager:** For timeline/priority questions
- **Frontend Lead:** For UI/UX integration issues  
- **Backend Lead:** For API endpoint questions
- **Technical Lead:** For architecture decisions

## Next Steps After Completion

1. **Security Review:** OAuth implementation security audit
2. **Performance Testing:** OAuth flow performance metrics
3. **Analytics:** Track OAuth adoption rates
4. **User Experience:** Gather feedback on OAuth onboarding

---

**Status Updates:**
- [ ] Started: _________
- [ ] Supabase OAuth Config Complete: _________
- [ ] Backend Endpoints Complete: _________
- [ ] Frontend Integration Complete: _________
- [ ] Testing Complete: _________
- [ ] Completed: _________

**Dependencies:**
- Requires BE-003 (Email/Password Auth) completion
- Requires access to company OAuth developer accounts
- Requires Supabase admin access for provider configuration