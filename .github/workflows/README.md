# CI/CD Pipelines for Stonet Project

This repository uses **GitHub Actions** for continuous integration (CI) and (partial) continuous deployment (CD).

## Branch Strategy
- **main**: Primary branch → Production-ready code (protected)
  - Triggers: CI on every push/PR, deployment on push (when ready)
- Feature branches / PRs: CI checks only (no deploy)
- (Future: `develop` branch for staging if added)

**Branch Protection on main** (pending admin approval):
- Requires PR + at least 1 approval
- Requires status checks to pass: Frontend CI, Backend CI, Code Quality
- Branches must be up-to-date before merging

## Workflows Overview

| Workflow                  | File                          | Triggers on                          | What it does                                                                 |
|---------------------------|-------------------------------|--------------------------------------|-------------------------------------------------------------------------------|
| Frontend CI               | frontend-ci.yml              | Push/PR to main + frontend/** changes | Lint, type-check (tsc), build (with Supabase env vars), tests (if exist)     |
| Backend CI                | backend-ci.yml               | Push/PR to main + backend/** changes  | Install deps (pip), run pytest, optional mypy type check                     |
| Code Quality              | code-quality.yml             | Push/PR to main                      | ESLint + Prettier check on frontend (expandable to backend later)            |
| Deploy Frontend (Vercel)  | frontend-deploy.yml          | Push to main + frontend/** changes   | Build (with Supabase secrets) → Deploy to Vercel (placeholder - needs secrets)|
| Deploy Backend (Render)   | backend-deploy.yml           | Push to main + backend/** changes    | Deploy to Render (placeholder - needs Render API token & service ID)         |
| Database Migrations       | database-migration.yml       | Push to main + supabase/migrations/** or manual | Apply Supabase migrations using Supabase CLI                                 |

## Required GitHub Secrets (Actions)

Already configured:
- `VITE_SUPABASE_URL`              → Frontend Vite env var (Supabase project URL)
- `VITE_SUPABASE_ANON_KEY`         → Frontend anon key (client-side safe)
- `SUPABASE_URL`                   → Backend / migrations (project URL or postgres connection string)
- `SUPABASE_SERVICE_ROLE_KEY`      → Backend / migrations (full admin key - never expose!)

Still needed for full deployment:
- Vercel:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID_PROD` (or STAGING if separate)
- Render:
  - `RENDER_API_TOKEN`
  - `RENDER_SERVICE_ID_PRODUCTION` (and STAGING if used)

Add them via: Settings → Secrets and variables → Actions → New repository secret

## Environment Variables Strategy
- Frontend build/deploy: Uses `VITE_SUPABASE_*` secrets
- Backend: Uses `SUPABASE_*` secrets (add to Render dashboard env vars)
- Migrations: Uses `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`

## How to Test / Trigger
1. Make a small change in `frontend/` or `backend/` → commit to a feature branch → open PR → watch CI run
2. Merge to `main` → CI runs + deployment attempts (will partial-fail until Vercel/Render secrets added)
3. For migrations: Go to Actions → Database Migrations → Run workflow (manual trigger)

## Troubleshooting
- **CI fails on lint/type-check**: Fix ESLint/TS errors in frontend or add tests in backend
- **Build fails**: Check if `npm run build` works locally with same env vars
- **Migration fails**: Verify `supabase/migrations/` has .sql files; check Supabase URL format (should be full postgres://... if needed)
- **No runs showing**: Ensure change is in the right path (frontend/**, etc.)
- Logs: Click workflow run in Actions tab → expand steps

## Next Steps (Hand-off)
- Set up Vercel project(s) → add Vercel secrets → test frontend deploy
- Set up Render service(s) → add env vars (SUPABASE_*) → add Render secrets → test backend deploy
- Test full flow: PR → merge → staging/prod deploy → verify live app
- Add monitoring/alerting if needed (future task)

Setup by: Shrey  
Last updated: February 2026
