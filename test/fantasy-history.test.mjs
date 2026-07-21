import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { HALL_OF_LOSERS } from "../lib/fantasy-history/hall-of-losers.js";

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

test("keeps Mike C and Daniel attached to the correct recent-season rosters", () => {
  const expected = new Map([
    [
      2024,
      {
        "mike-c": { rosterId: 6, wins: 10, losses: 4, finalRank: 1 },
        daniel: { rosterId: 12, wins: 2, losses: 12, finalRank: 7 },
      },
    ],
    [
      2025,
      {
        "mike-c": { rosterId: 6, wins: 7, losses: 7, finalRank: 7 },
        daniel: { rosterId: 12, wins: 5, losses: 9, finalRank: 10 },
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
          wins: team.wins,
          losses: team.losses,
          finalRank: team.finalRank,
        },
        record,
        `${year} ${ownerId}`,
      );
    }
  }
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
});

test("records every season in the Hall of Losers", () => {
  assert.deepEqual(
    HALL_OF_LOSERS.map((entry) => entry.year),
    Array.from({ length: 13 }, (_, index) => 2025 - index),
  );

  for (const entry of HALL_OF_LOSERS) {
    assert.ok(ownerById.has(entry.ownerId), `${entry.year} owner`);
    assert.ok(entry.punishment, `${entry.year} punishment`);
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
    HALL_OF_LOSERS.find((entry) => entry.year === 2016).punishment,
    "Team name and photo set by the winner, Al",
  );
});
