# Agent Instructions

## Deployment standards

Before making deployment, domain, GitHub Pages, or studio-site integration
changes in this repo, read these files first:

- `docs/STUDIO_DEPLOYMENT_STANDARD.md`
- `docs/STUDIO_BACKEND_PLAN.md`
- `docs/DEPLOY_PAGES.md`
- `docs/templates/deploy-pages.template.yml`
- `docs/templates/deploy-backend.docker-compose.template.yml`
- `docs/templates/Caddyfile.studio-backend.template`
- `docs/templates/GAME_LAUNCH_CHECKLIST.template.md`
- `CODEX_HANDOFF_2026-03-10.md`

## Required behavior

- Treat `docs/STUDIO_DEPLOYMENT_STANDARD.md` as the default deployment policy.
- Treat the public slug as `vaultspark-football-gm` unless the user explicitly changes it.
- Keep the public frontend URL on the studio path:
  - `https://vaultsparkstudios.com/vaultspark-football-gm/`
- Keep frontend Pages deployment separate from backend/runtime deployment.
- Keep backend/runtime naming on the studio default:
  - `https://play-vaultspark-football-gm.vaultsparkstudios.com`
  - `https://api-vaultspark-football-gm.vaultsparkstudios.com`
- Keep this repo self-sufficient: deployment/domain/workflow context must live in repo files, not just handoff chat.
- Update `CODEX_HANDOFF_YYYY-MM-DD.md` after deployment-related changes.
- Before changing the studio-site homepage repo for this game, fetch the latest remote there and verify the live landing page or upstream `index.html` first.
