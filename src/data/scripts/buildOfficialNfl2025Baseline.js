import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { PFR_RECENT_WEIGHTED_PROFILE } from "../../stats/profiles/pfrRecentWeightedProfile.js";

const OUTPUT_PATH = "output/official-nfl-2025-baseline.json";
const YEAR = 2025;

const CATEGORY_URLS = {
  passing: {
    url: `https://www.nfl.com/stats/player-stats/category/passing/${YEAR}/reg/all/passingyards/desc`,
    maxPages: 24
  },
  rushing: {
    url: `https://www.nfl.com/stats/player-stats/category/rushing/${YEAR}/reg/all/rushingyards/desc`,
    maxPages: 28
  },
  receiving: {
    url: `https://www.nfl.com/stats/player-stats/category/receiving/${YEAR}/reg/all/receivingyards/desc`,
    maxPages: 28
  },
  tackles: {
    url: `https://www.nfl.com/stats/player-stats/category/tackles/${YEAR}/reg/all/defensivecombinetackles/desc`,
    maxPages: 30
  },
  interceptions: {
    url: `https://www.nfl.com/stats/player-stats/category/interceptions/${YEAR}/reg/all/defensiveinterceptions/desc`,
    maxPages: 20
  },
  fieldGoals: {
    url: `https://www.nfl.com/stats/player-stats/category/field-goals/${YEAR}/reg/all/kickingfgmade/desc`,
    maxPages: 4
  },
  punts: {
    url: `https://www.nfl.com/stats/player-stats/category/punts/${YEAR}/reg/all/puntingpunts/desc`,
    maxPages: 4
  }
};

const DEPTH_BY_POSITION = {
  QB: 1,
  RB: 2,
  WR: 3,
  TE: 1,
  DL: 4,
  LB: 3,
  DB: 4,
  K: 1,
  P: 1
};

const POSITION_GROUPS = {
  DL: new Set(["DE", "DT", "NT", "DL"]),
  LB: new Set(["LB", "ILB", "MLB", "OLB"]),
  DB: new Set(["CB", "DB", "FS", "SS", "S"]),
  RB: new Set(["RB", "FB"])
};

function fetchText(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects < 5) {
            resolve(fetchText(new URL(res.headers.location, url).toString(), redirects + 1));
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`Request failed ${res.statusCode} for ${url}`));
            return;
          }
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => resolve(data));
        }
      )
      .on("error", reject);
  });
}

