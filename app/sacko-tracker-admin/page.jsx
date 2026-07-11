import { deriveChallenge } from "../../lib/sacko/domain";
import {
  getMissingSackoAuthEnvironmentVariables,
  isSackoAdminAuthenticated,
} from "../../lib/sacko/auth";
import { getChallengeState } from "../../lib/sacko/store";
import {
  loginSackoAdmin,
  logoutSackoAdmin,
  updateSackoChallenge,
} from "./actions";
import "./admin.css";

export const metadata = {
  title: "Sacko Tracker Admin | Peter Argany",
  description: "Private administration for the Sacko Tracker.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export const dynamic = "force-dynamic";

const SUCCESS_MESSAGES = {
  "progress-updated": "Progress saved. The public tracker is up to date.",
  "signed-in": "Admin access unlocked.",
  "signed-out": "You have been signed out.",
};

const ERROR_MESSAGES = {
  "auth-unavailable": "Admin sign-in is temporarily unavailable. Try again shortly.",
  "invalid-password": "That password did not match.",
  "invalid-progress":
    "Enter whole, non-negative numbers for donuts and beers, and a non-negative number for miles.",
  "not-configured": "Admin access is not configured yet.",
  "rate-limited": "Too many sign-in attempts. Try again in 15 minutes.",
  "save-failed": "The update could not be saved. Try again.",
  "session-expired": "Your admin session expired. Sign in again.",
};

const STATUS_LABELS = {
  "not-started": "Not started",
  active: "Active",
  complete: "Complete",
  "time-expired": "Time expired",
};

const EASTERN_TIMESTAMP_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "short",
});

function getQueryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function formatTimestamp(value) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp;
}

function Timestamp({ value, emptyLabel = "Not recorded" }) {
  const timestamp = formatTimestamp(value);

  if (!timestamp) {
    return <span>{emptyLabel}</span>;
  }

  return (
    <time dateTime={timestamp.toISOString()} title={timestamp.toISOString()}>
      {EASTERN_TIMESTAMP_FORMATTER.format(timestamp)}
    </time>
  );
}

function ResultMessage({ searchParams }) {
  const success = SUCCESS_MESSAGES[getQueryValue(searchParams.success)];
  const error = ERROR_MESSAGES[getQueryValue(searchParams.error)];
  const message = error ?? success;

  if (!message) {
    return null;
  }

  return (
    <p
      className={`sacko-admin-message sacko-admin-message-${error ? "error" : "success"}`}
      role={error ? "alert" : "status"}
    >
      {message}
    </p>
  );
}

function SetupRequired({ missingVariables }) {
  return (
    <main className="sacko-admin-page">
      <section className="sacko-admin-card" aria-labelledby="sacko-admin-setup-title">
        <p className="sacko-admin-eyebrow">Sacko Tracker</p>
        <h1 id="sacko-admin-setup-title">Admin setup required</h1>
        <p>
          Add or strengthen the following environment{" "}
          {missingVariables.length === 1 ? "variable" : "variables"} in the
          Vercel project, then redeploy:
        </p>
        <ul className="sacko-admin-setup-list">
          {missingVariables.map((name) => (
            <li key={name}>
              <code>{name}</code>
            </li>
          ))}
        </ul>
        <p className="sacko-admin-help">
          Use a strong, unique password and a separate high-entropy session secret. Secret
          values are never shown here.
        </p>
      </section>
    </main>
  );
}

function Login({ searchParams }) {
  return (
    <main className="sacko-admin-page">
      <section className="sacko-admin-card" aria-labelledby="sacko-admin-login-title">
        <p className="sacko-admin-eyebrow">Sacko Tracker</p>
        <h1 id="sacko-admin-login-title">Admin access</h1>
        <p>Enter the admin password to update Dave&rsquo;s progress.</p>
        <ResultMessage searchParams={searchParams} />
        <form className="sacko-admin-form" action={loginSackoAdmin}>
          <div className="sacko-admin-field">
            <label htmlFor="sacko-admin-password">Admin password</label>
            <input
              id="sacko-admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              maxLength={1024}
              required
            />
          </div>
          <button className="sacko-admin-primary-button" type="submit">
            Unlock tracker
          </button>
        </form>
      </section>
    </main>
  );
}

