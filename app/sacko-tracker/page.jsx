import Image from "next/image";
import { SportShoe } from "lucide-react";
import { deriveChallenge, TARGET } from "../../lib/sacko/domain.js";
import { getCachedChallengeState } from "../../lib/sacko/cached-state.js";
import LiveStatus from "./live-status";
import "./sacko.css";

export const metadata = {
  title: "Dave's 24 in 24 Sacko Tracker | Peter Argany",
  description:
    "Track Dave's 24-hour quest to reach a combined 24 beers, donuts, and miles.",
  alternates: { canonical: "/sacko-tracker" },
};

export const dynamic = "force-dynamic";

const EASTERN_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatNumber(value) {
  return NUMBER_FORMATTER.format(value);
}

function formatTimestamp(value) {
  return value ? EASTERN_FORMATTER.format(new Date(value)) : null;
}

function BeerCanIcon() {
  return (
    <span className="sacko-can-icon" aria-hidden="true">
      <span>24</span>
    </span>
  );
}

function buildSegments({ donuts, beers, miles }) {
  const total = donuts + beers + miles;
  const scale = Math.max(TARGET, total);

  return [donuts, beers, miles].map((value) => (value / scale) * 100);
}

function MetricCard({ icon, name, value, color, detail, percent }) {
  const valueLabel = formatNumber(value);

  return (
    <article
      className={`sacko-metric sacko-metric-${color}${
        valueLabel.length > 6 ? " sacko-metric-long" : ""
      }`}
    >
      <span className="sacko-metric-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="sacko-metric-copy">
        <h3>{name}</h3>
        <p className="sacko-metric-value">
          <strong>{valueLabel}</strong>
          <span>/24</span>
        </p>
      </div>
      <p className="sacko-metric-percent">{Math.floor(percent)}%</p>
      <div className="sacko-metric-line" aria-hidden="true">
        <span style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <p className="sacko-metric-detail">{detail}</p>
    </article>
  );
}

function CaloriePanel({ consumed, burned }) {
  const balance = burned - consumed;

  return (
    <section
      className="sacko-calories"
      aria-label="Approximate calorie comparison"
    >
      <div className="sacko-calorie-stat sacko-calorie-consumed">
        <span className="sacko-calorie-icon" aria-hidden="true">
          🔥
        </span>
        <p>
          <span>Calories consumed</span>
          <strong>{formatNumber(consumed)}</strong> <small>cal</small>
        </p>
      </div>
      <span className="sacko-versus" aria-hidden="true">vs</span>
      <div className="sacko-calorie-stat sacko-calorie-burned">
        <span className="sacko-calorie-icon sacko-calorie-shoe" aria-hidden="true">
          <SportShoe />
        </span>
        <p>
          <span>Calories burned</span>
          <strong>{formatNumber(burned)}</strong> <small>cal</small>
        </p>
      </div>
      <div className="sacko-calorie-balance">
        <span>Calorie deficit</span>
        <strong>
          {balance < 0 ? "−" : "+"}
          {formatNumber(Math.abs(balance))}
        </strong>
        <small>cal</small>
        <span className="sacko-skull" aria-hidden="true">☠</span>
      </div>
    </section>
  );
}

function TrackerUnavailable() {
  return (
    <main className="sacko-page sacko-error-page">
      <section
        className="sacko-error-card"
        role="alert"
        aria-labelledby="sacko-error-title"
      >
        <p>The official Sacko challenge</p>
        <h1 id="sacko-error-title">Tracker taking a breather</h1>
        <p>
          Dave&rsquo;s score could not be loaded right now. Try the tracker again in a
          moment.
        </p>
        <a href="/sacko-tracker">Try again</a>
      </section>
    </main>
  );
}

