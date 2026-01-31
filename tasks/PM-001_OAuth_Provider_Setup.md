# PM-001: OAuth Provider Account Setup Guide

**Assigned to:** Project Owner  
**Priority:** High  
**Estimated Time:** 2-3 hours  
**Status:** Not Started  

## Overview
Before implementing OAuth integration (BE-004), we need to create developer accounts with OAuth providers and obtain API credentials for Stonet.

## Prerequisites
- Official Stonet email address
- Access to Stonet domain settings (for verification)
- Basic understanding of OAuth concepts

## Required Provider Accounts

### 1. Google OAuth Setup
**Platform:** Google Cloud Console  
**URL:** https://console.cloud.google.com/

**Steps:**
1. Sign in with Stonet Google account (or create one)
2. Create new project: "Stonet"
3. Enable APIs:
   - Go to "APIs & Services" > "Library"
   - Enable "Google+ API"
   - Enable "Google Identity Services API"
4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: Web application
   - Name: "Stonet - Google Auth"
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/google/callback` (development)
     - `https://stonet.com/auth/google/callback` (production)
5. **Save credentials:** `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### 2. GitHub OAuth Setup
**Platform:** GitHub Developer Settings  
**URL:** https://github.com/settings/developers

**Steps:**
1. Sign in to GitHub with Stonet account
2. Go to "Settings" > "Developer settings" > "OAuth Apps"
3. Click "New OAuth App"
4. Fill application details:
   - Application name: "Stonet"
   - Homepage URL: `https://stonet.com`
   - Application description: "Professional networking platform"
   - Authorization callback URLs:
     - `http://localhost:3000/auth/github/callback` (development)
     - `https://stonet.com/auth/github/callback` (production)
5. **Save credentials:** `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

### 3. LinkedIn OAuth Setup
**Platform:** LinkedIn Developer Portal  
**URL:** https://developer.linkedin.com/

**Steps:**
1. Sign in with Stonet LinkedIn account
2. Click "Create app"
3. Fill app details:
   - App name: "Stonet"
   - LinkedIn Page: Create/select Stonet company page
   - App logo: Upload Stonet logo
   - Legal agreement: Accept terms
4. In app settings:
   - Go to "Auth" tab
   - Add redirect URLs:
     - `http://localhost:3000/auth/linkedin/callback` (development)
     - `https://stonet.com/auth/linkedin/callback` (production)
   - Request scopes: `r_liteprofile` and `r_emailaddress`
5. **Save credentials:** `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`

## Credentials Management

### Environment Variables Template
Create a secure document with these credentials:

```
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# GitHub OAuth  
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here  
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
```

### Security Notes
- **Never commit credentials to Git**
- Store credentials in secure password manager
- Share credentials securely with development team
- Use different credentials for development/production environments

## Domain Verification (If Required)

Some providers may require domain verification:

1. **Google:** May request domain verification for production URLs
2. **LinkedIn:** Requires company page association
3. **GitHub:** No domain verification typically needed

## Deliverables

- [ ] Google OAuth app created with credentials
- [ ] GitHub OAuth app created with credentials  
- [ ] LinkedIn OAuth app created with credentials
- [ ] All credentials documented securely
- [ ] Credentials shared with development team
- [ ] Domain verifications completed (if applicable)

## Next Steps

Once this task is complete:
1. Provide credentials to backend developer
2. Backend developer can proceed with BE-004_OAuth_Integration task
3. Test OAuth flows in development environment

## Support Resources

- **Google:** https://developers.google.com/identity/oauth2/web/guides/get-google-api-clientid
- **GitHub:** https://docs.github.com/en/developers/apps/building-oauth-apps
- **LinkedIn:** https://docs.microsoft.com/en-us/linkedin/shared/authentication/

## Acceptance Criteria

- [ ] All three OAuth provider accounts created
- [ ] Valid client ID/secret pairs obtained for each provider
- [ ] Credentials securely documented and shared
- [ ] Redirect URLs properly configured for dev/prod environments
- [ ] Any required domain verifications completed