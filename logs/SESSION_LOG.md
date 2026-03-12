# Session Log

## 2026-03-11

Completed:
- Audited the game repo against the updated Studio AGENTS standard
- Added the project-memory package required by the new Studio session model
- Converted docs and workflows from cross-repo Pages sync to direct GitHub Pages deployment
- Passed `npm.cmd run build:pages`, `npm.cmd run smoke:pages`, and the focused diff check
- Updated CI from Node 20 to Node 24 so GitHub Actions supports `--test-isolation=none`
- Identified the four real CI regressions after the Node fix and staged the runtime/stat files that resolve them
- Verified the previously failing tests now pass locally:
  - `test/generated-league-presentation.test.js`
  - `test/local-api-runtime.test.js`
  - `test/realism-career-regression.test.js`
- Verified the last two GitHub failures are fixed by already-present local test updates:
  - `test/realism-career-regression.test.js`
  - `test/session-actions.test.js`
- Synced the Playwright app spec to the current Contracts and Scouting UI and verified `tests-ui/app.spec.js` passes locally
- Reviewed the Studio repo `origin/main` standards canon line by line and confirmed this game repo/local `origin/main` are aligned to the direct per-repo Pages model
- Confirmed the separate local Studio repo clone is heavily dirty, so standards-only reconciliation there should be isolated before editing
- Confirmed via GitHub that the direct-pages standards branch finished green and that `origin/main` already contains the merge commit
- Updated the depth chart UI so reordering uses dedicated depth-control buttons and no longer trips the player-profile modal click path
- Added manual snap-share editing, save/load persistence, and simulator usage overrides for depth chart positions
- Replaced the footer-expanded Game Guide with a button-driven guide modal and added Playwright coverage for it
- Revalidated the gameplay/UI changes with focused runtime, sim, and Playwright test passes
- Reviewed the dirty worktree after restart, isolated the intended gameplay/UI diff, and committed that subset without staging the unrelated realism/runtime files
- Parked the unrelated realism/runtime and local artifact files into a named stash so the worktree is clean again
- Reproduced the reported `Play`-mode startup issue in a browser, traced it to the blocking game-page boot path, and changed startup to hydrate secondary panels in the background after the dashboard is ready
- Added and passed a dedicated Playwright smoke test for create-league in `Play` mode
- Deferred backup loading on the first setup-init request and tightened both save-store adapters so normal save listing avoids backup metadata work
- Mapped user-facing schedule/calendar/ticker/transaction/pick/player displays to generated team abbreviations so the UI no longer leaks legacy team IDs after randomized league creation
- Replaced raw typed player-ID entry in the roster designation and retirement override panels with table-driven selection state and disabled actions until a player is chosen
- Added and passed a Playwright regression covering designation selection plus the retirement-override no-raw-ID shell state
- Changed setup boot so `/api/setup/init` can skip save discovery, the page becomes ready from active-league/team state first, and `/api/saves` hydrates in the background
- Added runtime coverage for `includeSaves=0` and revalidated the setup-dependent Playwright specs
- Moved node-only realism profile loading out of the browser runtime path so client-only mode can import `localApiRuntime` under the dev server again
- Made setup runtime-mode switching reload active/save state for the selected runtime and added Playwright coverage for switching between server-backed and client-only mode
- Replaced the remaining trade, compare, and player-history raw-ID inputs with staged roster/pick tables plus player-name search selection flows
- Added `/api/players/search` in both runtime modes and extended the local runtime test coverage for the new lookup path
- Updated the Playwright harness from port `4173` to `4273` to avoid an unrelated local app that was already bound to `4173`
- Revalidated the changed surfaces with:
  - `node --check public/app.js`
  - `node --check scripts/dev-playwright-server.mjs`
  - `node --check src/server.js`
  - `node --check src/app/api/localApiRuntime.js`
  - `node --check src/runtime/GameSession.js`
  - `node --check tests-ui/app.spec.js`
  - `node --test --test-isolation=none test/local-api-runtime.test.js`
  - `npx.cmd playwright test tests-ui/app.spec.js tests-ui/play-mode-smoke.spec.js --reporter=line --workers=1 -g "contracts, trade, calendar, and transaction log are operational|compare and player history flows use search-driven selection|create league in play mode reaches the franchise screen"`

Open problems:
- Setup/main-menu initialization still needs measuring after the non-blocking save-load and client-runtime import fixes and may need additional trimming
- GitHub Settings -> Pages and optional repo variables cannot be verified from repo files alone
- A full `npm.cmd test` invocation was not rerun in this shell session, so verification here relies on the focused suites that passed
- The unrelated realism/runtime stash is still parked and needs to stay isolated until that work is intentionally resumed

Recommended next action:
- Measure the remaining setup/main-menu latency after this client-runtime import fix, then do a focused manual smoke pass on the new trade/compare/history selection flows
