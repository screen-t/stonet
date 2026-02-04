# TASK: FE-003 - OAuth Button Integration

**Assigned To:** Frontend Developer 2  
**Priority:** HIGH  
**Estimate:** 8 hours  
**Deadline:** February 8, 2026  
**Status:** Not Started  
**Dependencies:** FE-002 (Authentication UI Components), BE-004 (OAuth Integration)  
**Created:** February 5, 2026

---

## Objective

Integrate OAuth login buttons (Google, GitHub, LinkedIn) into the authentication UI and handle OAuth flows with proper error handling and user experience.

## Prerequisites

- FE-002 (Authentication UI Components) completed
- BE-004 (OAuth Integration) in progress or completed
- PM-001 (OAuth Provider Setup) completed
- Understanding of OAuth 2.0 flow
- Supabase Auth knowledge

## Instructions

### Step 1: OAuth Service Setup (lib/oauth.ts)

Create OAuth service for handling provider authentication:

```typescript
import { supabase } from './supabase'

export type OAuthProvider = 'google' | 'github' | 'linkedin'

interface OAuthOptions {
  redirectTo?: string
  scopes?: string
}

export class OAuthService {
  private static instance: OAuthService
  
  static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService()
    }
    return OAuthService.instance
  }

  async signInWithProvider(provider: OAuthProvider, options: OAuthOptions = {}) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: options.redirectTo || `${window.location.origin}/auth/callback`,
          scopes: options.scopes || this.getDefaultScopes(provider),
        },
      })

      if (error) {
        throw new Error(`${provider} OAuth failed: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error(`OAuth ${provider} error:`, error)
      throw error
    }
  }

  private getDefaultScopes(provider: OAuthProvider): string {
    switch (provider) {
      case 'google':
        return 'email profile'
      case 'github':
        return 'user:email'
      case 'linkedin':
        return 'r_liteprofile r_emailaddress'
      default:
        return 'email'
    }
  }

  async handleOAuthCallback() {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        throw new Error(`OAuth callback error: ${error.message}`)
      }

      return data.session
    } catch (error) {
      console.error('OAuth callback error:', error)
      throw error
    }
  }
}

export const oauthService = OAuthService.getInstance()
```

### Step 2: OAuth Button Component (components/auth/OAuthButton.tsx)

```typescript
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { OAuthProvider, oauthService } from '@/lib/oauth'
import { useToast } from '@/hooks/use-toast'

interface OAuthButtonProps {
  provider: OAuthProvider
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
  redirectTo?: string
  disabled?: boolean
}

export const OAuthButton: React.FC<OAuthButtonProps> = ({
  provider,
  children,
  variant = 'outline',
  className = '',
  redirectTo,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleOAuthLogin = async () => {
    if (isLoading || disabled) return

    setIsLoading(true)
    
    try {
      await oauthService.signInWithProvider(provider, { redirectTo })
      // User will be redirected, so we don't need to handle success here
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
      
      toast({
        title: 'Authentication Error',
        description: `Failed to sign in with ${provider}. Please try again.`,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={`w-full ${className}`}
      onClick={handleOAuthLogin}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        children
      )}
    </Button>
  )
}
```

### Step 3: Provider-Specific Button Components

Create individual components for each provider:

#### Google OAuth Button (components/auth/GoogleOAuthButton.tsx)

```typescript
import React from 'react'
import { OAuthButton } from './OAuthButton'

interface GoogleOAuthButtonProps {
  className?: string
  redirectTo?: string
  disabled?: boolean
}

export const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = (props) => {
  return (
    <OAuthButton provider="google" {...props}>
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </OAuthButton>
  )
}
```

#### GitHub OAuth Button (components/auth/GitHubOAuthButton.tsx)

```typescript
import React from 'react'
import { OAuthButton } from './OAuthButton'

interface GitHubOAuthButtonProps {
  className?: string
  redirectTo?: string
  disabled?: boolean
}

export const GitHubOAuthButton: React.FC<GitHubOAuthButtonProps> = (props) => {
  return (
    <OAuthButton provider="github" {...props}>
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
      Continue with GitHub
    </OAuthButton>
  )
}
```

#### LinkedIn OAuth Button (components/auth/LinkedInOAuthButton.tsx)

```typescript
import React from 'react'
import { OAuthButton } from './OAuthButton'

interface LinkedInOAuthButtonProps {
  className?: string
  redirectTo?: string
  disabled?: boolean
}

export const LinkedInOAuthButton: React.FC<LinkedInOAuthButtonProps> = (props) => {
  return (
    <OAuthButton provider="linkedin" {...props}>
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
      Continue with LinkedIn
    </OAuthButton>
  )
}
```

### Step 4: OAuth Callback Page (pages/AuthCallback.tsx)

```typescript
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { oauthService } from '@/lib/oauth'
import { useAuth } from '@/lib/auth'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refreshAuth } = useAuth()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL params
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (error) {
          throw new Error(errorDescription || error)
        }

        // Handle the OAuth callback
        const session = await oauthService.handleOAuthCallback()
        
        if (session) {
          // Refresh auth context
          await refreshAuth()
          
          // Show success message
          toast({
            title: 'Welcome!',
            description: 'You have been successfully signed in.',
          })
          
          // Redirect to intended destination or dashboard
          const redirectTo = searchParams.get('redirectTo') || '/feed'
          navigate(redirectTo, { replace: true })
        } else {
          throw new Error('No session found after OAuth callback')
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        
        toast({
          title: 'Authentication Failed',
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
          variant: 'destructive',
        })
        
        // Redirect back to login
        navigate('/login', { replace: true })
      } finally {
        setIsProcessing(false)
      }
    }

    handleCallback()
  }, [navigate, searchParams, refreshAuth, toast])

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Completing sign in...</p>
        </div>
      </div>
    )
  }

  return null
}
```

### Step 5: Update Login Page

Update the Login page to use the OAuth buttons:

```typescript
// Add to Login.tsx
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton'
import { GitHubOAuthButton } from '@/components/auth/GitHubOAuthButton'
import { LinkedInOAuthButton } from '@/components/auth/LinkedInOAuthButton'

