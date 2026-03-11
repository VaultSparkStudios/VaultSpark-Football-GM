# Codex Handoff - 2026-03-10

## Repo
- Name: `VaultSpark-Football-GM`
- Remote: `https://github.com/VaultSparkStudios/VaultSpark-Football-GM.git`
- Public slug target: `vaultspark-football-gm`

## Deployment status
- Added local deployment canon under `docs/` and `docs/templates/`.
- Added repo-local `AGENTS.md` for deployment/domain/studio-site work.
- Added `build:pages` support for a client-only static bundle under `static/`.
- Added `smoke:pages` to verify the static bundle at the production slug path.
- Added `.github/workflows/deploy-pages.yml` to publish the Pages bundle into `VaultSparkStudios.github.io/vaultspark-football-gm/`.
- Added `.github/workflows/deploy-backend.yml`, `Dockerfile.runtime`, and backend runtime scaffolds under `ops/` for the standard `play-{slug}` / `api-{slug}` domain model.
- Pages publishing is scaffolded, not launched.
- The local Studio repo has been updated with the current Pages bundle and a client-beta card state after upstream verification.

## Public URL and backend targets
- Frontend: `https://vaultsparkstudios.com/vaultspark-football-gm/`
- Gameplay origin target: `https://play-vaultspark-football-gm.vaultsparkstudios.com`
- API origin target: `https://api-vaultspark-football-gm.vaultsparkstudios.com`

## Required GitHub variables
- `GAME_SLUG=vaultspark-football-gm`
- `GAME_SERVICE_ORIGIN=https://play-vaultspark-football-gm.vaultsparkstudios.com`
- `API_DOMAIN=api-vaultspark-football-gm.vaultsparkstudios.com`
- `STUDIO_SITE_BRANCH=main`

## Required GitHub secret
- `STUDIO_SITE_TOKEN`

## Known deployment gaps
- The published Pages build is client-only; server-backed mode is not part of the static artifact.
- The backend workflow is scaffolded but not configured with live SSH/server secrets yet.
- No live GitHub Actions or secret configuration was performed from this environment.

## Validation targets
- `node scripts/build-pages.mjs`
- `npm.cmd run smoke:pages`
- `node --check public/setup.js`
- `node --check public/app.js`
- `npm.cmd test`