function decodeHtml(text) {
  return String(text || "")
    .replace(/&#x2B;/g, "+")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(html) {
  return decodeHtml(String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function toNumber(value) {
  if (value == null) return 0;
  const normalized = String(value).replace(/,/g, "").trim();
  if (!normalized) return 0;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
}

function playerSlugFromHref(href) {
  return href?.match(/\/players\/([^/]+)\//i)?.[1] || null;
}

function parseLeaderboardPage(html) {
  const headerHtml = html.match(/<thead>([\s\S]*?)<\/thead>/i)?.[1] || "";
  const bodyHtml = html.match(/<tbody>([\s\S]*?)<\/tbody>/i)?.[1] || "";
  const headers = [...headerHtml.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((match) => stripHtml(match[1]));
  const rows = [...bodyHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].map((match) => {
    const cells = [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => cell[1]);
    const href = cells[0]?.match(/href="([^"]+)"/i)?.[1] || null;
    return {
      slug: playerSlugFromHref(href),
      player: stripHtml(cells[0] || ""),
      href,
      values: cells.slice(1).map(stripHtml)
    };
  });
  const nextHref = html.match(/<a href="([^"]+)" class="nfl-o-table-pagination__next"/i)?.[1] || null;
  return {
    headers,
    rows,
    nextUrl: nextHref ? new URL(nextHref, "https://www.nfl.com").toString() : null
  };
}

function mapLeaderboardRows(headers, rows) {
  const statHeaders = headers.slice(1);
  return rows
    .filter((row) => row.slug)
    .map((row) => {
      const stats = {};
      for (let i = 0; i < statHeaders.length; i += 1) stats[statHeaders[i]] = row.values[i] ?? "";
      return { ...row, stats };
    });
}

async function fetchAllLeaderboardRows(name, { url, maxPages }) {
  const rows = [];
  let nextUrl = url;
  let page = 0;
  const seenUrls = new Set();
  const seenSignatures = new Set();
  while (nextUrl && page < maxPages) {
    if (seenUrls.has(nextUrl)) break;
    seenUrls.add(nextUrl);
    page += 1;
    const html = await fetchText(nextUrl);
    const parsed = parseLeaderboardPage(html);
    const signature = `${parsed.rows[0]?.slug || "none"}:${parsed.rows[parsed.rows.length - 1]?.slug || "none"}`;
    if (seenSignatures.has(signature)) break;
    seenSignatures.add(signature);
    rows.push(...mapLeaderboardRows(parsed.headers, parsed.rows));
    nextUrl = parsed.nextUrl;
    console.log(`[baseline] ${name} page ${page}: +${parsed.rows.length} rows`);
  }
  return rows;
}

function normalizePosition(rawPosition) {
  const pos = String(rawPosition || "").trim().toUpperCase();
  if (POSITION_GROUPS.RB.has(pos)) return "RB";
  if (POSITION_GROUPS.DL.has(pos)) return "DL";
  if (POSITION_GROUPS.LB.has(pos)) return "LB";
  if (POSITION_GROUPS.DB.has(pos)) return "DB";
  if (pos === "PK") return "K";
  return pos;
}

function parseCareerTable(html) {
  const match = [
    ...html.matchAll(
      /<div class="nfl-t-stats__title">\s*<h3 class="d3-o-section-sub-title">\s*([\s\S]*?)\s*<\/h3>[\s\S]*?<table summary="Career Stats"[\s\S]*?<thead>([\s\S]*?)<\/thead>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>[\s\S]*?<\/table>/gi
    )
  ][0];
  if (!match) return null;
  const headers = [...match[2].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((item) => stripHtml(item[1]));
  const rows = [...match[3].matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].map((rowMatch) =>
    [...rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => stripHtml(cell[1]))
  );
  return { title: stripHtml(match[1]), headers, rows };
}

function parsePlayerStatsPage(html) {
  const position = normalizePosition(html.match(/<span class="nfl-c-player-header__position">\s*([^<]+)\s*<\/span>/i)?.[1] || "");
  const table = parseCareerTable(html);
  if (!position || !table) return null;
  const yearRow = table.rows.find((row) => Number(row[0]) === YEAR);
  if (!yearRow) return null;
  return {
    position,
    team: yearRow[1] || stripHtml(html.match(/nfl-c-player-header__team[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i)?.[1] || ""),
    tableTitle: table.title,
    seasonRow: yearRow
  };
}

function getRowMap(rows) {
  return new Map(rows.map((row) => [row.slug, row]));
}

function buildCandidate(slug, statsPage, tables) {
  const position = statsPage.position;
  const team = statsPage.team;
  const row = statsPage.seasonRow;
  if (!position || !team || !row) return null;

  if (position === "QB" && tables.passing.has(slug)) {
    const pass = tables.passing.get(slug).stats;
    return {
      slug,
      position,
      team,
      games: toNumber(row[2]),
      gamesStarted: toNumber(row[3]),
      primarySort: toNumber(pass.Att),
      metrics: {
        "passing.att": toNumber(pass.Att),
        "passing.cmp": toNumber(pass.Cmp),
        "passing.yards": toNumber(pass["Pass Yds"]),
        "passing.td": toNumber(pass.TD),
        "passing.int": toNumber(pass.INT),
        "passing.sacks": toNumber(pass.Sck),
        "rushing.att": toNumber(row[13]),
        "rushing.yards": toNumber(row[14]),
        "rushing.td": toNumber(row[16])
      }
    };
  }

  if (position === "RB" && tables.rushing.has(slug)) {
    const rush = tables.rushing.get(slug).stats;
    const rec = tables.receiving.get(slug)?.stats || {};
    return {
      slug,
      position,
      team,
      games: toNumber(row[2]),
      gamesStarted: toNumber(row[3]),
      primarySort: toNumber(rush.Att),
      metrics: {
        "rushing.att": toNumber(rush.Att),
        "rushing.yards": toNumber(rush["Rush Yds"]),
        "rushing.td": toNumber(rush.TD),
        "receiving.targets": toNumber(rec.Tgts),
        "receiving.rec": toNumber(row[8]),
        "receiving.yards": toNumber(row[9]),
        "receiving.td": toNumber(row[12])
      }
    };
  }

  if ((position === "WR" || position === "TE") && tables.receiving.has(slug)) {
    const rec = tables.receiving.get(slug).stats;
    return {
      slug,
      position,
      team,
      games: toNumber(row[2]),
      gamesStarted: toNumber(row[3]),
      primarySort: toNumber(rec.Tgts),
      metrics: {
        "receiving.targets": toNumber(rec.Tgts),
        "receiving.rec": toNumber(rec.Rec),
        "receiving.yards": toNumber(rec.Yds),
        "receiving.td": toNumber(rec.TD)
      }
    };
  }

  if (["DL", "LB", "DB"].includes(position) && (tables.tackles.has(slug) || tables.interceptions.has(slug))) {
    return {
      slug,
      position,
      team,
      games: toNumber(row[2]),
      gamesStarted: toNumber(row[3]),
      primarySort: toNumber(row[6]),
      metrics: {
        "defense.tackles": toNumber(row[6]),
        "defense.sacks": toNumber(row[8]),
        "defense.passDefended": toNumber(row[10]),
        "defense.int": toNumber(row[11])
      }
    };
  }

  if (position === "K" && tables.fieldGoals.has(slug)) {
    const kicking = tables.fieldGoals.get(slug).stats;
    return {
      slug,
      position,
      team,
      games: toNumber(row[2]),
      gamesStarted: toNumber(row[3]),
      primarySort: toNumber(kicking.Att),
      metrics: {
        "kicking.fga": toNumber(kicking.Att),
        "kicking.fgm": toNumber(kicking.FGM),
        "kicking.xpa": toNumber(row[9]),
        "kicking.xpm": toNumber(row[10])
      }
    };
  }

  if (position === "P" && tables.punts.has(slug)) {
    const punts = tables.punts.get(slug).stats;
    return {
      slug,
      position,
      team,
      games: toNumber(row[2]),
      gamesStarted: toNumber(row[3]),
      primarySort: toNumber(punts.Punts),
      metrics: {
        "punting.punts": toNumber(punts.Punts),
        "punting.yards": toNumber(punts.Yds),
        "punting.in20": toNumber(punts["IN 20"])
      }
    };
  }

  return null;
}

function averageMetrics(selected, fallbackMetrics) {
  const output = {};
  for (const metric of Object.keys(fallbackMetrics || {})) {
    if (!selected.length) {
      output[metric] = fallbackMetrics[metric];
      continue;
    }
    const average = selected.reduce((sum, player) => sum + (player.metrics[metric] || 0), 0) / selected.length;
    output[metric] = Number(average.toFixed(2));
  }
  return output;
}

function selectByTeam(players, depth) {
  const byTeam = new Map();
  for (const player of players) {
    if (!byTeam.has(player.team)) byTeam.set(player.team, []);
    byTeam.get(player.team).push(player);
  }
  const selected = [];
  const coverage = {};
  for (const [team, teamPlayers] of byTeam.entries()) {
    const top = teamPlayers
      .slice()
      .sort(
        (a, b) =>
          b.gamesStarted - a.gamesStarted ||
          b.games - a.games ||
          b.primarySort - a.primarySort ||
          a.slug.localeCompare(b.slug)
      )
      .slice(0, depth);
    coverage[team] = top.length;
    selected.push(...top);
  }
  return { selected, coverage };
}

async function fetchPlayerStatsPages(slugs) {
  const results = new Map();
  const queue = [...slugs];
  const concurrency = 10;

  async function worker() {
    while (queue.length) {
      const slug = queue.shift();
      const html = await fetchText(`https://www.nfl.com/players/${slug}/stats/`);
      const parsed = parsePlayerStatsPage(html);
      if (parsed) results.set(slug, parsed);
      if (results.size % 100 === 0) console.log(`[baseline] parsed ${results.size} player stats pages`);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

async function main() {
  const tableRows = {};
  for (const [name, config] of Object.entries(CATEGORY_URLS)) tableRows[name] = await fetchAllLeaderboardRows(name, config);

  const allSlugs = new Set();
  for (const rows of Object.values(tableRows)) {
    for (const row of rows) if (row.slug) allSlugs.add(row.slug);
  }

  console.log(`[baseline] unique player pages: ${allSlugs.size}`);
  const statsPages = await fetchPlayerStatsPages(allSlugs);

  const tables = {
    passing: getRowMap(tableRows.passing),
    rushing: getRowMap(tableRows.rushing),
    receiving: getRowMap(tableRows.receiving),
    tackles: getRowMap(tableRows.tackles),
    interceptions: getRowMap(tableRows.interceptions),
    fieldGoals: getRowMap(tableRows.fieldGoals),
    punts: getRowMap(tableRows.punts)
  };

  const candidatesByPosition = {
    QB: [],
    RB: [],
    WR: [],
    TE: [],
    DL: [],
    LB: [],
    DB: [],
    K: [],
    P: []
  };

  for (const [slug, statsPage] of statsPages.entries()) {
    const candidate = buildCandidate(slug, statsPage, tables);
    if (candidate && candidatesByPosition[candidate.position]) candidatesByPosition[candidate.position].push(candidate);
  }

  const profile = JSON.parse(JSON.stringify(PFR_RECENT_WEIGHTED_PROFILE));
  profile.meta = {
    source: "Official NFL 2025 starter-qualified baseline",
    generatedAt: new Date().toISOString(),
    season: YEAR,
    note:
      "Built from official NFL 2025 player tables plus official player season pages for starts and missing fields. Legacy export name is retained for compatibility."
  };

  const coverageByPosition = {};
  const sampleSizeByPosition = {};
  for (const [position, depth] of Object.entries(DEPTH_BY_POSITION)) {
    const { selected, coverage } = selectByTeam(candidatesByPosition[position] || [], depth);
    coverageByPosition[position] = coverage;
    sampleSizeByPosition[position] = selected.length;
    profile.positions[position].metrics = averageMetrics(selected, profile.positions[position].metrics);
  }

  const payload = {
    profile,
    sampleSizeByPosition,
    coverageByPosition
  };

  const outputPath = path.resolve(OUTPUT_PATH);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`[baseline] wrote ${outputPath}`);
  console.log(JSON.stringify(sampleSizeByPosition, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
