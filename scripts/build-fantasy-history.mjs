import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_FILE = path.join(
  ROOT,
  "lib/fantasy-history/data.generated.json",
);
const NFL_REPO_URL = "https://github.com/PeteTheHeat/FF-Scraping";
const NFL_RAW_BASE =
  "https://raw.githubusercontent.com/PeteTheHeat/FF-Scraping/master/output";
const NFL_LOCAL_ROOT = process.env.FF_SCRAPING_DIR
  ? path.resolve(process.env.FF_SCRAPING_DIR)
  : null;

const NFL_SEASONS = Array.from({ length: 11 }, (_, index) => 2013 + index);
const SLEEPER_LEAGUES = [
  { year: 2024, leagueId: "1123769832219975680" },
  { year: 2025, leagueId: "1257419329926877184" },
];

const OWNER_CATALOG = {
  peter: { name: "Peter", shortName: "Peter", color: "#f4bd50" },
  ryan: { name: "Ryan", shortName: "Ryan", color: "#6fb0ff" },
  david: {
    name: "David",
    shortName: "Dave",
    color: "#e98765",
    image: "/fantasy-football/dave-sacko.jpg",
  },
  michael: { name: "Michael", shortName: "Michael", color: "#72c59c" },
  kevin: { name: "Kevin", shortName: "Kevin", color: "#cf8cff" },
  daniel: { name: "Daniel", shortName: "Daniel", color: "#ff7f9f" },
  "peter-ho": { name: "Peter Ho", shortName: "Peter Ho", color: "#56c7d9" },
  alex: { name: "Alex", shortName: "Alex", color: "#9dcf61" },
  greg: { name: "Greg", shortName: "Greg", color: "#f08fb0" },
  alessandro: {
    name: "Alessandro",
    shortName: "Alessandro",
    color: "#fb9b53",
  },
  neil: { name: "Neil", shortName: "Neil", color: "#8f9dff" },
  "mike-c": { name: "Mike C", shortName: "Mike C", color: "#4fc6a4" },
  marc: {
    name: "Marc",
    shortName: "Marc",
    color: "#ffc95e",
    image: "/fantasy-football/marc-champion.png",
  },
  jeremy: { name: "Jeremy", shortName: "Jeremy", color: "#de9073" },
  raed: { name: "Raed", shortName: "Raed", color: "#8bb7e8" },
  christian: {
    name: "Christian",
    shortName: "Christian",
    color: "#c2a4ef",
  },
  johnny: { name: "Johnny", shortName: "Johnny", color: "#f07777" },
};

const NFL_NAME_MAP = {
  Peter: "peter",
  Peter2: "peter-ho",
  Ryan: "ryan",
  david: "david",
  michael: "michael",
  Kevin: "kevin",
  Daniel: "daniel",
  alex: "alex",
  Greg: "greg",
  Alessandro: "alessandro",
  Neil: "neil",
  Jeremy: "jeremy",
  Raed: "raed",
  christian: "christian",
  johnny: "johnny",
};

// NFL.com weekly exports label both Peters as "Peter". Rows are emitted in a
// stable source team-id order, which is the only lossless identity key in the
// scraped weekly files.
function nflTeamOwners(year) {
  const ids = [
    "peter",
    "david",
    year <= 2014 ? "daniel" : "ryan",
    "alex",
    "alessandro",
    year <= 2015 ? "johnny" : "daniel",
    year <= 2015 ? "christian" : "neil",
    "michael",
    "kevin",
    year <= 2016 ? "raed" : "jeremy",
  ];

  if (year >= 2014) {
    ids.push("peter-ho", "greg");
  }

  return ids;
}

const SLEEPER_USER_MAP = {
  "604165721953472512": "peter",
  "76435275316084736": "ryan",
  "1123778934836965376": "david",
  "1123779230791340032": "michael",
  "616545753615147008": "kevin",
  "1123808195807461376": "mike-c",
  "1124965013485232128": "peter-ho",
  "1126910781263564800": "alex",
  "1127280736630960128": "greg",
  "604890311470153728": "alessandro",
  "1132309588071776256": "neil",
  "1133567014829707264": "daniel",
  "869067929629687808": "marc",
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows.filter((candidate) => candidate.some((value) => value !== ""));
}

