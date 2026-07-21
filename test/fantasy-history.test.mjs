import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { HALL_OF_LOSERS } from "../lib/fantasy-history/hall-of-losers.js";
import {
  getDefaultSortDirection,
  sortOwners,
} from "../lib/fantasy-history/sort-owners.js";
import {
  assertUniqueSleeperOwners,
  resolveSleeperOwner,
  SLEEPER_USERS,
} from "../lib/fantasy-history/sleeper-users.js";

const data = JSON.parse(
  await readFile(
    new URL("../lib/fantasy-history/data.generated.json", import.meta.url),
    "utf8",
  ),
);
const ownerById = new Map(data.owners.map((owner) => [owner.id, owner]));
const seasonByYear = new Map(
  data.seasons.map((season) => [season.year, season]),
);

test("sorts all-time standings by the selected column and direction", () => {
  assert.equal(getDefaultSortDirection("titles"), "desc");
  assert.equal(getDefaultSortDirection("manager"), "asc");

  const byTitles = sortOwners(data.owners, "titles", "desc");
  assert.equal(byTitles[0].championships, 2);
  assert.equal(byTitles[1].championships, 2);
  assert.ok(byTitles[0].wins >= byTitles[1].wins);

  const byManager = sortOwners(data.owners, "manager", "asc");
  assert.deepEqual(
    byManager.slice(0, 3).map((owner) => owner.name),
    ["Alessandro", "Alex", "Christian"],
  );

  const numericSorts = {
    seasons: "seasons",
    wins: "wins",
    winPct: "winPct",
    points: "pointsFor",
    average: "averagePoints",
    playoffs: "playoffs",
    titles: "championships",
    sackos: "sackos",
  };

  for (const [sortBy, field] of Object.entries(numericSorts)) {
    for (const direction of ["asc", "desc"]) {
      const sorted = sortOwners(data.owners, sortBy, direction);
      const multiplier = direction === "asc" ? 1 : -1;
      assert.ok(
        sorted.every(
          (owner, index) =>
            index === 0 ||
            (owner[field] - sorted[index - 1][field]) * multiplier >= 0,
        ),
        `${sortBy} ${direction}`,
      );
    }
  }
});

test("combines all 13 league seasons", () => {
  assert.equal(data.league.name, "Couch Quarterbacks");
  assert.equal(data.league.firstSeason, 2013);
  assert.equal(data.league.lastSeason, 2025);
  assert.equal(data.league.seasonCount, 13);
  assert.equal(data.league.managerCount, 17);
  assert.equal(data.league.activeManagerCount, 12);
  assert.equal(data.league.regularSeasonGames, 1036);
  assert.equal(data.league.allGames, 1212);
});

test("preserves the verified championship timeline", () => {
  const expected = new Map([
    [2013, "johnny"],
    [2014, "peter-ho"],
    [2015, "johnny"],
    [2016, "alex"],
    [2017, "neil"],
    [2018, "kevin"],
    [2019, "greg"],
    [2020, "ryan"],
    [2021, "ryan"],
    [2022, "alex"],
    [2023, "daniel"],
    [2024, "mike-c"],
    [2025, "marc"],
  ]);

  for (const [year, ownerId] of expected) {
    assert.equal(seasonByYear.get(year).champion, ownerId, `${year} champion`);
  }
});

test("keeps Peter and Peter Ho as separate franchises", () => {
  const peter = ownerById.get("peter");
  const peterHo = ownerById.get("peter-ho");

  assert.equal(peter.name, "Peter");
  assert.equal(peter.seasons, 13);
  assert.equal(peter.wins, 99);
  assert.equal(peter.championships, 0);

  assert.equal(peterHo.name, "Peter Ho");
  assert.equal(peterHo.firstSeason, 2014);
  assert.equal(peterHo.seasons, 12);
  assert.equal(peterHo.championships, 1);
  assert.deepEqual(peterHo.championshipYears, [2014]);
});

