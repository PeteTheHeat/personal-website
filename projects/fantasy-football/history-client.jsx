"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  Crown,
  Medal,
  Swords,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import { HALL_OF_LOSERS } from "./hall-of-losers";
import {
  getDefaultSortDirection,
  sortOwners,
} from "./sort-owners";

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});
const INTEGER_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
const PERCENT_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatNumber(value) {
  return NUMBER_FORMATTER.format(value);
}

function formatInteger(value) {
  return INTEGER_FORMATTER.format(value);
}

function formatPercent(value) {
  return PERCENT_FORMATTER.format(value);
}

function formatRecord(owner) {
  return `${owner.wins}-${owner.losses}${owner.ties ? `-${owner.ties}` : ""}`;
}

function formatSeasonRecord(team) {
  return `${team.wins}-${team.losses}${team.ties ? `-${team.ties}` : ""}`;
}

function phaseLabel(record) {
  return record.phase === "playoffs" ? "Playoffs" : "Regular season";
}

function OwnerMark({ owner, size = "normal" }) {
  return (
    <span
      className={`ff-owner-mark ff-owner-mark-${size}`}
      style={{ "--owner-color": owner.color }}
      aria-hidden="true"
    >
      {owner.initials}
    </span>
  );
}

function OwnerName({ owner, showStatus = false }) {
  return (
    <span className="ff-owner-name">
      <strong>{owner.name}</strong>
      {showStatus && !owner.active && <small>Alumni</small>}
    </span>
  );
}

function SackoName({ owner, children }) {
  if (owner.id !== "david") {
    return children;
  }

  return (
    <Link
      className="ff-sacko-tracker-link"
      href="/sacko-tracker"
      aria-label={`${children}, view the Sacko Tracker`}
    >
      {children}
    </Link>
  );
}

function SectionHeading({ eyebrow, title, copy, action }) {
  return (
    <header className="ff-section-heading">
      <div>
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        {copy && <span>{copy}</span>}
      </div>
      {action}
    </header>
  );
}

function PodiumCard({ owner, position }) {
  return (
    <article className={`ff-podium-card ff-podium-${position}`}>
      <span className="ff-podium-rank">0{position}</span>
      <OwnerMark owner={owner} size="large" />
      <div>
        <OwnerName owner={owner} />
        <p>{owner.currentTeamName}</p>
      </div>
      <strong className="ff-podium-wins">{owner.wins}</strong>
      <span className="ff-podium-label">career wins</span>
      <dl>
        <div>
          <dt>Win rate</dt>
          <dd>{formatPercent(owner.winPct)}</dd>
        </div>
        <div>
          <dt>Titles</dt>
          <dd>{owner.championships}</dd>
        </div>
        <div>
          <dt>Seasons</dt>
          <dd>{owner.seasons}</dd>
        </div>
      </dl>
    </article>
  );
}

function SortableHeader({
  children,
  sortKey,
  activeSort,
  sortDirection,
  onSort,
}) {
  const isActive = activeSort === sortKey;
  const SortIcon = isActive
    ? sortDirection === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <th
      scope="col"
      aria-sort={
        isActive
          ? sortDirection === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <button
        type="button"
        className={`ff-ranking-sort-button${isActive ? " is-active" : ""}`}
        onClick={() => onSort(sortKey)}
      >
        <span>{children}</span>
        <SortIcon aria-hidden="true" />
      </button>
    </th>
  );
}