function parseNumber(value) {
  const parsed = Number(String(value ?? "").replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function scoreFromSleeper(settings, prefix) {
  return round(
    Number(settings[prefix] ?? 0) +
      Number(settings[`${prefix}_decimal`] ?? 0) / 100,
  );
}

function parseRecord(record) {
  const [wins, losses, ties] = record.split("-").map(Number);
  return { wins, losses, ties };
}

function initials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "peterargany-fantasy-history-builder" },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url));
}

async function readNflArtifact(relativePath) {
  if (NFL_LOCAL_ROOT) {
    const outputRoot = NFL_LOCAL_ROOT.endsWith("output")
      ? NFL_LOCAL_ROOT
      : path.join(NFL_LOCAL_ROOT, "output");
    return readFile(path.join(outputRoot, relativePath), "utf8");
  }

  return fetchText(`${NFL_RAW_BASE}/${relativePath}`);
}

function nflSeasonShape(year) {
  if (year === 2013) {
    return { regularWeeks: 14, totalWeeks: 16 };
  }
  if (year <= 2020) {
    return { regularWeeks: 13, totalWeeks: 16 };
  }
  return { regularWeeks: 14, totalWeeks: 17 };
}

async function buildNflSeason(year) {
  const standingsRelative = `1609009-history-standings/${year}.csv`;
  const standingsRows = parseCsv(await readNflArtifact(standingsRelative));
  const headers = standingsRows[0];
  const headerIndex = Object.fromEntries(
    headers.map((header, index) => [header, index]),
  );
  const teams = standingsRows.slice(1).map((row) => {
    const ownerId = NFL_NAME_MAP[row[headerIndex.ManagerName]];
    if (!ownerId) {
      throw new Error(
        `Unknown NFL manager ${row[headerIndex.ManagerName]} in ${year}`,
      );
    }
    const record = parseRecord(row[headerIndex.Record]);

    return {
      ownerId,
      teamName: row[headerIndex.TeamName],
      regularSeasonRank: Number(row[headerIndex.RegularSeasonRank]),
      finalRank: Number(row[headerIndex.PlayoffRank]),
      ...record,
      pointsFor: parseNumber(row[headerIndex.PointsFor]),
      pointsAgainst: parseNumber(row[headerIndex.PointsAgainst]),
      moves: parseNumber(row[headerIndex.Moves]) ?? 0,
      trades: parseNumber(row[headerIndex.Trades]) ?? 0,
      draftPosition: parseNumber(row[headerIndex.DraftPosition]),
    };
  });

  const { regularWeeks, totalWeeks } = nflSeasonShape(year);
  const teamOwners = nflTeamOwners(year);
  const matchups = [];

  for (let week = 1; week <= totalWeeks; week += 1) {
    const relativePath = `1609009-history-teamgamecenter/${year}/${week}.csv`;
    const rows = parseCsv(await readNflArtifact(relativePath));
    const headersForWeek = rows[0];
    const totalIndex = headersForWeek.lastIndexOf("Total");
    const opponentIndex = headersForWeek.length - 2;
    const opponentTotalIndex = headersForWeek.length - 1;
    const parsedRows = rows.slice(1).map((row, index) => ({
      sourceTeamId: index + 1,
      ownerId: teamOwners[index],
      rawOwner: row[0],
      rawOpponent: row[opponentIndex],
      score: parseNumber(row[totalIndex]),
      opponentScore: parseNumber(row[opponentTotalIndex]),
    }));
    const used = new Set();

    for (let rowIndex = 0; rowIndex < parsedRows.length; rowIndex += 1) {
      if (used.has(rowIndex)) continue;
      const first = parsedRows[rowIndex];
      if (
        !first.ownerId ||
        first.rawOpponent === "-" ||
        first.score === null ||
        first.opponentScore === null
      ) {
        used.add(rowIndex);
        continue;
      }

      const opponentRowIndex = parsedRows.findIndex((candidate, index) => {
        if (index === rowIndex || used.has(index)) return false;
        return (
          candidate.score === first.opponentScore &&
          candidate.opponentScore === first.score &&
          candidate.rawOwner.toLowerCase() ===
            first.rawOpponent.toLowerCase() &&
          candidate.rawOpponent.toLowerCase() === first.rawOwner.toLowerCase()
        );
      });

      if (opponentRowIndex === -1) {
        throw new Error(
          `Could not pair NFL matchup ${year} week ${week}, team ${first.sourceTeamId}`,
        );
      }

      used.add(rowIndex);
      used.add(opponentRowIndex);
      const second = parsedRows[opponentRowIndex];
      matchups.push({
        year,
        week,
        phase: week > regularWeeks ? "playoffs" : "regular",
        ownerA: first.ownerId,
        ownerB: second.ownerId,
        scoreA: first.score,
        scoreB: second.score,
        source: "NFL.com",
      });
    }
  }

  return {
    year,
    source: "NFL.com",
    sourceLabel: "NFL.com archive",
    sourceUrl: `${NFL_REPO_URL}/tree/master/output`,
    leagueId: "1609009",
    teamCount: teams.length,
    regularWeeks,
    totalWeeks,
    playoffTeams: year === 2013 ? 4 : 6,
    teams,
    matchups,
  };
}

