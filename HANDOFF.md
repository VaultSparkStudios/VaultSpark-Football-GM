# Handoff

## Project
VaultSpark Football GM

## Current State
- `npm run dev` starts the browser game from `src/server.js`.
- The playable game still depends on a Node runtime plus `/api/*` endpoints and cannot run on GitHub Pages as-is.
- The GitHub repository is now live at `https://github.com/VaultSparkStudios/VaultSpark-Football-GM`.
- A non-playable launch stub is being wired into the studio site path `https://vaultsparkstudios.com/vaultspark-football-gm/` while the game is prepared for a later static-browser refactor.
- The studio landing page repo is `VaultSparkStudios.github.io`.

## What Changed In This Pass
- Added shared depth-chart usage logic in `src/engine/depthChartUsage.js`.
- Updated `src/engine/gameSimulator.js` so offensive and defensive usage depend on personnel packages, coaching tendencies, and position room role order.
- Added game-level availability wear so careers do not default toward unrealistic full-17-game participation every season.
- Updated `src/engine/offseasonSimulator.js` so players only accrue `experience` and `seasonsPlayed` when they actually played enough to count as an accrued season.
- Tightened general retirement behavior while giving specialists a separate retirement curve.
- Updated `src/runtime/GameSession.js` so the UI/API depth-chart snap-share view reflects the live usage profile.
- Fixed invalid unquoted hyphenated keys in `src/config.js`.
- Added regression coverage in `test/realism-career-regression.test.js` for offseason accrual and 10-year career realism guardrails.
- Initialized git, corrected the repo-local author identity to `VaultSpark Studios <founder@vaultsparkstudios.com>`, recreated the remote repo cleanly, and pushed the corrected history fresh.
- Added a screenshot ignore rule in `.gitignore` for local browser evidence files.

## Key Files
- `src/engine/depthChartUsage.js`
- `src/engine/gameSimulator.js`
- `src/engine/offseasonSimulator.js`
- `src/runtime/GameSession.js`
- `src/stats/realismCalibrator.js`
- `src/stats/profiles/pfrCareerWeightedProfile.js`
- `src/config.js`
- `test/realism-career-regression.test.js`
- `src/server.js`
- `public/game.html`
- `public/app.js`

## Deployment Status
- Game repo:
  - `https://github.com/VaultSparkStudios/VaultSpark-Football-GM`
  - branch: `main`
  - latest pushed commit: `522251fb7f7453c8e62fd02e7ea9d2b2011d768f`
- Local git identity:
  - name: `VaultSpark Studios`
  - email: `founder@vaultsparkstudios.com`
- Studio site repo cloned locally:
  - `C:\Users\p4cka\Documents\Development\VaultSparkStudios.github.io`
- Studio site work in progress:
  - add `VaultSpark Football GM` card in `Forged From The Vault`
  - place the new card immediately after `Call Of Doodie`
  - add path stub at `/vaultspark-football-gm/`

## Latest Validation
- `npm.cmd test` passed before deployment work began.
- Full test suite includes:
  - existing gameplay/session/API/snapshot regression tests
  - `test/realism-career-regression.test.js`
- In-process 10-year realism verification after this pass:
  - Season: `on-target 44, watch 0, out 0`
  - Career: `on-target 40, watch 19, out 4`

## Current Realism Read
- `WR`, `TE`, `OL`, and `LB` improved enough in the 10-year verification to avoid `out-of-range` career metrics in the validation run from this pass.
- `RB` still has the largest remaining issue, especially career receiving TDs and some receiving volume.
- `K` remains low in career volume and career length versus the current target profile.
- I did not regenerate and write fresh 10-year / 20-year JSON verification artifacts to `output/` during this pass.

