import test from "node:test";
import assert from "node:assert/strict";
import { simulateGame } from "../src/engine/gameSimulator.js";
import { createSession } from "../src/runtime/bootstrap.js";

test("pass play log carries route-family and coverage-shell structure", () => {
  const session = createSession({ seed: 20260315, startYear: 2026, controlledTeamId: "BUF" });
  const game = simulateGame({
    league: session.league,
    statBook: session.statBook,
    homeTeamId: "BUF",
    awayTeamId: "MIA",
    year: 2026,
    week: 1,
    rng: session.rng,
    mode: "drive",
    seasonType: "regular"
  });

  const passPlays = game.boxScore.playByPlay.filter((entry) => ["pass", "incomplete", "interception"].includes(entry.type));
  assert.ok(passPlays.length >= 15);
  assert.ok(passPlays.every((entry) => entry.routeFamily && entry.depthBucket && entry.coveragePrimary && entry.coverageShell));
  assert.ok(new Set(passPlays.map((entry) => entry.routeFamily)).size >= 3);
  assert.ok(new Set(passPlays.map((entry) => entry.depthBucket)).size >= 2);
});