function RankingTable({
  owners,
  sortBy,
  sortDirection,
  onSort,
}) {
  return (
    <>
      <div className="ff-ranking-table-wrap">
        <table className="ff-ranking-table">
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <SortableHeader
                sortKey="manager"
                activeSort={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
              >
                Manager
              </SortableHeader>
              <SortableHeader
                sortKey="seasons"
                activeSort={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
              >
                Seasons
              </SortableHeader>
              <SortableHeader
                sortKey="wins"
                activeSort={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
              >
                Record
              </SortableHeader>
              <SortableHeader
                sortKey="winPct"
                activeSort={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
              >
                Win %
              </SortableHeader>
              <SortableHeader
                sortKey="points"
                activeSort={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
              >
                Points for
              </SortableHeader>
              <SortableHeader
                sortKey="average"
                activeSort={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
              >
                Avg.
              </SortableHeader>
              <SortableHeader
                sortKey="playoffs"
                activeSort={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
              >
                Playoffs
              </SortableHeader>
              <SortableHeader
                sortKey="titles"
                activeSort={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
              >
                Titles
              </SortableHeader>
              <SortableHeader
                sortKey="sackos"
                activeSort={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
              >
                Last
              </SortableHeader>
            </tr>
          </thead>
          <tbody>
            {owners.map((owner, index) => (
              <tr key={owner.id}>
                <td>
                  <span className="ff-table-rank">{index + 1}</span>
                </td>
                <th scope="row">
                  <span className="ff-table-owner">
                    <OwnerMark owner={owner} size="small" />
                    <OwnerName owner={owner} showStatus />
                  </span>
                </th>
                <td>{owner.seasons}</td>
                <td>{formatRecord(owner)}</td>
                <td>{formatPercent(owner.winPct)}</td>
                <td>{formatNumber(owner.pointsFor)}</td>
                <td>{formatNumber(owner.averagePoints)}</td>
                <td>{owner.playoffs}</td>
                <td className="ff-table-titles">
                  {owner.championships > 0 && <Trophy aria-hidden="true" />}
                  {owner.championships}
                </td>
                <td>{owner.sackos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ff-mobile-rankings">
        {owners.map((owner, index) => (
          <article className="ff-mobile-ranking" key={owner.id}>
            <span className="ff-mobile-rank">{index + 1}</span>
            <OwnerMark owner={owner} size="small" />
            <div className="ff-mobile-owner">
              <OwnerName owner={owner} showStatus />
              <span>
                {owner.seasons} seasons · {owner.championships} title
                {owner.championships === 1 ? "" : "s"}
              </span>
            </div>
            <div className="ff-mobile-record">
              <strong>{owner.wins}</strong>
              <span>wins</span>
            </div>
            <dl>
              <div>
                <dt>Record</dt>
                <dd>{formatRecord(owner)}</dd>
              </div>
              <div>
                <dt>Win rate</dt>
                <dd>{formatPercent(owner.winPct)}</dd>
              </div>
              <div>
                <dt>Points</dt>
                <dd>{formatInteger(owner.pointsFor)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}

function RecordCard({ label, value, title, detail, meta, tone = "default" }) {
  return (
    <article className={`ff-record-card ff-record-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <h3>{title}</h3>
      <span>{detail}</span>
      <small>{meta}</small>
    </article>
  );
}

function ChampionshipCard({ season, ownerById }) {
  const champion = ownerById.get(season.champion);
  const runnerUp = ownerById.get(season.runnerUp);
  const championEntry = season.teams.find(
    (team) => team.ownerId === season.champion,
  );

  return (
    <article className="ff-champion-card">
      <header>
        <span>{season.year}</span>
      </header>
      <div className="ff-champion-trophy" aria-hidden="true">
        <Trophy />
      </div>
      <OwnerMark owner={champion} size="normal" />
      <h3>{champion.name}</h3>
      <p>{championEntry.teamName}</p>
      <dl>
        <div>
          <dt>Record</dt>
          <dd>{formatSeasonRecord(championEntry)}</dd>
        </div>
        <div>
          <dt>Runner-up</dt>
          <dd>{runnerUp.name}</dd>
        </div>
      </dl>
    </article>
  );
}

function ManagerSelect({ label, value, onChange, owners, excluded }) {
  return (
    <label className="ff-manager-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {owners.map((owner) => (
          <option key={owner.id} value={owner.id} disabled={owner.id === excluded}>
            {owner.name}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" />
    </label>
  );
}

function Rivalry({ data, ownerById }) {
  const [managerA, setManagerA] = useState("peter");
  const [managerB, setManagerB] = useState("alex");
  const series = useMemo(() => {
    const key = [managerA, managerB].sort().join("::");
    return data.headToHead.find((candidate) => candidate.id === key);
  }, [data.headToHead, managerA, managerB]);
  const first = ownerById.get(managerA);
  const second = ownerById.get(managerB);

  const controls = (
    <div className="ff-rivalry-controls">
      <ManagerSelect
        label="Manager one"
        value={managerA}
        onChange={setManagerA}
        owners={data.owners}
        excluded={managerB}
      />
      <span className="ff-versus-mark">VS</span>
      <ManagerSelect
        label="Manager two"
        value={managerB}
        onChange={setManagerB}
        owners={data.owners}
        excluded={managerA}
      />
    </div>
  );

  if (!series) {
    return (
      <div className="ff-rivalry-shell">
        {controls}
        <div className="ff-rivalry-empty" role="status">
          <Swords aria-hidden="true" />
          <h3>No meetings on the books</h3>
          <p>
            {first.name} and {second.name} never overlapped. Pick another manager
            to see another head-to-head history.
          </p>
        </div>
      </div>
    );
  }

  const managerAIsSeriesA = series.ownerA === managerA;
  const winsA = managerAIsSeriesA ? series.winsA : series.winsB;
  const winsB = managerAIsSeriesA ? series.winsB : series.winsA;
  const pointsA = managerAIsSeriesA ? series.pointsA : series.pointsB;
  const pointsB = managerAIsSeriesA ? series.pointsB : series.pointsA;
  const meetings = series.meetings.map((meeting) => ({
    ...meeting,
    scoreA: managerAIsSeriesA ? meeting.scoreA : meeting.scoreB,
    scoreB: managerAIsSeriesA ? meeting.scoreB : meeting.scoreA,
  }));
  const decidedGames = Math.max(1, winsA + winsB);

  return (
    <div className="ff-rivalry-shell">
      {controls}

      <div className="ff-rivalry-scoreboard">
        <div className="ff-rivalry-manager">
          <OwnerMark owner={first} size="large" />
          <div>
            <span>{first.name}</span>
            <strong>{winsA}</strong>
            <small>wins</small>
          </div>
        </div>
        <div className="ff-rivalry-center">
          <Swords aria-hidden="true" />
          <strong>{series.games}</strong>
          <span>meetings</span>
          {series.ties > 0 && <small>{series.ties} tied</small>}
        </div>
        <div className="ff-rivalry-manager ff-rivalry-manager-right">
          <OwnerMark owner={second} size="large" />
          <div>
            <span>{second.name}</span>
            <strong>{winsB}</strong>
            <small>wins</small>
          </div>
        </div>
      </div>

      <div
        className="ff-series-bar"
        aria-label={`${first.name} has ${winsA} wins and ${second.name} has ${winsB} wins`}
      >
        <span style={{ width: `${(winsA / decidedGames) * 100}%` }} />
        <span style={{ width: `${(winsB / decidedGames) * 100}%` }} />
      </div>

      <div className="ff-rivalry-facts">
        <div>
          <span>All-time points</span>
          <strong>{formatNumber(pointsA)}</strong>
          <small>{first.name}</small>
        </div>
        <div>
          <span>Series margin</span>
          <strong>{Math.abs(winsA - winsB)}</strong>
          <small>{winsA === winsB ? "Dead even" : "game difference"}</small>
        </div>
        <div>
          <span>All-time points</span>
          <strong>{formatNumber(pointsB)}</strong>
          <small>{second.name}</small>
        </div>
      </div>

      <section className="ff-recent-meetings" aria-labelledby="recent-meetings-title">
        <header>
          <h3 id="recent-meetings-title">Recent meetings</h3>
          <span>Regular season + playoffs</span>
        </header>
        <div>
          {meetings.map((meeting) => {
            const firstWon = meeting.scoreA > meeting.scoreB;
            const secondWon = meeting.scoreB > meeting.scoreA;
            return (
              <article key={`${meeting.year}-${meeting.week}`}>
                <p>
                  <span>{meeting.year}</span>
                  <small>
                    W{meeting.week} · {meeting.phase === "playoffs" ? "Playoffs" : "Regular"}
                  </small>
                </p>
                <strong className={firstWon ? "is-winner" : ""}>
                  {formatNumber(meeting.scoreA)}
                </strong>
                <span>–</span>
                <strong className={secondWon ? "is-winner" : ""}>
                  {formatNumber(meeting.scoreB)}
                </strong>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SeasonArchive({ seasons, ownerById }) {
  return (
    <div className="ff-season-list">
      {seasons.map((season, index) => {
        const champion = ownerById.get(season.champion);
        const runnerUp = ownerById.get(season.runnerUp);
        const sacko = ownerById.get(season.sacko);
        const pointsLeader = ownerById.get(season.pointsLeader);
        return (
          <details key={season.year} open={index === 0}>
            <summary>
              <span className="ff-season-year">{season.year}</span>
              <span className="ff-season-summary-champion">
                <Trophy aria-hidden="true" />
                <span>
                  <small>Champion</small>
                  <strong>{champion.name}</strong>
                </span>
              </span>
              <ChevronDown className="ff-season-chevron" aria-hidden="true" />
            </summary>
            <div className="ff-season-detail">
              <div className="ff-season-awards">
                <article>
                  <Crown aria-hidden="true" />
                  <span>Champion</span>
                  <strong>{champion.name}</strong>
                </article>
                <article>
                  <Medal aria-hidden="true" />
                  <span>Runner-up</span>
                  <strong>{runnerUp.name}</strong>
                </article>
                <article>
                  <ArrowRight aria-hidden="true" />
                  <span>Points leader</span>
                  <strong>{pointsLeader.name}</strong>
                  <small>{formatNumber(season.pointsLeaderTotal)}</small>
                </article>
                <article className="ff-season-last-place">
                  <span aria-hidden="true">💩</span>
                  <span>Last place</span>
                  <strong>
                    <SackoName owner={sacko}>{sacko.name}</SackoName>
                  </strong>
                </article>
              </div>

              <div className="ff-season-standings">
                <div className="ff-season-table-head">
                  <span>Finish</span>
                  <span>Manager</span>
                  <span>Record</span>
                  <span>PF</span>
                  <span>Regular</span>
                </div>
                {season.teams.map((team) => {
                  const owner = ownerById.get(team.ownerId);
                  return (
                    <div className="ff-season-team" key={team.ownerId}>
                      <span>{team.finalRank}</span>
                      <span>
                        <OwnerMark owner={owner} size="tiny" />
                        <span>
                          <strong>{owner.name}</strong>
                          <small>{team.teamName}</small>
                        </span>
                      </span>
                      <span>{formatSeasonRecord(team)}</span>
                      <span>{formatNumber(team.pointsFor)}</span>
                      <span>#{team.regularSeasonRank}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}

function HallOfLosers({ ownerById }) {
  return (
    <div className="ff-loser-grid">
      {HALL_OF_LOSERS.map((entry) => {
        const owner = ownerById.get(entry.ownerId);
        const hasNoPunishment = entry.punishment === "No punishment";

        return (
          <article className="ff-loser-card" key={entry.year}>
            <div className="ff-loser-media">
              {entry.image ? (
                <Image
                  className={entry.imageFit === "contain" ? "is-contain" : ""}
                  src={entry.image}
                  alt={entry.imageAlt}
                  fill
                  sizes="(max-width: 560px) 100vw, (max-width: 820px) 50vw, (max-width: 1080px) 33vw, 25vw"
                />
              ) : (
                <div className="ff-loser-placeholder">
                  <span aria-hidden="true">{hasNoPunishment ? "—" : "💩"}</span>
                  <strong>{hasNoPunishment ? "No punishment" : "No photo"}</strong>
                </div>
              )}
              <span className="ff-loser-year">{entry.year}</span>
            </div>

            <div className="ff-loser-copy">
              <div className="ff-loser-manager">
                <OwnerMark owner={owner} size="small" />
                <div>
                  <span>Sacko</span>
                  <h3>
                    <SackoName owner={owner}>{entry.displayName}</SackoName>
                  </h3>
                </div>
              </div>
              <p>{entry.punishment}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function FantasyHistory({ data }) {
  const [scope, setScope] = useState("all");
  const [sortBy, setSortBy] = useState("titles");
  const [sortDirection, setSortDirection] = useState("desc");
  const ownerById = useMemo(
    () => new Map(data.owners.map((owner) => [owner.id, owner])),
    [data.owners],
  );
  const reigningChampion = ownerById.get(data.league.currentChampion);
  const reigningSacko = ownerById.get(data.league.currentSacko);
  const winRateLeader = [...data.owners]
    .filter((owner) => owner.seasons >= 5)
    .sort((left, right) => right.winPct - left.winPct)[0];
  const topTitleCount = Math.max(
    ...data.owners.map((owner) => owner.championships),
  );
  const titleLeaders = data.owners.filter(
    (owner) => owner.championships === topTitleCount,
  );
  const rankingOwners = useMemo(() => {
    const filtered = data.owners.filter(
      (owner) => scope === "all" || owner.active,
    );
    return sortOwners(filtered, sortBy, sortDirection);
  }, [data.owners, scope, sortBy, sortDirection]);
  const handleSort = (nextSortBy) => {
    if (nextSortBy === sortBy) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(nextSortBy);
    setSortDirection(getDefaultSortDirection(nextSortBy));
  };
  const handleSortSelect = (event) => {
    const nextSortBy = event.target.value;
    setSortBy(nextSortBy);
    setSortDirection(getDefaultSortDirection(nextSortBy));
  };
  const records = data.records;
  const highScoreOwner = ownerById.get(records.highestScore.ownerId);
  const highScoreOpponent = ownerById.get(records.highestScore.opponentId);
  const lowScoreOwner = ownerById.get(records.lowestScore.ownerId);
  const lowScoreOpponent = ownerById.get(records.lowestScore.opponentId);
  const blowoutWinner = ownerById.get(records.biggestBlowout.winnerId);
  const blowoutLoser = ownerById.get(records.biggestBlowout.loserId);
  const closeWinner = ownerById.get(records.closestWin.winnerId);
  const closeLoser = ownerById.get(records.closestWin.loserId);
  const highCombinedA = ownerById.get(records.highestCombined.ownerA);
  const highCombinedB = ownerById.get(records.highestCombined.ownerB);
  const streakOwner = ownerById.get(records.longestWinStreak.ownerId);
  const bestSeasonOwner = ownerById.get(records.bestSeason.ownerId);
  const pointsSeasonOwner = ownerById.get(records.mostSeasonPoints.ownerId);

  return (
    <main className="ff-page" id="top">
      <header className="ff-site-header">
        <div className="ff-header-inner">
          <Link href="/" className="ff-back-link" aria-label="Back to Peter Argany home">
            <span aria-hidden="true">←</span> Peter Argany
          </Link>
          <a className="ff-brand" href="#top">
            <span>CQ</span>
            <strong>Couch QBs History Books</strong>
          </a>
          <nav aria-label="History book sections">
            <a href="#standings">Standings</a>
            <a href="#records">Records</a>
            <a href="#rivalries">Rivalries</a>
            <a href="#seasons">Seasons</a>
            <a href="#losers">Losers</a>
          </nav>
        </div>
      </header>

      <section className="ff-hero" aria-labelledby="ff-hero-title">
        <div className="ff-field-lines" aria-hidden="true" />
        <div className="ff-hero-inner">
          <div className="ff-hero-copy">
            <p>Couch Quarterbacks</p>
            <h1 id="ff-hero-title">
              <span>Couch QBs</span>
              History
              <br />
              Books
            </h1>
            <p>
              All-time standings, champions, weekly records, season finishes,
              and head-to-head history.
            </p>
            <a href="#standings" className="ff-primary-link">
              View all-time standings <ArrowRight aria-hidden="true" />
            </a>
          </div>

          <div
            className="ff-reigning-honors"
            role="group"
            aria-label="Current league title holders"
          >
            <article
              className="ff-reigning-card ff-reigning-champion"
              aria-labelledby="ff-reigning-champion-name"
            >
              {reigningChampion.image && (
                <Image
                  className="ff-reigning-photo"
                  src={reigningChampion.image}
                  alt={`${reigningChampion.name} holding the Couch QBs championship trophy`}
                  width={1122}
                  height={1402}
                  priority
                  sizes="(max-width: 420px) 90vw, (max-width: 1080px) 44vw, 20vw"
                />
              )}
              <header>
                <span className="ff-honor-badge ff-honor-badge-champion">
                  Reigning champion
                </span>
                <strong>{data.league.currentChampionYear}</strong>
              </header>
              <div className="ff-reigning-copy">
                <h2 id="ff-reigning-champion-name">
                  <span>{reigningChampion.name}</span>
                  <span className="ff-name-award" aria-hidden="true">
                    👑
                  </span>
                </h2>
                <p>{data.league.currentChampionTeam}</p>
              </div>
            </article>

            <article
              className="ff-reigning-card ff-reigning-sacko"
              aria-labelledby="ff-reigning-sacko-name"
            >
              {reigningSacko.image && (
                <Image
                  className="ff-reigning-photo"
                  src={reigningSacko.image}
                  alt="Dave wearing a blue squid hat in a golf cart"
                  width={545}
                  height={553}
                  priority
                  sizes="(max-width: 420px) 90vw, (max-width: 1080px) 44vw, 20vw"
                />
              )}
              <header>
                <span className="ff-honor-badge ff-honor-badge-sacko">
                  Reigning Sacko
                </span>
                <strong>{data.league.currentSackoYear}</strong>
              </header>
              <div className="ff-reigning-copy">
                <h2 id="ff-reigning-sacko-name">
                  <SackoName owner={reigningSacko}>
                    {reigningSacko.shortName}
                  </SackoName>
                  <span className="ff-name-award" aria-hidden="true">
                    💩
                  </span>
                </h2>
                <p>{data.league.currentSackoTeam}</p>
              </div>
            </article>
          </div>
        </div>

        <dl className="ff-league-totals">
          <div>
            <dt>Seasons</dt>
            <dd>{data.league.seasonCount}</dd>
            <span>complete history</span>
          </div>
          <div>
            <dt>Regular-season games</dt>
            <dd>{formatInteger(data.league.regularSeasonGames)}</dd>
            <span>{formatInteger(data.league.allGames)} including playoffs</span>
          </div>
          <div>
            <dt>Managers</dt>
            <dd>{data.league.managerCount}</dd>
            <span>{data.league.activeManagerCount} active</span>
          </div>
          <div>
            <dt>Points scored</dt>
            <dd>{formatInteger(data.league.regularSeasonPoints)}</dd>
            <span>regular season</span>
          </div>
        </dl>
      </section>

      <section className="ff-story-strip" aria-label="League headline stories">
        <article>
          <span>Highest career win rate</span>
          <strong>{winRateLeader.name} · {formatPercent(winRateLeader.winPct)}</strong>
          <p>Best among managers with at least five seasons.</p>
        </article>
        <article>
          <span>Championship leaders</span>
          <strong>{titleLeaders.length} managers with {topTitleCount}</strong>
          <p>{titleLeaders.map((owner) => owner.name).join(", ")}.</p>
        </article>
        <article>
          <span>First-year champion</span>
          <strong>Marc</strong>
          <p>Won the championship in his first season.</p>
        </article>
      </section>

      <section className="ff-section ff-standings" id="standings">
        <SectionHeading
          eyebrow="Career records"
          title="All-time standings"
          copy="Career totals use regular-season results so every era compares cleanly."
          action={
            <div className="ff-ranking-controls">
              <div role="group" aria-label="Manager scope">
                <button
                  type="button"
                  className={scope === "all" ? "is-active" : ""}
                  onClick={() => setScope("all")}
                >
                  Everyone
                </button>
                <button
                  type="button"
                  className={scope === "active" ? "is-active" : ""}
                  onClick={() => setScope("active")}
                >
                  Active
                </button>
              </div>
              <label>
                <span>Rank by</span>
                <select value={sortBy} onChange={handleSortSelect}>
                  <option value="titles">Championships</option>
                  <option value="wins">Career wins</option>
                  <option value="winPct">Win percentage</option>
                  <option value="points">Points scored</option>
                  <option value="average">Average points</option>
                  <option value="seasons">Seasons played</option>
                  <option value="playoffs">Playoff appearances</option>
                  <option value="sackos">Last-place finishes</option>
                  <option value="manager">Manager name</option>
                </select>
                <ChevronDown aria-hidden="true" />
              </label>
            </div>
          }
        />

        <div className="ff-podium">
          {rankingOwners.slice(0, 3).map((owner, index) => (
            <PodiumCard key={owner.id} owner={owner} position={index + 1} />
          ))}
        </div>

        <RankingTable
          owners={rankingOwners}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </section>

      <section className="ff-section ff-records" id="records">
        <SectionHeading
          eyebrow="League records"
          title="Record book"
          copy="Weekly records include regular-season and playoff games."
        />

        <div className="ff-record-grid">
          <RecordCard
            label="Highest weekly score"
            value={formatNumber(records.highestScore.score)}
            title={highScoreOwner.name}
            detail={`over ${highScoreOpponent.name}, ${formatNumber(records.highestScore.opponentScore)}`}
            meta={`${records.highestScore.year} · Week ${records.highestScore.week} · ${phaseLabel(records.highestScore)}`}
            tone="gold"
          />
          <RecordCard
            label="Closest finish"
            value={formatNumber(records.closestWin.margin)}
            title={`${closeWinner.name} over ${closeLoser.name}`}
            detail={`${formatNumber(
              records.closestWin.winnerId === records.closestWin.ownerA
                ? records.closestWin.scoreA
                : records.closestWin.scoreB,
            )}–${formatNumber(
              records.closestWin.loserId === records.closestWin.ownerA
                ? records.closestWin.scoreA
                : records.closestWin.scoreB,
            )}`}
            meta={`${records.closestWin.year} · Week ${records.closestWin.week}`}
            tone="green"
          />
          <RecordCard
            label="Biggest blowout"
            value={formatNumber(records.biggestBlowout.margin)}
            title={`${blowoutWinner.name} over ${blowoutLoser.name}`}
            detail={`${formatNumber(
              records.biggestBlowout.winnerId === records.biggestBlowout.ownerA
                ? records.biggestBlowout.scoreA
                : records.biggestBlowout.scoreB,
            )}–${formatNumber(
              records.biggestBlowout.loserId === records.biggestBlowout.ownerA
                ? records.biggestBlowout.scoreA
                : records.biggestBlowout.scoreB,
            )}`}
            meta={`${records.biggestBlowout.year} · Week ${records.biggestBlowout.week} · ${phaseLabel(records.biggestBlowout)}`}
            tone="red"
          />
          <RecordCard
            label="Highest-scoring game"
            value={formatNumber(records.highestCombined.combined)}
            title={`${highCombinedA.name} vs ${highCombinedB.name}`}
            detail={`${formatNumber(records.highestCombined.scoreA)}–${formatNumber(records.highestCombined.scoreB)}`}
            meta={`${records.highestCombined.year} · Week ${records.highestCombined.week}`}
          />
          <RecordCard
            label="Best regular season"
            value={formatSeasonRecord(records.bestSeason)}
            title={bestSeasonOwner.name}
            detail={`${records.bestSeason.teamName} · Champion`}
            meta={`${records.bestSeason.year} season`}
            tone="green"
          />
          <RecordCard
            label="Longest win streak"
            value={String(records.longestWinStreak.count)}
            title="Straight wins"
            detail={`${streakOwner.name} · Week ${records.longestWinStreak.start.week} through Week ${records.longestWinStreak.end.week}`}
            meta={`${records.longestWinStreak.start.year} season`}
          />
          <RecordCard
            label="Most season points"
            value={formatNumber(records.mostSeasonPoints.pointsFor)}
            title={pointsSeasonOwner.name}
            detail={records.mostSeasonPoints.teamName}
            meta={`${records.mostSeasonPoints.year} regular season`}
            tone="gold"
          />
          <RecordCard
            label="Lowest weekly score"
            value={formatNumber(records.lowestScore.score)}
            title={lowScoreOwner.name}
            detail={`vs ${lowScoreOpponent.name}, ${formatNumber(records.lowestScore.opponentScore)}`}
            meta={`${records.lowestScore.year} · Week ${records.lowestScore.week}`}
            tone="red"
          />
        </div>
      </section>

      <section className="ff-section ff-champions" aria-labelledby="champions-title">
        <SectionHeading
          eyebrow="The hardware"
          title="Hall of champions"
          copy="Every league champion, season by season."
        />
        <div className="ff-champion-scroll" id="champions-title">
          {data.seasons.map((season) => (
            <ChampionshipCard key={season.year} season={season} ownerById={ownerById} />
          ))}
        </div>
      </section>

      <section className="ff-section ff-rivalries" id="rivalries">
        <SectionHeading
          eyebrow="Matchup history"
          title="Head-to-head"
          copy="Pick any two managers. The series includes regular season and playoff meetings."
        />
        <Rivalry data={data} ownerById={ownerById} />
      </section>

      <section className="ff-section ff-seasons" id="seasons">
        <SectionHeading
          eyebrow="Year by year"
          title="Season archive"
          copy="Final finishes, regular-season records, scoring leaders, and last place."
        />
        <SeasonArchive seasons={data.seasons} ownerById={ownerById} />
      </section>

      <section className="ff-section ff-losers" id="losers">
        <SectionHeading
          eyebrow="The Sacko archive"
          title="Hall of Losers"
          copy="Every Sacko punishment, year by year."
        />
        <HallOfLosers ownerById={ownerById} />
      </section>

      <footer className="ff-footer">
        <span className="ff-brand ff-footer-brand">
          <span>CQ</span>
          <strong>Couch QBs History Books</strong>
        </span>
        <Link href="/">Back to peterargany.com</Link>
      </footer>
    </main>
  );
}