test("includes Mike C in 2024 and Marc in 2025", () => {
  const mike = ownerById.get("mike-c");
  const daniel = ownerById.get("daniel");
  const marc = ownerById.get("marc");

  assert.equal(mike.firstSeason, 2024);
  assert.equal(mike.seasons, 2);
  assert.equal(mike.active, true);
  assert.equal(mike.championships, 1);
  assert.deepEqual(mike.championshipYears, [2024]);
  assert.equal(daniel.championships, 1);
  assert.deepEqual(daniel.championshipYears, [2023]);
  assert.equal(marc.firstSeason, 2025);
  assert.equal(marc.seasons, 1);
  assert.equal(marc.championships, 1);
  assert.equal(data.league.currentChampion, "marc");
  assert.equal(data.league.currentSacko, "david");
  assert.equal(data.league.currentSackoYear, 2025);
  assert.equal(data.league.currentSackoTeam, "Drake It ’Til You Make It");
});

test("maps every Sleeper account to its verified manager", () => {
  assert.deepEqual(SLEEPER_USERS, {
    "604165721953472512": { displayName: "petetheheat", ownerId: "peter" },
    "76435275316084736": { displayName: "paddles4", ownerId: "ryan" },
    "1123778934836965376": { displayName: "dcolavita", ownerId: "david" },
    "1123779230791340032": { displayName: "maldini311", ownerId: "daniel" },
    "616545753615147008": { displayName: "kjwong", ownerId: "kevin" },
    "1123808195807461376": { displayName: "Colavita65", ownerId: "mike-c" },
    "1124965013485232128": { displayName: "peterho", ownerId: "peter-ho" },
    "1126910781263564800": { displayName: "acattarozzi", ownerId: "alex" },
    "1127280736630960128": { displayName: "Greggie79", ownerId: "greg" },
    "604890311470153728": {
      displayName: "SandroFootball87",
      ownerId: "alessandro",
    },
    "1132309588071776256": { displayName: "neilraina", ownerId: "neil" },
    "1133567014829707264": { displayName: "bigolbutts", ownerId: "michael" },
    "869067929629687808": {
      displayName: "Marccappuccitti",
      ownerId: "marc",
    },
  });

  assert.equal(
    resolveSleeperOwner("1123779230791340032", "maldini311"),
    "daniel",
  );
  assert.throws(
    () => resolveSleeperOwner("unknown", "unknown"),
    /Unknown Sleeper user/,
  );
  assert.throws(
    () => resolveSleeperOwner("1123779230791340032", "changed-name"),
    /Sleeper display name changed/,
  );
  assert.doesNotThrow(() =>
    assertUniqueSleeperOwners(["daniel", "michael", "mike-c"], 2025),
  );
  assert.throws(
    () => assertUniqueSleeperOwners(["daniel", "michael", "daniel"], 2025),
    /Duplicate canonical Sleeper owner in 2025: daniel/,
  );
});

test("preserves every Sleeper roster's source identity", () => {
  const expected = new Map([
    [
      2024,
      [
        [1, "604165721953472512", "petetheheat", "peter"],
        [2, "76435275316084736", "paddles4", "ryan"],
        [3, "1123778934836965376", "dcolavita", "david"],
        [4, "1123779230791340032", "maldini311", "daniel"],
        [5, "616545753615147008", "kjwong", "kevin"],
        [6, "1123808195807461376", "Colavita65", "mike-c"],
        [7, "1124965013485232128", "peterho", "peter-ho"],
        [8, "1126910781263564800", "acattarozzi", "alex"],
        [9, "1127280736630960128", "Greggie79", "greg"],
        [10, "604890311470153728", "SandroFootball87", "alessandro"],
        [11, "1132309588071776256", "neilraina", "neil"],
        [12, "1133567014829707264", "bigolbutts", "michael"],
      ],
    ],
    [
      2025,
      [
        [1, "604165721953472512", "petetheheat", "peter"],
        [2, "76435275316084736", "paddles4", "ryan"],
        [3, "1123778934836965376", "dcolavita", "david"],
        [4, "1123779230791340032", "maldini311", "daniel"],
        [5, "616545753615147008", "kjwong", "kevin"],
        [6, "1123808195807461376", "Colavita65", "mike-c"],
        [7, "1124965013485232128", "peterho", "peter-ho"],
        [8, "1126910781263564800", "acattarozzi", "alex"],
        [9, "1127280736630960128", "Greggie79", "greg"],
        [10, "869067929629687808", "Marccappuccitti", "marc"],
        [11, "1132309588071776256", "neilraina", "neil"],
        [12, "1133567014829707264", "bigolbutts", "michael"],
      ],
    ],
  ]);

  for (const [year, rosters] of expected) {
    const actual = [...seasonByYear.get(year).teams]
      .sort((left, right) => left.rosterId - right.rosterId)
      .map((team) => [
        team.rosterId,
        team.sleeperUserId,
        team.sleeperDisplayName,
        team.ownerId,
      ]);
    assert.deepEqual(actual, rosters, `${year} Sleeper rosters`);
  }
});

