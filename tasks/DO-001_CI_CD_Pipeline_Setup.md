# TASK: DO-001 - CI/CD Pipeline Setup

**Assigned To:** DevOps Engineer  
**Priority:** HIGH  
**Estimate:** 12 hours  
**Deadline:** Jan 24, 2026  
**Status:** Not Started  
**Created:** Jan 23, 2026

---

## Objective

Set up GitHub Actions CI/CD pipeline for automated testing, building, and deployment of frontend and backend to staging and production environments.

## Prerequisites

- GitHub repository access (admin)
- Vercel account for frontend deployment
- Supabase staging project created (BE-001)
- Basic understanding of GitHub Actions

## Instructions

### Step 1: Create GitHub Actions Workflow Directory

```bash
mkdir -p .github/workflows
```

### Step 2: Frontend CI Workflow

**File:** `.github/workflows/frontend-ci.yml`

```yaml
name: Frontend CI

on:
  pull_request:
    paths:
      - 'frontend/**'
  push:
    branches:
      - main
      - develop
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run linter
        working-directory: ./frontend
        run: npm run lint
      
      - name: Run type check
        working-directory: ./frontend
        run: npx tsc --noEmit
      
      - name: Build
        working-directory: ./frontend
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL_STAGING }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY_STAGING }}
      
      - name: Run tests (when available)
        working-directory: ./frontend
        run: npm test || echo "No tests yet"
        continue-on-error: true
```

### Step 3: Frontend Deployment Workflow

**File:** `.github/workflows/frontend-deploy.yml`

```yaml
name: Deploy Frontend

on:
  push:
    branches:
      - main
    paths:
      - 'frontend/**'

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
          vercel-args: '--prod'

  deploy-production:
    runs-on: ubuntu-latest
    environment: production
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_PROD }}
          working-directory: ./frontend
          vercel-args: '--prod'
```

### Step 4: Database Migration Workflow

**File:** `.github/workflows/database-migration.yml`

```yaml
name: Database Migrations

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/migrations/**'
  workflow_dispatch:

jobs:
  migrate-staging:
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Run migrations
        run: |
          supabase db push --db-url "${{ secrets.STAGING_DATABASE_URL }}"
        working-directory: ./supabase
```

### Step 5: Code Quality Workflow

**File:** `.github/workflows/code-quality.yml`

```yaml
name: Code Quality

on:
  pull_request:
    branches:
      - main
      - develop

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run ESLint
        working-directory: ./frontend
        run: npm run lint
      
      - name: Check formatting (Prettier)
        working-directory: ./frontend
        run: npx prettier --check "src/**/*.{ts,tsx,css}"
        continue-on-error: true
```

### Step 6: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

**Settings → Secrets and variables → Actions**

#### Required Secrets:

**Supabase (Staging):**
- `VITE_SUPABASE_URL_STAGING`
- `VITE_SUPABASE_ANON_KEY_STAGING`
- `STAGING_DATABASE_URL`

**Supabase (Production):**
- `VITE_SUPABASE_URL_PROD`
- `VITE_SUPABASE_ANON_KEY_PROD`
- `PRODUCTION_DATABASE_URL`

**Vercel:**
- `VERCEL_TOKEN` (from Vercel account settings)
- `VERCEL_ORG_ID` (from Vercel project settings)
- `VERCEL_PROJECT_ID` (staging project)
- `VERCEL_PROJECT_ID_PROD` (production project)

### Step 7: Configure Branch Protection

**Settings → Branches → Add branch protection rule**

For `main` branch:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
  - Required checks: Frontend CI, Code Quality
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

For `develop` branch:
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

### Step 8: Setup Vercel Projects

1. **Create Vercel Account** (if not exists)
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Frontend Project:**
   - Click "Add New Project"
   - Import from GitHub: `b2b-network/frontend`
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Environment Variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   
3. **Create Staging Environment:**
   - Settings → Domains → Add staging domain
   - Settings → Environment Variables → Add staging vars

4. **Create Production Environment:**
   - Repeat for production with production Supabase keys

### Step 9: Create README for CI/CD

**File:** `.github/README.md`

Document:
- How CI/CD works
- Required secrets
- How to trigger deployments
- Branch strategy
- Troubleshooting common issues

### Step 10: Test Workflows

1. Create a test PR with small change
2. Verify CI runs
3. Merge to develop/main
4. Verify deployment works
5. Check deployed app works

## Deliverables

- [ ] Frontend CI workflow created
- [ ] Frontend deployment workflow created
- [ ] Database migration workflow created
- [ ] Code quality workflow created
- [ ] GitHub secrets configured
- [ ] Branch protection rules set
- [ ] Vercel projects created and linked
- [ ] Staging environment deployed
- [ ] Production environment prepared
- [ ] CI/CD documentation created
- [ ] Workflows tested and verified

## Acceptance Criteria

1. All workflows run without errors
2. Pull requests trigger CI checks
3. Merging to main triggers deployment
4. Tests run on every PR
5. Linting/formatting enforced
6. Build succeeds before merge
7. Staging deploys automatically
8. Branch protection prevents bad merges
9. Team can view deployment status
10. Rollback process documented

## Testing Checklist

- [ ] Create test branch
- [ ] Make small change in frontend
- [ ] Open PR
- [ ] Verify CI runs
- [ ] Check all checks pass
- [ ] Merge to develop (if using)
- [ ] Verify staging deployment
- [ ] Check deployed app works
- [ ] Test environment variables loaded

## Environment Strategy

```
main branch → Production (manual approval)
develop branch → Staging (auto deploy)
feature/* → CI only (no deploy)
```

## Monitoring After Setup

Monitor for:
- Failed workflow runs
- Deployment failures
- Build time (should be < 5 minutes)
- Test failures

## Questions or Issues?

Contact:
- **Project Manager:** Daniel
- **Technical Lead:** [TBD]
- **Backend Lead:** [For database migrations]
- **Frontend Lead:** [For build issues]

## Next Steps After Completion

1. Train team on PR process
2. Document deployment procedures
3. Setup monitoring (DO-002)
4. Configure alerting for failures

---

**Status Updates:**
- [ ] Started: _________
- [ ] Workflows Created: _________
- [ ] Secrets Configured: _________
- [ ] Branch Protection Set: _________
- [ ] Vercel Linked: _________
- [ ] Testing Complete: _________
- [ ] Completed: _________
- [ ] Team Trained: _________
