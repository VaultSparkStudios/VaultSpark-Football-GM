import test from "node:test";
import assert from "node:assert/strict";
import { createSession } from "../src/runtime/bootstrap.js";
import { PFR_RECENT_WEIGHTED_PROFILE } from "../src/stats/profiles/pfrRecentWeightedProfile.js";

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

  const qbMetrics = PFR_RECENT_WEIGHTED_PROFILE.positions.QB.metrics;
  const rbMetrics = PFR_RECENT_WEIGHTED_PROFILE.positions.RB.metrics;
  const wrMetrics = PFR_RECENT_WEIGHTED_PROFILE.positions.WR.metrics;
  const teMetrics = PFR_RECENT_WEIGHTED_PROFILE.positions.TE.metrics;
  const dbMetrics = PFR_RECENT_WEIGHTED_PROFILE.positions.DB.metrics;
  const kMetrics = PFR_RECENT_WEIGHTED_PROFILE.positions.K.metrics;
  const qbCmpPct = qbMetrics["passing.cmp"] / Math.max(1, qbMetrics["passing.att"]);

  assert.ok(Math.abs(avg(qbs, "att") - qbMetrics["passing.att"]) <= 45);
  assert.ok(Math.abs(avg(qbs, "yds") - qbMetrics["passing.yards"]) <= 325);
  assert.ok(Math.abs(avg(qbs, "cmp") / avg(qbs, "att") - qbCmpPct) <= 0.03);
  assert.ok(Math.abs(avg(rbs, "att") - rbMetrics["rushing.att"]) <= 18);
  assert.ok(Math.abs(avg(rbs, "yds") - rbMetrics["rushing.yards"]) <= 60);
  assert.ok(Math.abs(avg(wrs, "tgt") - wrMetrics["receiving.targets"]) <= 8);
  assert.ok(Math.abs(avg(wrs, "rec") - wrMetrics["receiving.rec"]) <= 6);
  assert.ok(Math.abs(avg(wrs, "yds") - wrMetrics["receiving.yards"]) <= 65);
  assert.ok(Math.abs(avg(tes, "tgt") - teMetrics["receiving.targets"]) <= 8);
  assert.ok(Math.abs(avg(tes, "yds") - teMetrics["receiving.yards"]) <= 55);
  assert.ok(Math.abs(avg(tes, "td") - teMetrics["receiving.td"]) <= 1);
  assert.ok(Math.abs(avg(dbs, "int") - dbMetrics["defense.int"]) <= 0.6);
  assert.ok(Math.abs(avg(dbs, "pd") - dbMetrics["defense.passDefended"]) <= 1.5);
  assert.ok(Math.abs(avg(ks, "fga") - kMetrics["kicking.fga"]) <= 4);
  assert.ok(Math.abs(avg(ks, "xpa") - kMetrics["kicking.xpa"]) <= 6);
});