test("keeps Mike C, Daniel, and Michael on the correct Sleeper rosters", () => {
  const expected = new Map([
    [
      2024,
      {
        "mike-c": {
          rosterId: 6,
          teamName: "Kyren On My Wayward Son",
          wins: 10,
          losses: 4,
          finalRank: 1,
        },
        daniel: {
          rosterId: 4,
          teamName: "Christian NoCalfrey",
          wins: 5,
          losses: 9,
          finalRank: 12,
        },
        michael: {
          rosterId: 12,
          teamName: "uOttawa Oily Orifices",
          wins: 2,
          losses: 12,
          finalRank: 7,
        },
      },
    ],
    [
      2025,
      {
        "mike-c": {
          rosterId: 6,
          teamName: "Omarion’s Bucky Charms",
          wins: 7,
          losses: 7,
          finalRank: 7,
        },
        daniel: {
          rosterId: 4,
          teamName: "Davante’s Inferno",
          wins: 10,
          losses: 4,
          finalRank: 4,
        },
        michael: {
          rosterId: 12,
          teamName: "uOttawa Oily Orifices",
          wins: 5,
          losses: 9,
          finalRank: 10,
        },
      },
    ],
  ]);

  for (const [year, owners] of expected) {
    const season = seasonByYear.get(year);
    for (const [ownerId, record] of Object.entries(owners)) {
      const team = season.teams.find((candidate) => candidate.ownerId === ownerId);
      assert.deepEqual(
        {
          rosterId: team.rosterId,
          teamName: team.teamName,
          wins: team.wins,
          losses: team.losses,
          finalRank: team.finalRank,
        },
        record,
        `${year} ${ownerId}`,
      );
    }
  }

  assert.equal(seasonByYear.get(2024).sacko, "daniel");
  assert.equal(seasonByYear.get(2025).pointsLeader, "daniel");
  assert.equal(ownerById.get("daniel").currentTeamName, "Davante’s Inferno");
  assert.equal(ownerById.get("michael").currentTeamName, "uOttawa Oily Orifices");
  assert.deepEqual(
    {
      wins: ownerById.get("daniel").wins,
      losses: ownerById.get("daniel").losses,
      pointsFor: ownerById.get("daniel").pointsFor,
      playoffs: ownerById.get("daniel").playoffs,
      sackos: ownerById.get("daniel").sackos,
    },
    { wins: 68, losses: 94, pointsFor: 15150.07, playoffs: 4, sackos: 1 },
  );
  assert.deepEqual(
    {
      wins: ownerById.get("michael").wins,
      losses: ownerById.get("michael").losses,
      pointsFor: ownerById.get("michael").pointsFor,
      playoffs: ownerById.get("michael").playoffs,
      sackos: ownerById.get("michael").sackos,
    },
    { wins: 73, losses: 102, pointsFor: 16421.33, playoffs: 3, sackos: 2 },
  );
});