function playoffPlacements(bracket, type, teamCount) {
  const placements = new Map();
  const first = bracket.find((matchup) => matchup.p === 1);
  const third = bracket.find((matchup) => matchup.p === 3);
  const fifth = bracket.find((matchup) => matchup.p === 5);

  if (!first || !third || !fifth) {
    throw new Error("Sleeper playoff bracket is missing placement games");
  }

  if (type === "winners") {
    placements.set(first.w, 1);
    placements.set(first.l, 2);
    placements.set(third.w, 3);
    placements.set(third.l, 4);
    placements.set(fifth.w, 5);
    placements.set(fifth.l, 6);
  } else if (type === "toilet") {
    placements.set(first.w, teamCount);
    placements.set(first.l, teamCount - 1);
    placements.set(third.w, teamCount - 2);
    placements.set(third.l, teamCount - 3);
    placements.set(fifth.w, teamCount - 4);
    placements.set(fifth.l, teamCount - 5);
  } else {
    placements.set(first.w, 7);
    placements.set(first.l, 8);
    placements.set(third.w, 9);
    placements.set(third.l, 10);
    placements.set(fifth.w, 11);
    placements.set(fifth.l, 12);
  }

  return placements;
}

async function buildSleeperSeason({ year, leagueId }) {
  const base = `https://api.sleeper.app/v1/league/${leagueId}`;
  const [league, users, rosters, winnersBracket, losersBracket] =
    await Promise.all([
      fetchJson(base),
      fetchJson(`${base}/users`),
      fetchJson(`${base}/rosters`),
      fetchJson(`${base}/winners_bracket`),
      fetchJson(`${base}/losers_bracket`),
    ]);
  const usersById = new Map(users.map((user) => [user.user_id, user]));
  const rosterOwner = new Map();

  for (const roster of rosters) {
    const ownerId = SLEEPER_USER_MAP[roster.owner_id];
    if (!ownerId) {
      throw new Error(
        `Unknown Sleeper owner ${roster.owner_id} in ${year}`,
      );
    }
    rosterOwner.set(roster.roster_id, ownerId);
  }

  const teamCount = Number(league.settings.num_teams);
  const playoffPlaces = playoffPlacements(
    winnersBracket,
    "winners",
    teamCount,
  );
  const lowerPlaces = playoffPlacements(
    losersBracket,
    Number(league.settings.playoff_type) === 0 ? "toilet" : "consolation",
    teamCount,
  );
  const finalPlaces = new Map([...playoffPlaces, ...lowerPlaces]);
  const rankedRosters = [...rosters].sort((left, right) => {
    if (right.settings.wins !== left.settings.wins) {
      return right.settings.wins - left.settings.wins;
    }
    return (
      scoreFromSleeper(right.settings, "fpts") -
      scoreFromSleeper(left.settings, "fpts")
    );
  });
  const regularRanks = new Map(
    rankedRosters.map((roster, index) => [roster.roster_id, index + 1]),
  );
  const teams = rosters.map((roster) => {
    const user = usersById.get(roster.owner_id);
    return {
      ownerId: rosterOwner.get(roster.roster_id),
      rosterId: roster.roster_id,
      teamName: user?.metadata?.team_name || user?.display_name || "Untitled team",
      regularSeasonRank: regularRanks.get(roster.roster_id),
      finalRank: finalPlaces.get(roster.roster_id),
      wins: Number(roster.settings.wins ?? 0),
      losses: Number(roster.settings.losses ?? 0),
      ties: Number(roster.settings.ties ?? 0),
      pointsFor: scoreFromSleeper(roster.settings, "fpts"),
      pointsAgainst: scoreFromSleeper(roster.settings, "fpts_against"),
      moves: null,
      trades: null,
      draftPosition: null,
    };
  });
  const totalWeeks = Number(league.settings.last_scored_leg ?? 17);
  const regularWeeks = Number(league.settings.playoff_week_start) - 1;
  const weekPayloads = await Promise.all(
    Array.from({ length: totalWeeks }, (_, index) =>
      fetchJson(`${base}/matchups/${index + 1}`),
    ),
  );
  const matchups = [];

  for (let weekIndex = 0; weekIndex < weekPayloads.length; weekIndex += 1) {
    const week = weekIndex + 1;
    const groups = new Map();
    for (const roster of weekPayloads[weekIndex]) {
      if (roster.matchup_id === null || roster.matchup_id === undefined) continue;
      const group = groups.get(roster.matchup_id) ?? [];
      group.push(roster);
      groups.set(roster.matchup_id, group);
    }

    for (const [matchupId, pair] of groups) {
      if (pair.length !== 2) {
        throw new Error(
          `Unexpected Sleeper matchup size in ${year} week ${week}, matchup ${matchupId}`,
        );
      }
      const [first, second] = pair;
      matchups.push({
        year,
        week,
        phase: week > regularWeeks ? "playoffs" : "regular",
        ownerA: rosterOwner.get(first.roster_id),
        ownerB: rosterOwner.get(second.roster_id),
        scoreA: round(first.custom_points ?? first.points),
        scoreB: round(second.custom_points ?? second.points),
        source: "Sleeper",
      });
    }
  }

  return {
    year,
    source: "Sleeper",
    sourceLabel: "Sleeper API",
    sourceUrl: `https://sleeper.com/leagues/${leagueId}/league`,
    leagueId,
    teamCount,
    regularWeeks,
    totalWeeks,
    playoffTeams: Number(league.settings.playoff_teams),
    lowerBracket:
      Number(league.settings.playoff_type) === 0 ? "toilet" : "consolation",
    teams,
    matchups,
  };
}