export default async function SackoTrackerPage() {
  const now = new Date();
  let state;

  try {
    state = await getCachedChallengeState();
  } catch (error) {
    console.error(
      "Unable to load Sacko challenge state for the public tracker.",
      error,
    );
    return <TrackerUnavailable />;
  }

  const challenge = deriveChallenge(state, now);
  const [donutWidth, beerWidth, mileWidth] = buildSegments(state);
  const donutPosition = donutWidth / 2;
  const beerPosition = donutWidth + beerWidth / 2;
  const milePosition = donutWidth + beerWidth + mileWidth / 2;
  const caloriesConsumed = state.donuts * 400 + state.beers * 170;
  const caloriesBurned = state.miles * 200;
  const percentLabel = Math.floor(challenge.progressPercent);
  const totalLabel = formatNumber(challenge.totalProgress);
  const statusDescription =
    challenge.status === "active"
      ? `${formatNumber(challenge.remaining)} to go`
      : challenge.status === "complete"
        ? "Target reached"
        : challenge.status === "time-expired"
          ? `${formatNumber(challenge.remaining)} short`
          : "Waiting to begin";

  return (
    <main className="sacko-page">
      <article className="sacko-poster">
        <header className="sacko-hero">
          <div className="sacko-hero-copy">
            <p className="sacko-kicker">The official Sacko challenge</p>
            <h1>
              <span>Dave&rsquo;s</span>
              <span>24 in 24</span>
              <span>Punishment</span>
            </h1>
            <p className="sacko-formula">Donuts + beers + miles = 24</p>
            <p className="sacko-rule">
              Any combination counts. No category minimums. Just get to 24.
            </p>
          </div>

          <figure className="sacko-hero-visual">
            <span className="sacko-halftone" aria-hidden="true" />
            <p className="sacko-doodle sacko-doodle-left" aria-hidden="true">
              Suffering! ↘
            </p>
            <p className="sacko-doodle sacko-doodle-right" aria-hidden="true">
              For glory! 🏆
            </p>
            <Image
              className="sacko-dave"
              src="/sacko/dave-hero.webp"
              alt="Dave holding a green beer can and a bitten donut"
              width={800}
              height={1200}
              priority
              sizes="(max-width: 760px) 82vw, 460px"
            />
          </figure>
        </header>

        <section className="sacko-progress-card" aria-labelledby="sacko-progress-title">
          <div className="sacko-progress-main">
            <div className="sacko-progress-heading">
              <h2 id="sacko-progress-title">Overall progress</h2>
              <p>{statusDescription}</p>
            </div>
            <div
              className="sacko-progress-track"
              role="progressbar"
              aria-label={`${formatNumber(challenge.totalProgress)} of 24 combined points`}
              aria-valuemin={0}
              aria-valuemax={TARGET}
              aria-valuenow={Math.min(TARGET, challenge.totalProgress)}
              aria-valuetext={`${formatNumber(challenge.totalProgress)} of 24; ${
                challenge.status === "complete" ? "target reached" : statusDescription
              }`}
            >
              <span
                className="sacko-segment sacko-segment-donut"
                style={{ width: `${donutWidth}%` }}
              />
              <span
                className="sacko-segment sacko-segment-beer"
                style={{ width: `${beerWidth}%` }}
              />
              <span
                className="sacko-segment sacko-segment-mile"
                style={{ width: `${mileWidth}%` }}
              />
              {donutWidth >= 3 && (
                <span
                  className="sacko-track-icon sacko-track-donut"
                  style={{ left: `${donutPosition}%` }}
                  aria-hidden="true"
                >
                  🍩
                </span>
              )}
              {beerWidth >= 3 && (
                <span
                  className="sacko-track-icon sacko-track-beer"
                  style={{ left: `${beerPosition}%` }}
                  aria-hidden="true"
                >
                  <BeerCanIcon />
                </span>
              )}
              {mileWidth >= 3 && (
                <span
                  className="sacko-track-icon sacko-track-mile"
                  style={{ left: `${milePosition}%` }}
                  aria-hidden="true"
                >
                  <SportShoe />
                </span>
              )}
            </div>
          </div>

          <div
            className={`sacko-progress-score${
              totalLabel.length > 6 ? " sacko-progress-score-long" : ""
            }`}
          >
            <p>
              <strong>{totalLabel}</strong>
              <span>/24</span>
            </p>
            <span>{percentLabel}% complete</span>
          </div>

          <LiveStatus
            status={challenge.status}
            endAt={challenge.endAt}
            completedBeforeDeadline={challenge.completedBeforeDeadline}
          />
        </section>

        <section className="sacko-metrics" aria-label="Challenge categories">
          <MetricCard
            icon="🍩"
            name="Donuts"
            value={state.donuts}
            color="pink"
            detail={`≈ ${formatNumber(state.donuts * 400)} cal`}
            percent={(state.donuts / TARGET) * 100}
          />
          <MetricCard
            icon={<BeerCanIcon />}
            name="Beers"
            value={state.beers}
            color="green"
            detail={`≈ ${formatNumber(state.beers * 170)} cal`}
            percent={(state.beers / TARGET) * 100}
          />
          <MetricCard
            icon={<SportShoe />}
            name="Miles"
            value={state.miles}
            color="blue"
            detail={`≈ ${formatNumber(caloriesBurned)} cal burned`}
            percent={(state.miles / TARGET) * 100}
          />
        </section>

        <CaloriePanel consumed={caloriesConsumed} burned={caloriesBurned} />

        <footer className="sacko-footer">
          <p>Pain today, bragging rights forever.</p>
          {state.startAt && challenge.endAt && (
            <p className="sacko-timing">
              Started <time dateTime={state.startAt}>{formatTimestamp(state.startAt)}</time>
              <span aria-hidden="true"> • </span>
              Deadline <time dateTime={challenge.endAt}>{formatTimestamp(challenge.endAt)}</time>
            </p>
          )}
          <p className="sacko-calorie-note">Calorie figures are rough estimates.</p>
        </footer>
      </article>
    </main>
  );
}
