import test from "node:test";
import assert from "node:assert/strict";
import { createSession } from "../src/runtime/bootstrap.js";

function avg(rows, key) {
  return rows.reduce((sum, row) => sum + (row[key] || 0), 0) / Math.max(1, rows.length);
}

function starterQualifiedSample(rows, depthPerTeam, primaryKey) {
  const byTeam = new Map();
  for (const row of rows) {
    if (!byTeam.has(row.tm)) byTeam.set(row.tm, []);
    byTeam.get(row.tm).push(row);
  }
  return [...byTeam.values()].flatMap((teamRows) =>
    teamRows
      .slice()
      .sort((a, b) => (b.gs || 0) - (a.gs || 0) || (b.g || 0) - (a.g || 0) || (b[primaryKey] || 0) - (a[primaryKey] || 0))
      .slice(0, depthPerTeam)
  );
}

test("career stat rows keep actual games for per-game calculations", () => {
  const session = createSession({ seed: 20260312, startYear: 2026, controlledTeamId: "BUF" });
  session.simulateSeasons(2, { runOffseasonAfterLast: false });
  const qb = session.statBook.getPlayerCareerTable("passing", { position: "QB" })[0];
  assert.ok(qb);
  assert.ok(qb.g > qb.seasons);
  assert.ok(qb.gs > 0);
});

test("starter-qualified season averages stay near weighted baselines", () => {
  const session = createSession({ seed: 20260312, startYear: 2026, controlledTeamId: "BUF" });
  session.simulateSeasons(1, { runOffseasonAfterLast: false });
  const year = 2026;
  const seasonType = "regular";

  const qbs = starterQualifiedSample(
    session.statBook.getPlayerSeasonTable("passing", { year, position: "QB", seasonType }),
    1,
    "att"
  );
  const rbs = starterQualifiedSample(
    session.statBook.getPlayerSeasonTable("rushing", { year, position: "RB", seasonType }),
    2,
    "att"
  );
  const wrs = starterQualifiedSample(
    session.statBook.getPlayerSeasonTable("receiving", { year, position: "WR", seasonType }),
    3,
    "tgt"
  );
  const tes = starterQualifiedSample(
    session.statBook.getPlayerSeasonTable("receiving", { year, position: "TE", seasonType }),
    1,
    "tgt"
  );
  const dbs = starterQualifiedSample(
    session.statBook.getPlayerSeasonTable("defense", { year, position: "DB", seasonType }),
    4,
    "tkl"
  );
  const ks = starterQualifiedSample(
    session.statBook.getPlayerSeasonTable("kicking", { year, position: "K", seasonType }),
    1,
    "fga"
  );

  assert.ok(Math.abs(avg(qbs, "att") - 534) <= 45);
  assert.ok(Math.abs(avg(qbs, "yds") - 3850) <= 325);
  assert.ok(Math.abs(avg(qbs, "cmp") / avg(qbs, "att") - 0.65) <= 0.03);
  assert.ok(Math.abs(avg(rbs, "att") - 162) <= 18);
  assert.ok(Math.abs(avg(rbs, "yds") - 708) <= 60);
  assert.ok(Math.abs(avg(wrs, "tgt") - 88) <= 8);
  assert.ok(Math.abs(avg(wrs, "rec") - 58) <= 6);
  assert.ok(Math.abs(avg(wrs, "yds") - 761) <= 65);
  assert.ok(Math.abs(avg(tes, "tgt") - 77) <= 8);
  assert.ok(Math.abs(avg(tes, "yds") - 578) <= 55);
  assert.ok(Math.abs(avg(tes, "td") - 4) <= 1);
  assert.ok(Math.abs(avg(dbs, "int") - 2.1) <= 0.6);
  assert.ok(Math.abs(avg(dbs, "pd") - 10.2) <= 1.5);
  assert.ok(Math.abs(avg(ks, "fga") - 34) <= 4);
  assert.ok(Math.abs(avg(ks, "xpa") - 37) <= 6);
});
