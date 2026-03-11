# VaultSpark Football GM Pages Deployment

This repo can build a static client bundle for deployment at:

- `https://vaultsparkstudios.com/vaultspark-football-gm/`

The Pages bundle is client-only and uses the in-browser runtime. The Node-hosted
server remains the local development/runtime path and is not part of the Pages
artifact.

Backend/runtime deployment is separate. The default studio runtime plan is
captured in:

- `docs/STUDIO_BACKEND_PLAN.md`

## Required GitHub variables

Set these repo variables in `VaultSparkStudios/VaultSpark-Football-GM`:

- `GAME_SLUG`
  - `vaultspark-football-gm`
- `STUDIO_SITE_BRANCH`
  - Example: `main`
- `GAME_SERVICE_ORIGIN`
  - Default standard: `https://play-vaultspark-football-gm.vaultsparkstudios.com`
- `API_DOMAIN`
  - Default standard: `api-vaultspark-football-gm.vaultsparkstudios.com`

## Required GitHub secret

- `STUDIO_SITE_TOKEN`
  - Personal access token with write access to `VaultSparkStudios/VaultSparkStudios.github.io`

## What the workflow does

`deploy-pages.yml`:

1. Builds the static client with `VITE_APP_BASE_PATH=/vaultspark-football-gm/`
2. Forces client-only runtime default for the published bundle
3. Copies `index.html` to `404.html` for GitHub Pages deep-link fallback
4. Checks out the studio site repo
5. Syncs the built bundle into `/vaultspark-football-gm/`
6. Commits and pushes only that game subfolder

Local validation commands:

- `npm run build:pages`
- `npm run smoke:pages`

## Current scope

This Pages build does not include the server-backed runtime. Published Pages
artifacts are expected to run in browser/local-storage mode until a separate
production backend rollout is ready.

## Backend scaffold

The repo now includes:

- `.github/workflows/deploy-backend.yml`
- `Dockerfile.runtime`
- `ops/deploy-backend.docker-compose.yml`
- `ops/Caddyfile`

The backend workflow is a scaffold. It can build and push the standard
`play-{slug}` and `api-{slug}` images now, and it supports optional server
deployment once the required SSH/VPS secrets exist.

## Studio site follow-up

The studio repo already contains a `VaultSpark Football GM` card and a
`/vaultspark-football-gm/` launch path. Once the static game bundle is ready,
that repo should receive the built bundle and any necessary card/status updates.
Per studio policy, verify the latest remote/live homepage state there before
editing the landing page.