// Replace the existing OAuth buttons with:
<div className="grid grid-cols-1 gap-3">
  <GoogleOAuthButton />
  <GitHubOAuthButton />
  <LinkedInOAuthButton />
</div>
```

### Step 6: Update Signup Page

Similarly update the Signup page:

```typescript
// Add to Signup.tsx
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton'
import { GitHubOAuthButton } from '@/components/auth/GitHubOAuthButton'
import { LinkedInOAuthButton } from '@/components/auth/LinkedInOAuthButton'

// Replace the existing OAuth buttons section
```

### Step 7: Update App Routing

Add the callback route to your App.tsx or routing configuration:

```typescript
// Add to App.tsx routes
import { AuthCallback } from './pages/AuthCallback'

<Route path="/auth/callback" element={<AuthCallback />} />
```

### Step 8: Environment Variables

Ensure these environment variables are set:

```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OAuth Client IDs (for display/validation)
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
VITE_GITHUB_OAUTH_CLIENT_ID=your_github_client_id
VITE_LINKEDIN_OAUTH_CLIENT_ID=your_linkedin_client_id
```

## Deliverables

- [ ] OAuth service implementation (lib/oauth.ts)
- [ ] Reusable OAuth button component
- [ ] Provider-specific button components (Google, GitHub, LinkedIn)
- [ ] OAuth callback page handling
- [ ] Integration with Login page
- [ ] Integration with Signup page
- [ ] Proper error handling and user feedback
- [ ] Loading states during OAuth flow
- [ ] Routing configuration updated

## Acceptance Criteria

1. **OAuth Flow:**
   - Clicking OAuth buttons redirects to provider auth page
   - Successful authentication returns to callback page
   - Failed authentication shows appropriate error message
   - User is redirected to intended destination after auth

2. **User Experience:**
   - Loading states show during OAuth process
   - Clear error messages for auth failures
   - Seamless integration with existing auth UI
   - Consistent styling with app design

3. **Error Handling:**
   - Network errors handled gracefully
   - OAuth errors displayed to user
   - Proper fallback to login page on errors
   - Console logging for debugging

4. **Integration:**
   - Works with existing authentication system
   - Auth state updates correctly after OAuth login
   - Proper routing after successful authentication
   - No conflicts with email/password login

## Testing Checklist

- [ ] Google OAuth login works in development
- [ ] GitHub OAuth login works in development
- [ ] LinkedIn OAuth login works in development
- [ ] OAuth callback page handles success scenarios
- [ ] OAuth callback page handles error scenarios
- [ ] Proper redirection after successful login
- [ ] Error messages display correctly
- [ ] Loading states work properly
- [ ] Works on different browsers
- [ ] Mobile responsive design maintained

## Questions or Issues?

Contact:
- **Project Manager:** Daniel
- **Frontend Lead:** [TBD]
- **Backend Lead:** [For API integration issues]

## Next Steps After Completion

1. Test OAuth flow in staging environment
2. Verify OAuth provider configurations
3. Integrate with FE-006 (Authentication State Management)
4. Implement OAuth account linking features
5. Add OAuth-specific user onboarding flow

---

**Status Updates:**
- [ ] Started: _________
- [ ] OAuth Service Complete: _________
- [ ] OAuth Buttons Complete: _________
- [ ] Callback Page Complete: _________
- [ ] Login Integration: _________
- [ ] Signup Integration: _________
- [ ] Testing Complete: _________
- [ ] Completed: _________