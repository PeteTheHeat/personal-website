"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HISTORICAL_EVENTS } from "../../lib/when-was-it/events.js";
import {
  GAME_LENGTH,
  buildShareText,
  qualifiesForTopThree,
  scoreGuess,
  selectRandomEvents,
} from "../../lib/when-was-it/game.js";

const LEADERBOARD_URL = "/api/when-was-it/leaderboard";
const CURRENT_YEAR = new Date().getUTCFullYear();
const scoreFormatter = new Intl.NumberFormat("en-US");

function normalizeLeaderboard(value) {
  if (!Array.isArray(value) || value.length > 3) {
    return null;
  }

  const entries = [];

  for (const entry of value) {
    if (
      !entry ||
      typeof entry !== "object" ||
      !Number.isSafeInteger(entry.id) ||
      typeof entry.name !== "string" ||
      !Number.isSafeInteger(entry.score) ||
      entry.score < 0 ||
      typeof entry.createdAt !== "string"
    ) {
      return null;
    }

    entries.push(entry);
  }

  return entries
    .sort(
      (first, second) =>
        first.score - second.score || first.id - second.id,
    )
    .slice(0, 3);
}

function createSubmissionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `game-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatYears(value) {
  return `${scoreFormatter.format(value)} ${value === 1 ? "year" : "years"}`;
}

function Leaderboard({ entries, loading, unavailable, compact = false }) {
  return (
    <section
      className={`wwi-leaderboard${
        compact ? " wwi-leaderboard--compact" : ""
      }`}
      aria-labelledby="wwi-leaderboard-title"
    >
      <p className="wwi-kicker">All-time leaderboard</p>
      <div className="wwi-board-heading">
        <h2 id="wwi-leaderboard-title">Lowest on record</h2>
        <span className="wwi-board-trophy" aria-hidden="true">
          🏆
        </span>
      </div>

      {loading ? (
        <div className="wwi-board-loading" role="status">
          <span className="wwi-sr-only">Loading the leaderboard.</span>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </div>
      ) : unavailable ? (
        <p className="wwi-board-empty wwi-board-empty--error">
          The leaderboard is temporarily unavailable. The game still works.
        </p>
      ) : entries.length ? (
        <ol className="wwi-board-list">
          {entries.map((entry, index) => (
            <li key={entry.id}>
              <span className="wwi-board-rank">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="wwi-board-name">{entry.name}</span>
              <span className="wwi-board-score">
                {scoreFormatter.format(entry.score)} yrs
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="wwi-board-empty">
          No scores yet. The first entry could be yours.
        </p>
      )}

      <p className="wwi-board-note">
        Lowest total wins. Earlier score wins a tie. Honor system.
      </p>
    </section>
  );
}

function ResultGallery({ results }) {
  return (
    <div className="wwi-result-gallery" aria-label="Your five results">
      {results.map((result, index) => (
        <article className="wwi-result-object" key={result.event.id}>
          <div className="wwi-result-frame">
            {/* Wikimedia hosts several formats, so a plain img is intentional. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.event.imageUrl}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <span>{String(index + 1).padStart(2, "0")}</span>
          </div>
          <h3>{result.event.title}</h3>
          <dl>
            <div>
              <dt>Guess</dt>
              <dd>{result.guess}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{result.event.year}</dd>
            </div>
            <div>
              <dt>Error</dt>
              <dd>{result.difference}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}

export function WhenWasItGame() {
  const [screen, setScreen] = useState("intro");
  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [guess, setGuess] = useState("");
  const [guessError, setGuessError] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardUnavailable, setLeaderboardUnavailable] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [submittingName, setSubmittingName] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [canRetryLeaderboard, setCanRetryLeaderboard] = useState(false);
  const [finishMessage, setFinishMessage] = useState("");
  const [shareStatus, setShareStatus] = useState("");

  const roundHeadingRef = useRef(null);
  const nameInputRef = useRef(null);
  const gameCardRef = useRef(null);
  const gameIdRef = useRef("");
  const finalizingRef = useRef(false);
  const submittingNameRef = useRef(false);

  const currentEvent = rounds[roundIndex];
  const totalScore = useMemo(
    () => results.reduce((total, result) => total + result.difference, 0),
    [results],
  );
  const latestResult = results[results.length - 1];

  const loadLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(LEADERBOARD_URL, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Leaderboard request failed");
      }

      const payload = await response.json();
      const entries = normalizeLeaderboard(payload.leaderboard);

      if (!entries) {
        throw new Error("Leaderboard response was malformed");
      }

      setLeaderboard(entries);
      setLeaderboardUnavailable(false);
      return { entries, online: true };
    } catch {
      setLeaderboardUnavailable(true);
      return { entries: [], online: false };
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    if (screen === "playing") {
      gameCardRef.current?.scrollIntoView({ block: "start" });
      roundHeadingRef.current?.focus({ preventScroll: true });
    }

    if (screen === "name-entry") {
      nameInputRef.current?.focus();
    }
  }, [roundIndex, screen]);

  function startGame() {
    gameIdRef.current = createSubmissionId();
    finalizingRef.current = false;
    submittingNameRef.current = false;
    setRounds(selectRandomEvents(HISTORICAL_EVENTS));
    setRoundIndex(0);
    setResults([]);
    setGuess("");
    setGuessError("");
    setRevealed(false);
    setFailedImages(new Set());
    setName("");
    setNameError("");
    setSubmittingName(false);
    setFinalizing(false);
    setCanRetryLeaderboard(false);
    setFinishMessage("");
    setShareStatus("");
    setScreen("playing");
  }

  function submitGuess(event) {
    event.preventDefault();

    if (revealed || !currentEvent) {
      return;
    }

    const trimmedGuess = guess.trim();

    if (!/^\d{1,4}$/.test(trimmedGuess)) {
      setGuessError("Enter a whole year using digits only.");
      return;
    }

    const numericGuess = Number(trimmedGuess);

    if (numericGuess < 1 || numericGuess > CURRENT_YEAR) {
      setGuessError(`Choose a year from 1 to ${CURRENT_YEAR}.`);
      return;
    }

    setResults((current) => [
      ...current,
      {
        event: currentEvent,
        guess: numericGuess,
        difference: scoreGuess(numericGuess, currentEvent.year),
      },
    ]);
    setGuessError("");
    setRevealed(true);
  }

  async function finalizeGame() {
    if (finalizingRef.current) {
      return;
    }

    finalizingRef.current = true;
    setFinalizing(true);
    const activeGameId = gameIdRef.current;

    try {
      const refreshed = await loadLeaderboard();

      if (activeGameId !== gameIdRef.current) {
        return;
      }

      if (
        refreshed.online &&
        qualifiesForTopThree(totalScore, refreshed.entries)
      ) {
        setCanRetryLeaderboard(false);
        setScreen("name-entry");
      } else {
        setCanRetryLeaderboard(!refreshed.online);
        setFinishMessage(
          refreshed.online
            ? "That score missed the all-time top three."
            : "Your score is complete, but the leaderboard could not be reached. Try again below.",
        );
        setScreen("summary");
      }
    } finally {
      if (activeGameId === gameIdRef.current) {
        finalizingRef.current = false;
        setFinalizing(false);
      }
    }
  }

  async function advanceRound() {
    if (!revealed || finalizingRef.current) {
      return;
    }

    if (roundIndex < GAME_LENGTH - 1) {
      setRoundIndex((current) => current + 1);
      setGuess("");
      setGuessError("");
      setRevealed(false);
      return;
    }

    await finalizeGame();
  }

  async function submitName(event) {
    event.preventDefault();

    if (submittingNameRef.current) {
      return;
    }

    const cleanName = name.trim().replace(/\s+/gu, " ");
    const nameLength = Array.from(cleanName).length;

    if (nameLength < 1 || nameLength > 20) {
      setNameError("Enter 1 to 20 characters.");
      return;
    }

    submittingNameRef.current = true;
    setSubmittingName(true);
    setNameError("");

    try {
      const response = await fetch(LEADERBOARD_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          submissionId: gameIdRef.current,
          guesses: results.map((result) => ({
            eventId: result.event.id,
            guess: result.guess,
          })),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not add score");
      }

      const entries = normalizeLeaderboard(payload.leaderboard);

      if (!entries || !Number.isSafeInteger(payload.score)) {
        throw new Error("The leaderboard returned an invalid response");
      }

      setLeaderboard(entries);
      setLeaderboardUnavailable(false);
      setCanRetryLeaderboard(false);
      setFinishMessage(
        payload.qualified
          ? "You’re on the all-time leaderboard."
          : "The leaderboard changed before your score was saved, and this one missed the top three.",
      );
      setScreen("summary");
    } catch (error) {
      const isRateLimited =
        error instanceof Error &&
        error.message.includes("already added a leaderboard score today");

      setNameError(
        isRateLimited
          ? "This connection has already added a leaderboard score today. Your game is still complete."
          : "The leaderboard did not respond. Try adding your name again.",
      );
      setLeaderboardUnavailable(true);
    } finally {
      submittingNameRef.current = false;
      setSubmittingName(false);
    }
  }

  function skipName() {
    if (submittingNameRef.current) {
      return;
    }

    setFinishMessage("Final score complete. You skipped the leaderboard.");
    setScreen("summary");
  }

  async function shareScore() {
    const url = `${window.location.origin}/when-was-it`;
    const text = buildShareText(totalScore, url);
    setShareStatus("");

    try {
      if (navigator.share) {
        await navigator.share({ title: "When Was It?", text });
        setShareStatus("Score shared.");
        return;
      }

      await navigator.clipboard.writeText(text);
      setShareStatus(
        "Score copied. Send it to someone smug about history.",
      );
    } catch (error) {
      if (error?.name !== "AbortError") {
        setShareStatus(
          "Couldn’t copy the score. Use the link in your address bar.",
        );
      }
    }
  }

  return (
    <main className="wwi-page">
      <div className="wwi-shell">
        <header className="wwi-header">
          <button
            className="wwi-wordmark"
            type="button"
            onClick={() => setScreen("intro")}
            aria-label="When Was It? home"
            disabled={submittingName || finalizing}
          >
            <span aria-hidden="true">W</span>
            <span>When Was It?</span>
          </button>
          <p>A history game in five exhibits</p>
          <Link href="/">Peter Argany</Link>
        </header>

        {screen === "intro" && (
          <div className="wwi-intro">
            <section className="wwi-hero" aria-labelledby="wwi-hero-title">
              <div className="wwi-hero-copy">
                <p className="wwi-kicker">Place history in time</p>
                <h1 id="wwi-hero-title">When was it?</h1>
                <p className="wwi-hero-lede">
                  History feels obvious until someone asks for the year. Date
                  five moments from the past. Every year you miss adds one
                  point. Lowest score wins.
                </p>
                <div className="wwi-hero-actions">
                  <button
                    className="wwi-primary-button"
                    type="button"
                    onClick={startGame}
                  >
                    Enter the gallery <span aria-hidden="true">→</span>
                  </button>
                  <span>About 3 minutes</span>
                </div>
              </div>
              <dl className="wwi-facts" aria-label="Game facts">
                <div>
                  <dt>1 point</dt>
                  <dd>for every year missed</dd>
                </div>
                <div>
                  <dt>5</dt>
                  <dd>exhibits per game</dd>
                </div>
                <div>
                  <dt>79–2020 CE</dt>
                  <dd>dates in play</dd>
                </div>
              </dl>
            </section>

            <aside className="wwi-intro-rail">
              <Leaderboard
                entries={leaderboard}
                loading={leaderboardLoading}
                unavailable={leaderboardUnavailable}
              />
              <section
                className="wwi-rules"
                aria-labelledby="wwi-rules-title"
              >
                <p className="wwi-kicker">Visitor guide</p>
                <h2 id="wwi-rules-title">How to play</h2>
                <ol>
                  <li>
                    <span>01</span>
                    <p>Study the image and clue.</p>
                  </li>
                  <li>
                    <span>02</span>
                    <p>Enter the year it happened.</p>
                  </li>
                  <li>
                    <span>03</span>
                    <p>Add your five errors. Lowest score wins.</p>
                  </li>
                </ol>
              </section>
            </aside>
          </div>
        )}

        {screen === "playing" && currentEvent && (
          <div className="wwi-game-layout">
            <section
              className="wwi-game-card"
              aria-labelledby="wwi-round-title"
              ref={gameCardRef}
            >
              <div className="wwi-round-meta">
                <span>
                  Exhibit {String(roundIndex + 1).padStart(2, "0")}
                </span>
                <div
                  className="wwi-progress"
                  role="progressbar"
                  aria-label="Game progress"
                  aria-valuemin={1}
                  aria-valuemax={GAME_LENGTH}
                  aria-valuenow={roundIndex + 1}
                  aria-valuetext={`Round ${roundIndex + 1} of ${GAME_LENGTH}`}
                >
                  {Array.from({ length: GAME_LENGTH }).map((_, index) => (
                    <span
                      key={index}
                      className={index <= roundIndex ? "is-active" : ""}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span className="wwi-round-count">
                  {roundIndex + 1} / {GAME_LENGTH}
                  <strong>
                    {scoreFormatter.format(totalScore)} yrs
                  </strong>
                </span>
              </div>

              <figure className="wwi-object">
                <div className="wwi-frame">
                  <div className="wwi-mat">
                    {failedImages.has(currentEvent.id) ? (
                      <div
                        className="wwi-image-fallback"
                        role="img"
                        aria-label={`${currentEvent.title}. ${currentEvent.clue}`}
                      >
                        <span>Image unavailable</span>
                        <strong>{currentEvent.title}</strong>
                      </div>
                    ) : (
                      // Wikimedia hosts several formats, so a plain img is intentional.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="wwi-object-image"
                        src={currentEvent.imageUrl}
                        alt={`${currentEvent.title}. ${currentEvent.clue}`}
                        loading="eager"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages(
                            (current) =>
                              new Set(current).add(currentEvent.id),
                          )
                        }
                      />
                    )}
                  </div>
                </div>
                <figcaption>
                  <p className="wwi-accession">
                    Collection no. {String(currentEvent.id).padStart(3, "0")}
                  </p>
                  <h1
                    id="wwi-round-title"
                    ref={roundHeadingRef}
                    tabIndex={-1}
                  >
                    {currentEvent.title}
                  </h1>
                  <p>{currentEvent.clue}</p>
                </figcaption>
              </figure>

              {!revealed ? (
                <form
                  className="wwi-guess-form"
                  onSubmit={submitGuess}
                  noValidate
                >
                  <label htmlFor="wwi-year-guess">
                    What year did this happen?
                  </label>
                  <div
                    className={`wwi-year-entry${
                      guessError ? " has-error" : ""
                    }`}
                  >
                    <input
                      id="wwi-year-guess"
                      name="year"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      pattern="[0-9]*"
                      maxLength={4}
                      placeholder="YYYY"
                      value={guess}
                      onChange={(event) => setGuess(event.target.value)}
                      aria-invalid={Boolean(guessError)}
                      aria-describedby="wwi-guess-help wwi-guess-error"
                    />
                    <span aria-hidden="true">CE</span>
                  </div>
                  <div className="wwi-form-foot">
                    <p id="wwi-guess-help">
                      Enter a whole year from 1 to {CURRENT_YEAR} CE.
                    </p>
                    <p
                      id="wwi-guess-error"
                      className="wwi-form-error"
                      aria-live="polite"
                    >
                      {guessError}
                    </p>
                  </div>
                  <button
                    className="wwi-primary-button wwi-primary-button--wide"
                    type="submit"
                  >
                    Submit year
                  </button>
                </form>
              ) : latestResult ? (
                <section
                  className="wwi-reveal"
                  aria-live="polite"
                  aria-labelledby="wwi-answer-title"
                >
                  <div className="wwi-answer-grid">
                    <div>
                      <span>Actual year</span>
                      <strong id="wwi-answer-title">
                        {currentEvent.year}
                      </strong>
                    </div>
                    <div>
                      <span>Your guess</span>
                      <strong>{latestResult.guess}</strong>
                    </div>
                    <div className="wwi-answer-error">
                      <span>Your error</span>
                      <strong>
                        {latestResult.difference === 0
                          ? "Exact"
                          : formatYears(latestResult.difference)}
                      </strong>
                    </div>
                  </div>
                  <div className="wwi-reveal-footer">
                    <a
                      href={currentEvent.sourcePage}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Image credit: {currentEvent.attribution}{" "}
                      <span aria-hidden="true">↗</span>
                    </a>
                    <button
                      className="wwi-primary-button"
                      type="button"
                      onClick={advanceRound}
                      disabled={finalizing}
                    >
                      {finalizing
                        ? "Checking the leaderboard…"
                        : roundIndex === GAME_LENGTH - 1
                          ? "View final score"
                          : "Next exhibit"}{" "}
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </section>
              ) : null}
            </section>

            <aside className="wwi-score-rail" aria-label="Current game score">
              <section className="wwi-score-card">
                <p className="wwi-kicker">Current score</p>
                <strong>{scoreFormatter.format(totalScore)}</strong>
                <span>years off</span>
                <p>
                  One point for every year you miss. Keep the total low.
                </p>
              </section>
              <Leaderboard
                entries={leaderboard}
                loading={leaderboardLoading}
                unavailable={leaderboardUnavailable}
                compact
              />
            </aside>
          </div>
        )}

        {screen === "name-entry" && (
          <section
            className="wwi-finish wwi-name-card"
            aria-labelledby="wwi-name-title"
          >
            <p className="wwi-kicker">All-time leaderboard</p>
            <h1 id="wwi-name-title">You made the top three.</h1>
            <div className="wwi-final-score">
              <strong>{scoreFormatter.format(totalScore)}</strong>
              <span>total years off</span>
            </div>
            <p className="wwi-finish-lede">
              Add your name to claim the spot.
            </p>
            <form className="wwi-name-form" onSubmit={submitName} noValidate>
              <label htmlFor="wwi-player-name">Leaderboard name</label>
              <div>
                <input
                  ref={nameInputRef}
                  id="wwi-player-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={20}
                  autoComplete="nickname"
                  placeholder="Your name"
                  aria-invalid={Boolean(nameError)}
                  aria-describedby="wwi-name-error"
                />
                <button
                  className="wwi-primary-button"
                  type="submit"
                  disabled={submittingName}
                >
                  {submittingName ? "Adding…" : "Add my name"}
                </button>
              </div>
              <p
                id="wwi-name-error"
                className="wwi-form-error"
                aria-live="polite"
              >
                {nameError}
              </p>
            </form>
            <button
              className="wwi-text-button"
              type="button"
              onClick={skipName}
              disabled={submittingName}
            >
              Finish without a name
            </button>
          </section>
        )}

        {screen === "summary" && (
          <section
            className="wwi-finish"
            aria-labelledby="wwi-summary-title"
          >
            <div className="wwi-summary-heading">
              <div>
                <p className="wwi-kicker">Exhibition complete</p>
                <h1 id="wwi-summary-title">Your final score</h1>
                <p className="wwi-finish-message" aria-live="polite">
                  {finishMessage}
                </p>
              </div>
              <div className="wwi-final-score wwi-final-score--small">
                <strong>{scoreFormatter.format(totalScore)}</strong>
                <span>total years off</span>
              </div>
            </div>

            <ResultGallery results={results} />

            <div className="wwi-share-panel">
              <div>
                <p className="wwi-kicker">No spoilers</p>
                <h2>Put your score on display.</h2>
                <p>
                  Share the total, keep the five answers to yourself.
                </p>
              </div>
              <div>
                <button
                  className="wwi-primary-button"
                  type="button"
                  onClick={shareScore}
                >
                  Share my score <span aria-hidden="true">↗</span>
                </button>
                <p className="wwi-share-status" aria-live="polite">
                  {shareStatus}
                </p>
              </div>
            </div>

            <div className="wwi-summary-footer">
              <Leaderboard
                entries={leaderboard}
                loading={leaderboardLoading}
                unavailable={leaderboardUnavailable}
                compact
              />
              <section className="wwi-replay">
                <p className="wwi-kicker">The collection continues</p>
                <h2>See five more moments.</h2>
                <p>Each game draws five moments at random.</p>
                {canRetryLeaderboard && (
                  <button
                    className="wwi-secondary-button"
                    type="button"
                    onClick={finalizeGame}
                    disabled={finalizing}
                  >
                    {finalizing
                      ? "Checking the leaderboard…"
                      : "Check the leaderboard again"}
                  </button>
                )}
                <button
                  className="wwi-primary-button"
                  type="button"
                  onClick={startGame}
                  disabled={finalizing}
                >
                  Play again <span aria-hidden="true">→</span>
                </button>
              </section>
            </div>
          </section>
        )}

        <footer className="wwi-footer">
          <p>Dates in play range from 79 to 2020 CE.</p>
          <p>
            Images from Wikimedia Commons. Full credit appears after each
            reveal.
          </p>
        </footer>
      </div>
    </main>
  );
}