test("every season has a complete final-order permutation", () => {
  for (const season of data.seasons) {
    assert.equal(season.teams.length, season.teamCount);
    assert.deepEqual(
      season.teams.map((team) => team.finalRank),
      Array.from({ length: season.teamCount }, (_, index) => index + 1),
      `${season.year} final ranks`,
    );
  }
});

test("uses the actual four-team playoff field in 2013", () => {
  assert.equal(seasonByYear.get(2013).playoffTeams, 4);
  assert.equal(ownerById.get("alessandro").playoffs, 6);
});

test("career standings balance wins, losses, points for, and points against", () => {
  const totals = data.owners.reduce(
    (result, owner) => ({
      wins: result.wins + owner.wins,
      losses: result.losses + owner.losses,
      pointsFor: result.pointsFor + owner.pointsFor,
      pointsAgainst: result.pointsAgainst + owner.pointsAgainst,
    }),
    { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
  );

  assert.equal(totals.wins, totals.losses);
  assert.ok(Math.abs(totals.pointsFor - totals.pointsAgainst) < 0.01);
  assert.equal(totals.wins, data.league.regularSeasonGames);
});

test("record book matches source-verified weekly results", () => {
  assert.deepEqual(
    {
      owner: data.records.highestScore.ownerId,
      score: data.records.highestScore.score,
      year: data.records.highestScore.year,
      week: data.records.highestScore.week,
    },
    { owner: "peter-ho", score: 196.58, year: 2024, week: 14 },
  );
  assert.equal(data.records.closestWin.margin, 0.02);
  assert.equal(data.records.closestWin.winnerId, "peter");
  assert.equal(data.records.closestWin.loserId, "greg");
  assert.equal(data.records.biggestBlowout.margin, 97.28);
  assert.equal(data.records.bestSeason.ownerId, "neil");
  assert.equal(data.records.bestSeason.wins, 12);
  assert.equal(data.records.longestWinStreak.ownerId, "alex");
  assert.equal(data.records.longestWinStreak.count, 10);
});

test("head-to-head series account for every official matchup", () => {
  const gamesInSeries = data.headToHead.reduce(
    (sum, series) => sum + series.games,
    0,
  );
  assert.equal(gamesInSeries, data.league.allGames);
  for (const series of data.headToHead) {
    assert.equal(series.winsA + series.winsB + series.ties, series.games);
  }

  const danielVsMichael = data.headToHead.find(
    (series) => series.id === "daniel::michael",
  );
  assert.deepEqual(
    {
      ownerA: danielVsMichael.ownerA,
      winsA: danielVsMichael.winsA,
      ownerB: danielVsMichael.ownerB,
      winsB: danielVsMichael.winsB,
    },
    { ownerA: "daniel", winsA: 12, ownerB: "michael", winsB: 7 },
  );
});

test("records every season in the Hall of Losers", () => {
  assert.deepEqual(
    HALL_OF_LOSERS.map((entry) => entry.year),
    Array.from({ length: 13 }, (_, index) => 2025 - index),
  );

  for (const entry of HALL_OF_LOSERS) {
    assert.ok(ownerById.has(entry.ownerId), `${entry.year} owner`);
    assert.ok(entry.punishment, `${entry.year} punishment`);
    assert.equal(
      seasonByYear.get(entry.year).sacko,
      entry.ownerId,
      `${entry.year} Sacko`,
    );
  }
});

test("uses punishment photos only for the supplied seasons", () => {
  const photoYears = HALL_OF_LOSERS.filter((entry) => entry.image).map(
    (entry) => entry.year,
  );
  assert.deepEqual(
    photoYears,
    [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2015],
  );

  assert.equal(
    HALL_OF_LOSERS.find((entry) => entry.year === 2024).ownerId,
    "daniel",
  );
  assert.equal(
    HALL_OF_LOSERS.find((entry) => entry.year === 2024).image,
    "/fantasy-football/hall-of-losers/2024-beer-mile-v2.jpg",
  );
  assert.equal(
    HALL_OF_LOSERS.find((entry) => entry.year === 2016).punishment,
    "Team name and photo set by the winner, Al",
  );
});
