import test from "node:test";
import assert from "node:assert/strict";
import { createSession } from "../src/runtime/bootstrap.js";

test("generated league exposes unique randomized team names and player body data", () => {
  const session = createSession({ seed: 3030, startYear: 2026, controlledTeamId: "BUF" });
  const teamNames = session.league.teams.map((team) => team.name);
  const teamAbbrevs = session.league.teams.map((team) => team.abbrev);
  assert.equal(new Set(teamNames).size, teamNames.length);
  assert.equal(new Set(teamAbbrevs).size, teamAbbrevs.length);
  assert.ok(teamAbbrevs.every((abbrev) => typeof abbrev === "string" && abbrev.length >= 2 && abbrev.length <= 4));
  assert.ok(session.league.teams.some((team) => team.abbrev !== team.id));

  const setup = session.getSetupState();
  assert.equal(setup.teams.length, session.league.teams.length);
  assert.ok(setup.teams.every((team) => team.abbrev));

  const player = session.league.players[0];
  assert.ok(Number.isFinite(player.heightInches));
  assert.ok(Number.isFinite(player.weightLbs));
  assert.ok(player.heightInches >= 68);
  assert.ok(player.weightLbs >= 170);

  const profile = session.getPlayerProfile(player.id);
  assert.ok(Number.isFinite(profile.player.heightInches));
  assert.ok(Number.isFinite(profile.player.weightLbs));
});