function CompletionTiming({ challenge }) {
  if (challenge.completedBeforeDeadline === true) {
    return "Yes";
  }

  if (challenge.completedBeforeDeadline === false) {
    return "No";
  }

  return "Not yet determined";
}

function AdminDashboard({ state, challenge, searchParams }) {
  return (
    <main className="sacko-admin-page">
      <div className="sacko-admin-shell">
        <header className="sacko-admin-header">
          <div>
            <p className="sacko-admin-eyebrow">Sacko Tracker</p>
            <h1>Update progress</h1>
          </div>
          <form action={logoutSackoAdmin}>
            <button className="sacko-admin-secondary-button" type="submit">
              Sign out
            </button>
          </form>
        </header>

        <ResultMessage searchParams={searchParams} />

        <section className="sacko-admin-card" aria-labelledby="sacko-admin-progress-title">
          <h2 id="sacko-admin-progress-title">Current totals</h2>
          <form className="sacko-admin-form" action={updateSackoChallenge}>
            <fieldset className="sacko-admin-fields">
              <legend className="sacko-admin-sr-only">Challenge progress</legend>
              <div className="sacko-admin-field">
                <label htmlFor="sacko-admin-donuts">Donuts</label>
                <input
                  id="sacko-admin-donuts"
                  name="donuts"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  defaultValue={state.donuts}
                  required
                />
              </div>
              <div className="sacko-admin-field">
                <label htmlFor="sacko-admin-beers">Beers</label>
                <input
                  id="sacko-admin-beers"
                  name="beers"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  defaultValue={state.beers}
                  required
                />
              </div>
              <div className="sacko-admin-field">
                <label htmlFor="sacko-admin-miles">Miles</label>
                <input
                  id="sacko-admin-miles"
                  name="miles"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  defaultValue={state.miles}
                  required
                />
              </div>
            </fieldset>
            <p className="sacko-admin-form-help">
              Donuts and beers must be whole numbers. Miles may include a decimal.
            </p>
            <button className="sacko-admin-primary-button" type="submit">
              Save progress
            </button>
          </form>
        </section>

        <section className="sacko-admin-card" aria-labelledby="sacko-admin-summary-title">
          <h2 id="sacko-admin-summary-title">Challenge summary</h2>
          <dl className="sacko-admin-summary">
            <div>
              <dt>Status</dt>
              <dd>{STATUS_LABELS[challenge.status] ?? challenge.status}</dd>
            </div>
            <div>
              <dt>Total progress</dt>
              <dd>{challenge.totalProgress} / 24</dd>
            </div>
            <div>
              <dt>Started</dt>
              <dd>
                <Timestamp value={state.startAt} emptyLabel="Not started" />
              </dd>
            </div>
            <div>
              <dt>Deadline</dt>
              <dd>
                <Timestamp value={challenge.endAt} emptyLabel="Not available" />
              </dd>
            </div>
            <div>
              <dt>Completed</dt>
              <dd>
                <Timestamp value={state.completedAt} />
              </dd>
            </div>
            <div>
              <dt>Completed before deadline</dt>
              <dd>
                <CompletionTiming challenge={challenge} />
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}

function LoadError({ searchParams }) {
  return (
    <main className="sacko-admin-page">
      <section className="sacko-admin-card" aria-labelledby="sacko-admin-error-title">
        <p className="sacko-admin-eyebrow">Sacko Tracker</p>
        <h1 id="sacko-admin-error-title">Tracker unavailable</h1>
        <ResultMessage searchParams={searchParams} />
        <p>The saved challenge state could not be loaded. Check the server configuration and try again.</p>
        <form action={logoutSackoAdmin}>
          <button className="sacko-admin-secondary-button" type="submit">
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}

export default async function SackoTrackerAdminPage({ searchParams }) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const missingVariables = getMissingSackoAuthEnvironmentVariables();

  if (missingVariables.length > 0) {
    return <SetupRequired missingVariables={missingVariables} />;
  }

  if (!(await isSackoAdminAuthenticated())) {
    return <Login searchParams={resolvedSearchParams} />;
  }

  try {
    const now = new Date();
    const state = await getChallengeState();
    const challenge = deriveChallenge(state, now);

    return (
      <AdminDashboard
        state={state}
        challenge={challenge}
        searchParams={resolvedSearchParams}
      />
    );
  } catch (error) {
    console.error("Unable to load Sacko challenge state for admin.", error);
    return <LoadError searchParams={resolvedSearchParams} />;
  }
}
