import test from "node:test";
import assert from "node:assert/strict";
import { normalizePfrPlayers } from "../src/data/pfrAdapter.js";
import { createSyntheticPlayer } from "../src/domain/playerFactory.js";
import { coverageDepthRating } from "../src/domain/ratings.js";
import { RNG } from "../src/utils/rng.js";

test("generated defensive players carry depth-based coverage ratings", () => {
  const rng = new RNG(20260313);
  const db = createSyntheticPlayer({ teamId: "BUF", position: "DB", year: 2026, rng });
  const lb = createSyntheticPlayer({ teamId: "BUF", position: "LB", year: 2026, rng });

  assert.equal(typeof db.ratings.coverageShort, "number");
  assert.equal(typeof db.ratings.coverageMedium, "number");
  assert.equal(typeof db.ratings.coverageDeep, "number");
  assert.equal(typeof lb.ratings.coverageShort, "number");
  assert.equal(typeof lb.ratings.coverageMedium, "number");
  assert.equal(typeof lb.ratings.coverageDeep, "number");
  assert.ok(db.ratings.coverageDeep >= db.ratings.coverageShort - 14);
  assert.ok(lb.ratings.coverageShort >= lb.ratings.coverageDeep - 8);
});

test("imported defensive backs derive depth-based coverage ratings", () => {
  const rng = new RNG(20260313);
  const [db] = normalizePfrPlayers(
    [
      {
        player_id: "exampledb01",
        player: "Example DB",
        pos: "CB",
        tm: "BUF",
        age: 26,
        tackles: 68,
        interceptions: 4,
        pass_defended: 14
      }
    ],
    rng,
    2026
  );

  assert.ok(db);
  assert.equal(db.position, "DB");
  assert.equal(typeof db.ratings.coverageShort, "number");
  assert.equal(typeof db.ratings.coverageMedium, "number");
  assert.equal(typeof db.ratings.coverageDeep, "number");
  assert.ok(coverageDepthRating(db.ratings, "deep") >= 55);
});