## Important Behavior
- Position max-age caps are configured in `src/config.js`.
- Retirement chance uses age, team winning context, player quality, prior-season usage, free-agent/inactive status, override state, and specialist-specific handling.
- `seasonsPlayed` and `experience` no longer auto-increment for active players who effectively missed the season.
- Career verification evaluates league-wide averages using active + retired players.
- Season calibration still uses year-qualified players and discrete-stat rebalancing to keep season averages on target.
- Depth charts now matter more because sub-package and role usage affect accumulation more directly.
- The current app is server-hosted:
  - session state lives in memory on the Node server
  - saves use filesystem-backed slots
  - the front end calls `GET`/`POST` API routes exposed by `src/server.js`

## Commands
- `npm run dev`
- `npm test`
- `npm run test:ui`
- `npm run verify:realism -- --seasons 10 --outFile output/realism-verification-10y-final.json`
- `npm run verify:realism -- --seasons 20 --outFile output/realism-verification-20y-final.json`

## Known Gaps
- 20-year career drift still needs a fresh rerun after this pass.
- `RB` career receiving production is still high relative to target.
- `K` career totals and seasons remain low relative to target.
- CPU roster-building AI by scheme/age/contract/role still needs a deeper pass.
- Save/load continuity should still be stress-tested against long sims and report generation.
- The Rules/manual area and broader UX backlog remain open.
- The GitHub Pages launch stub is not the playable game; it is only a project landing page until the refactor is done.

## Static Refactor Plan
1. Replace the Node server session model with a browser-native runtime.
   - Move the current session lifecycle out of `src/server.js` and into a client-side application shell.
   - The browser will own the live league state instead of the server process.
2. Replace filesystem saves with browser storage and export/import files.
   - Current `saves/` slot behavior will become `localStorage` / `IndexedDB` plus manual `.json` export/import.
   - This changes persistence from machine-folder saves to browser-profile saves unless the user exports snapshots.
3. Replace HTTP API calls with direct in-browser module calls.
   - The current UI talks to `/api/*`.
   - In the static version, UI actions will call the simulation/session modules directly in the browser runtime.
4. Split server-only code from browser-safe code.
   - Any use of `fs`, `http`, `path`, and server request handling must be removed from the playable path.
   - Simulation, stats, contracts, drafting, and realism logic should remain as pure modules.
5. Add a front-end build pipeline for static deployment.
   - Convert the browser shell to a Vite-style app or similar static bundler.
   - Configure base path for the deployed route.
6. Rework long-running tasks and realism verification UX.
   - Multi-year verification and long sims may need Web Worker execution so the browser UI does not freeze.
   - This changes some workflows from instant API calls into client-side jobs with progress indicators.
7. Update save/load, resume, and slot semantics in the UI.
   - Current “server slot” language should become browser/local export language.
   - Commissioner/admin tools should reflect browser-hosted state.
8. Re-test determinism and realism after the move.
   - Browser refactors can change RNG usage order or async sequencing.
   - The existing regression tests should be adapted for the browser build path and rerun after the migration.
9. Add GitHub Pages deployment config once the app is static.
   - Use a static build output and Pages workflow similar to the existing Vite-hosted games.
   - Point the production path to `/vaultspark-football-gm/`.

## How The Static Refactor Will Change The Game
- Hosting:
  - from a server-hosted app
  - to a browser-hosted app served as static files
- Saves:
  - from filesystem slot saves under `saves/`
  - to browser storage plus downloadable/importable snapshot files
- Simulation execution:
  - from server CPU work
  - to client CPU work in the player’s browser, likely with workers for long jobs
- Deployment:
  - from `npm run dev` local server only
  - to a GitHub Pages-compatible static bundle
- Operations:
  - fewer server dependencies
  - more client-side memory/performance constraints

## Suggested Next Steps
1. Finish and push the `VaultSparkStudios.github.io` edits for the new `VaultSpark Football GM` card and stub route.
2. Verify the live stub at `https://vaultsparkstudios.com/vaultspark-football-gm/`.
3. Decide whether the next major workstream is:
   - full static refactor
   - more realism tuning first
4. If static refactor starts next, begin by extracting browser-safe session/state modules away from `src/server.js`.