function compareSeasonPerformance(left, right) {
  const leftGames = left.wins + left.losses + left.ties;
  const rightGames = right.wins + right.losses + right.ties;
  const leftPct = (left.wins + left.ties * 0.5) / leftGames;
  const rightPct = (right.wins + right.ties * 0.5) / rightGames;
  return (
    rightPct - leftPct ||
    right.wins - left.wins ||
    right.pointsFor - left.pointsFor
  );
}

function buildDerivedData(seasons) {
  const owners = new Map();
  const matchups = seasons
    .flatMap((season) => season.matchups)
    .sort((left, right) => left.year - right.year || left.week - right.week);

  function ensureOwner(ownerId) {
    if (!owners.has(ownerId)) {
      const catalog = OWNER_CATALOG[ownerId];
      if (!catalog) throw new Error(`Missing owner catalog entry for ${ownerId}`);
      owners.set(ownerId, {
        id: ownerId,
        ...catalog,
        initials: initials(catalog.name),
        seasons: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        championships: 0,
        runnerUps: 0,
        playoffs: 0,
        sackos: 0,
        firstSeason: null,
        lastSeason: null,
        bestFinish: null,
        worstFinish: null,
        championshipYears: [],
        teamNames: [],
      });
    }
    return owners.get(ownerId);
  }

  for (const season of seasons) {
    for (const team of season.teams) {
      const owner = ensureOwner(team.ownerId);
      owner.seasons += 1;
      owner.wins += team.wins;
      owner.losses += team.losses;
      owner.ties += team.ties;
      owner.pointsFor += team.pointsFor;
      owner.pointsAgainst += team.pointsAgainst;
      owner.championships += team.finalRank === 1 ? 1 : 0;
      owner.runnerUps += team.finalRank === 2 ? 1 : 0;
      owner.playoffs += team.finalRank <= season.playoffTeams ? 1 : 0;
      owner.sackos += team.finalRank === season.teamCount ? 1 : 0;
      owner.firstSeason = owner.firstSeason ?? season.year;
      owner.lastSeason = season.year;
      owner.bestFinish =
        owner.bestFinish === null
          ? team.finalRank
          : Math.min(owner.bestFinish, team.finalRank);
      owner.worstFinish =
        owner.worstFinish === null
          ? team.finalRank
          : Math.max(owner.worstFinish, team.finalRank);
      if (team.finalRank === 1) owner.championshipYears.push(season.year);
      if (team.teamName && !owner.teamNames.includes(team.teamName)) {
        owner.teamNames.push(team.teamName);
      }
    }
  }

  const h2h = new Map();
  const ownerGames = new Map();
  let highestScore = null;
  let lowestScore = null;
  let biggestBlowout = null;
  let closestWin = null;
  let highestCombined = null;

  for (const matchup of matchups) {
    ensureOwner(matchup.ownerA);
    ensureOwner(matchup.ownerB);
    const entries = [
      { ownerId: matchup.ownerA, score: matchup.scoreA },
      { ownerId: matchup.ownerB, score: matchup.scoreB },
    ];

    for (const entry of entries) {
      const opponentId =
        entry.ownerId === matchup.ownerA ? matchup.ownerB : matchup.ownerA;
      const opponentScore =
        entry.ownerId === matchup.ownerA ? matchup.scoreB : matchup.scoreA;
      const game = {
        year: matchup.year,
        week: matchup.week,
        phase: matchup.phase,
        ownerId: entry.ownerId,
        opponentId,
        score: entry.score,
        opponentScore,
        result:
          entry.score > opponentScore
            ? "W"
            : entry.score < opponentScore
              ? "L"
              : "T",
      };
      const games = ownerGames.get(entry.ownerId) ?? [];
      games.push(game);
      ownerGames.set(entry.ownerId, games);

      if (!highestScore || entry.score > highestScore.score) highestScore = game;
      if (!lowestScore || entry.score < lowestScore.score) lowestScore = game;
    }

    const margin = round(Math.abs(matchup.scoreA - matchup.scoreB));
    const combined = round(matchup.scoreA + matchup.scoreB);
    const winnerId =
      matchup.scoreA > matchup.scoreB
        ? matchup.ownerA
        : matchup.scoreB > matchup.scoreA
          ? matchup.ownerB
          : null;
    const loserId = winnerId
      ? winnerId === matchup.ownerA
        ? matchup.ownerB
        : matchup.ownerA
      : null;
    const recordGame = {
      year: matchup.year,
      week: matchup.week,
      phase: matchup.phase,
      ownerA: matchup.ownerA,
      ownerB: matchup.ownerB,
      scoreA: matchup.scoreA,
      scoreB: matchup.scoreB,
      margin,
      combined,
      winnerId,
      loserId,
    };
    if (!biggestBlowout || margin > biggestBlowout.margin) {
      biggestBlowout = recordGame;
    }
    if (margin > 0 && (!closestWin || margin < closestWin.margin)) {
      closestWin = recordGame;
    }
    if (!highestCombined || combined > highestCombined.combined) {
      highestCombined = recordGame;
    }

    const ids = [matchup.ownerA, matchup.ownerB].sort();
    const key = ids.join("::");
    const series = h2h.get(key) ?? {
      id: key,
      ownerA: ids[0],
      ownerB: ids[1],
      winsA: 0,
      winsB: 0,
      ties: 0,
      pointsA: 0,
      pointsB: 0,
      games: 0,
      meetings: [],
      biggestWin: null,
    };
    const scoreA =
      matchup.ownerA === series.ownerA ? matchup.scoreA : matchup.scoreB;
    const scoreB =
      matchup.ownerB === series.ownerB ? matchup.scoreB : matchup.scoreA;
    series.games += 1;
    series.pointsA += scoreA;
    series.pointsB += scoreB;
    if (scoreA > scoreB) series.winsA += 1;
    else if (scoreB > scoreA) series.winsB += 1;
    else series.ties += 1;
    series.meetings.push({
      year: matchup.year,
      week: matchup.week,
      phase: matchup.phase,
      scoreA,
      scoreB,
    });
    if (!series.biggestWin || margin > series.biggestWin.margin) {
      series.biggestWin = {
        year: matchup.year,
        week: matchup.week,
        phase: matchup.phase,
        margin,
        winnerId,
        scoreA,
        scoreB,
      };
    }
    h2h.set(key, series);
  }

  let longestWinStreak = null;
  for (const [ownerId, games] of ownerGames) {
    let current = 0;
    let currentStart = null;
    for (const game of games) {
      if (game.result === "W") {
        current += 1;
        currentStart = currentStart ?? game;
        if (!longestWinStreak || current > longestWinStreak.count) {
          longestWinStreak = {
            ownerId,
            count: current,
            start: { year: currentStart.year, week: currentStart.week },
            end: { year: game.year, week: game.week },
          };
        }
      } else {
        current = 0;
        currentStart = null;
      }
    }
  }

  const latestSeason = Math.max(...seasons.map((season) => season.year));
  const ownerList = [...owners.values()].map((owner) => {
    const games = owner.wins + owner.losses + owner.ties;
    return {
      ...owner,
      pointsFor: round(owner.pointsFor),
      pointsAgainst: round(owner.pointsAgainst),
      winPct: round((owner.wins + owner.ties * 0.5) / games, 4),
      averagePoints: round(owner.pointsFor / games),
      active: owner.lastSeason === latestSeason,
      currentTeamName: owner.teamNames.at(-1),
    };
  });
  ownerList.sort(
    (left, right) =>
      right.wins - left.wins ||
      right.winPct - left.winPct ||
      right.championships - left.championships,
  );
  ownerList.forEach((owner, index) => {
    owner.allTimeRank = index + 1;
  });

  const compactSeasonTeams = seasons.flatMap((season) =>
    season.teams.map((team) => ({ ...team, year: season.year })),
  );
  const bestSeason = [...compactSeasonTeams].sort(compareSeasonPerformance)[0];
  const mostSeasonPoints = [...compactSeasonTeams].sort(
    (left, right) => right.pointsFor - left.pointsFor,
  )[0];
  const currentSeason = seasons.find((season) => season.year === latestSeason);
  const currentChampion = currentSeason.teams.find(
    (team) => team.finalRank === 1,
  );
  const currentSacko = currentSeason.teams.find(
    (team) => team.finalRank === currentSeason.teamCount,
  );

  const compactSeasons = seasons
    .map((season) => {
      const sortedTeams = [...season.teams].sort(
        (left, right) => left.finalRank - right.finalRank,
      );
      const champion = sortedTeams[0];
      const runnerUp = sortedTeams[1];
      const sacko = sortedTeams.at(-1);
      const pointsLeader = [...season.teams].sort(
        (left, right) => right.pointsFor - left.pointsFor,
      )[0];
      return {
        year: season.year,
        teamCount: season.teamCount,
        regularWeeks: season.regularWeeks,
        playoffTeams: season.playoffTeams,
        champion: champion.ownerId,
        runnerUp: runnerUp.ownerId,
        sacko: sacko.ownerId,
        pointsLeader: pointsLeader.ownerId,
        pointsLeaderTotal: pointsLeader.pointsFor,
        teams: sortedTeams,
      };
    })
    .sort((left, right) => right.year - left.year);

  const seriesList = [...h2h.values()].map((series) => ({
    ...series,
    pointsA: round(series.pointsA),
    pointsB: round(series.pointsB),
    meetings: series.meetings.slice(-6).reverse(),
  }));
  seriesList.sort(
    (left, right) =>
      right.games - left.games ||
      Math.abs(left.winsA - left.winsB) - Math.abs(right.winsA - right.winsB),
  );

  return {
    league: {
      name: "Couch Quarterbacks",
      firstSeason: Math.min(...seasons.map((season) => season.year)),
      lastSeason: latestSeason,
      seasonCount: seasons.length,
      managerCount: ownerList.length,
      activeManagerCount: ownerList.filter((owner) => owner.active).length,
      regularSeasonGames: Math.round(
        ownerList.reduce(
          (sum, owner) => sum + owner.wins + owner.losses + owner.ties,
          0,
        ) / 2,
      ),
      allGames: matchups.length,
      regularSeasonPoints: round(
        seasons.reduce(
          (sum, season) =>
            sum + season.teams.reduce((total, team) => total + team.pointsFor, 0),
          0,
        ),
      ),
      currentChampion: currentChampion.ownerId,
      currentChampionTeam: currentChampion.teamName,
      currentChampionYear: latestSeason,
      currentSacko: currentSacko.ownerId,
      currentSackoTeam: currentSacko.teamName,
      currentSackoYear: latestSeason,
    },
    owners: ownerList,
    seasons: compactSeasons,
    headToHead: seriesList,
    records: {
      highestScore,
      lowestScore,
      biggestBlowout,
      closestWin,
      highestCombined,
      longestWinStreak,
      bestSeason: { ...bestSeason },
      mostSeasonPoints: { ...mostSeasonPoints },
    },
  };
}

async function main() {
  const nflSeasons = [];
  for (const year of NFL_SEASONS) {
    nflSeasons.push(await buildNflSeason(year));
  }
  const sleeperSeasons = [];
  for (const league of SLEEPER_LEAGUES) {
    sleeperSeasons.push(await buildSleeperSeason(league));
  }
  const data = buildDerivedData([...nflSeasons, ...sleeperSeasons]);
  await writeFile(OUTPUT_FILE, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${OUTPUT_FILE} with ${data.league.seasonCount} seasons, ${data.league.managerCount} managers, and ${data.league.allGames} games.`,
  );
}

await main();
