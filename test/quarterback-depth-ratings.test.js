import test from "node:test";
import assert from "node:assert/strict";
import { normalizePfrPlayers } from "../src/data/pfrAdapter.js";
import { createSyntheticPlayer } from "../src/domain/playerFactory.js";
import { RNG } from "../src/utils/rng.js";

test("generated quarterbacks carry depth-based accuracy ratings", () => {
  const rng = new RNG(20260312);
  const qb = createSyntheticPlayer({ teamId: "BUF", position: "QB", year: 2026, rng });

  assert.equal(typeof qb.ratings.throwAccuracyShort, "number");
  assert.equal(typeof qb.ratings.throwAccuracyMedium, "number");
  assert.equal(typeof qb.ratings.throwAccuracyDeep, "number");
  assert.ok(qb.ratings.throwAccuracyShort >= qb.ratings.throwAccuracyDeep - 6);
});

test("imported PFR quarterbacks derive depth-based accuracy ratings", () => {
  const rng = new RNG(20260312);
  const [qb] = normalizePfrPlayers(
    [
      {
        player_id: "allenjo02",
        player: "Example QB",
        pos: "QB",
        tm: "BUF",
        age: 29,
        pass_att: 570,
        pass_cmp: 378,
        pass_yds: 4210
      }
    ],
    rng,
    2026
  );

  assert.ok(qb);
  assert.equal(qb.position, "QB");
  assert.equal(typeof qb.ratings.throwAccuracyShort, "number");
  assert.equal(typeof qb.ratings.throwAccuracyMedium, "number");
  assert.equal(typeof qb.ratings.throwAccuracyDeep, "number");
  assert.ok(qb.overall >= 70);
});
