import test from "node:test";
import assert from "node:assert/strict";
import { createSession } from "../src/runtime/bootstrap.js";

test("generated league keeps 90+ overall players rare across core seeds", () => {
  const seeds = [20260311, 20260312, 20260313, 20260314];

  for (const seed of seeds) {
    const session = createSession({ seed, startYear: 2026, controlledTeamId: "BUF" });
    const players = session.league.players.filter((player) => player.status === "active" && player.teamId !== "FA");
    const byPosition = {};
    let elite90 = 0;
    let elite95 = 0;

    for (const player of players) {
      if (!byPosition[player.position]) byPosition[player.position] = { elite90: 0, elite95: 0 };
      if (player.overall >= 90) {
        elite90 += 1;
        byPosition[player.position].elite90 += 1;
      }
      if (player.overall >= 95) {
        elite95 += 1;
        byPosition[player.position].elite95 += 1;
      }
    }

    assert.ok(elite90 <= 12, `seed ${seed} generated too many 90+ players: ${elite90}`);
    assert.equal(elite95, 0, `seed ${seed} generated 95+ players`);
    assert.equal(byPosition.RB?.elite90 || 0, 0, `seed ${seed} generated elite RB inflation`);
    assert.equal(byPosition.WR?.elite90 || 0, 0, `seed ${seed} generated elite WR inflation`);
    assert.equal(byPosition.DL?.elite90 || 0, 0, `seed ${seed} generated elite DL inflation`);
    assert.equal(byPosition.LB?.elite90 || 0, 0, `seed ${seed} generated elite LB inflation`);
    assert.ok((byPosition.OL?.elite90 || 0) <= 10, `seed ${seed} generated too many elite OL: ${byPosition.OL?.elite90 || 0}`);
  }
});
