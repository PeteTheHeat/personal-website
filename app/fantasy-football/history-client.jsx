"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Crown,
  Database,
  ExternalLink,
  Medal,
  Swords,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";

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

function RankingTable({ owners }) {
  return (
    <>
      <div className="ff-ranking-table-wrap">
        <table className="ff-ranking-table">
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Manager</th>
              <th scope="col">Seasons</th>
              <th scope="col">Record</th>
              <th scope="col">Win %</th>
              <th scope="col">Points for</th>
              <th scope="col">Avg.</th>
              <th scope="col">Playoffs</th>
              <th scope="col">Titles</th>
              <th scope="col">Last</th>
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
        <small>{season.source}</small>
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
            to find a rivalry with receipts.
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
              <span className="ff-season-source">{season.source}</span>
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
                  <strong>{sacko.name}</strong>
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

              <a href={season.sourceUrl} target="_blank" rel="noreferrer">
                View {season.sourceLabel} <ExternalLink aria-hidden="true" />
              </a>
            </div>
          </details>
        );
      })}
    </div>
  );
}

export default function FantasyHistory({ data }) {
  const [scope, setScope] = useState("all");
  const [sortBy, setSortBy] = useState("wins");
  const ownerById = useMemo(
    () => new Map(data.owners.map((owner) => [owner.id, owner])),
    [data.owners],
  );
  const reigningChampion = ownerById.get(data.league.currentChampion);
  const allTimeWinsLeader = [...data.owners].sort(
    (left, right) => right.wins - left.wins,
  )[0];
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
    return [...filtered].sort((left, right) => {
      if (sortBy === "winPct") {
        return right.winPct - left.winPct || right.wins - left.wins;
      }
      if (sortBy === "titles") {
        return right.championships - left.championships || right.wins - left.wins;
      }
      if (sortBy === "points") {
        return right.pointsFor - left.pointsFor || right.wins - left.wins;
      }
      return right.wins - left.wins || right.winPct - left.winPct;
    });
  }, [data.owners, scope, sortBy]);
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
            <strong>Couch Quarterbacks</strong>
          </a>
          <nav aria-label="League archive sections">
            <a href="#standings">Standings</a>
            <a href="#records">Records</a>
            <a href="#rivalries">Rivalries</a>
            <a href="#seasons">Seasons</a>
          </nav>
          <a
            className="ff-sleeper-link"
            href="https://sleeper.com/leagues/1257419329926877184/league"
            target="_blank"
            rel="noreferrer"
          >
            Sleeper <ExternalLink aria-hidden="true" />
          </a>
        </div>
      </header>

      <section className="ff-hero" aria-labelledby="ff-hero-title">
        <div className="ff-field-lines" aria-hidden="true" />
        <div className="ff-hero-inner">
          <div className="ff-hero-copy">
            <p>League archive · {data.league.firstSeason}–{data.league.lastSeason}</p>
            <h1 id="ff-hero-title">
              <span>{data.league.seasonCount} seasons.</span>
              Every score.
              <br />
              No excuses.
            </h1>
            <p>
              Eleven years on NFL.com and two on Sleeper, rebuilt into one
              continuous history of wins, heartbreak, and highly defensible trash talk.
            </p>
            <a href="#standings" className="ff-primary-link">
              Enter the record book <ArrowRight aria-hidden="true" />
            </a>
          </div>

          <article className="ff-reigning-card">
            <div className="ff-reigning-rays" aria-hidden="true" />
            <header>
              <span>Reigning champion</span>
              <strong>{data.league.currentChampionYear}</strong>
            </header>
            <div className="ff-reigning-trophy" aria-hidden="true">
              <Trophy />
            </div>
            <OwnerMark owner={reigningChampion} size="hero" />
            <h2>{reigningChampion.name}</h2>
            <p>{data.league.currentChampionTeam}</p>
            <span className="ff-rookie-champ">Champion in season one</span>
          </article>
        </div>

        <dl className="ff-league-totals">
          <div>
            <dt>Seasons</dt>
            <dd>{data.league.seasonCount}</dd>
            <span>{data.league.firstSeason}–{data.league.lastSeason}</span>
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
          <span>On the doorstep</span>
          <strong>{allTimeWinsLeader.name} has {allTimeWinsLeader.wins} wins</strong>
          <p>One more makes the league&rsquo;s first century.</p>
        </article>
        <article>
          <span>Win-rate king</span>
          <strong>{winRateLeader.name} · {formatPercent(winRateLeader.winPct)}</strong>
          <p>The best career rate among managers with five seasons.</p>
        </article>
        <article>
          <span>The title logjam</span>
          <strong>{titleLeaders.length} managers tied at {topTitleCount}</strong>
          <p>{titleLeaders.map((owner) => owner.name).join(", ")}.</p>
        </article>
        <article>
          <span>Instant legend</span>
          <strong>Marc went 1-for-1</strong>
          <p>Joined in 2025. Left with the trophy.</p>
        </article>
      </section>

      <section className="ff-section ff-standings" id="standings">
        <SectionHeading
          eyebrow="The long game"
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
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="wins">Career wins</option>
                  <option value="winPct">Win percentage</option>
                  <option value="titles">Championships</option>
                  <option value="points">Points scored</option>
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

        <RankingTable owners={rankingOwners} />
      </section>

      <section className="ff-section ff-records" id="records">
        <SectionHeading
          eyebrow="Receipts, preserved"
          title="The record book"
          copy="Weekly records include playoffs. Yes, the ugly scores count too."
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
            value={`${records.longestWinStreak.count} straight`}
            title={streakOwner.name}
            detail={`Week ${records.longestWinStreak.start.week} through Week ${records.longestWinStreak.end.week}`}
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
          copy="Every winner, from the NFL.com years through the move to Sleeper."
        />
        <div className="ff-champion-scroll" id="champions-title">
          {data.seasons.map((season) => (
            <ChampionshipCard key={season.year} season={season} ownerById={ownerById} />
          ))}
        </div>
      </section>

      <section className="ff-section ff-rivalries" id="rivalries">
        <SectionHeading
          eyebrow="Settle it with data"
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

      <section className="ff-data-note" aria-labelledby="data-note-title">
        <Database aria-hidden="true" />
        <div>
          <p>How the archive works</p>
          <h2 id="data-note-title">Two platforms. One continuous history.</h2>
          <p>
            NFL.com standings and all weekly matchups from 2013–2023 were rebuilt
            from Peter&rsquo;s archived scrape. The 2024 and 2025 seasons come from
            Sleeper&rsquo;s public API. Career standings use regular-season results;
            weekly records and rivalries include postseason games.
          </p>
          <p>
            Manager aliases were reconciled across platforms. Most importantly,
            NFL.com&rsquo;s &ldquo;Peter2&rdquo; is Peter Ho, not Peter.
          </p>
          <div>
            <a
              href={data.methodology.nflSource}
              target="_blank"
              rel="noreferrer"
            >
              NFL.com source data <ExternalLink aria-hidden="true" />
            </a>
            <a
              href={data.methodology.sleeperSource}
              target="_blank"
              rel="noreferrer"
            >
              Sleeper API <ExternalLink aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <footer className="ff-footer">
        <span className="ff-brand ff-footer-brand">
          <span>CQ</span>
          <strong>Couch Quarterbacks</strong>
        </span>
        <p>Built for the only league arguments that matter: the ones with receipts.</p>
        <Link href="/">Back to peterargany.com</Link>
      </footer>
    </main>
  );
}
