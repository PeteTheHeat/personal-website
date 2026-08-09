import { HISTORICAL_EVENTS } from "./events.js";

export const GAME_LENGTH = 5;

const EVENT_YEARS = new Map(
  HISTORICAL_EVENTS.map((historicalEvent) => [
    historicalEvent.id,
    historicalEvent.year,
  ]),
);

export function scoreGuess(guess, actualYear) {
  return Math.abs(guess - actualYear);
}

export function selectRandomEvents(
  events,
  count = GAME_LENGTH,
  random = Math.random,
) {
  const shuffled = [...events];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(0, count);
}

export function qualifiesForTopThree(score, leaderboard) {
  return (
    leaderboard.length < 3 ||
    score < leaderboard[leaderboard.length - 1].score
  );
}

export function normalizePlayerName(value) {
  if (typeof value !== "string") {
    return null;
  }

  const name = value.trim().replace(/\s+/gu, " ");
  const characterCount = Array.from(name).length;

  return characterCount >= 1 && characterCount <= 20 ? name : null;
}

export function normalizeSubmissionId(value) {
  if (typeof value !== "string") {
    return null;
  }

  const submissionId = value.trim();
  return /^[A-Za-z0-9_-]{8,80}$/.test(submissionId)
    ? submissionId
    : null;
}

export function calculateVerifiedScore(
  value,
  currentYear = new Date().getUTCFullYear(),
) {
  if (!Array.isArray(value) || value.length !== GAME_LENGTH) {
    return null;
  }

  const usedEventIds = new Set();
  let score = 0;

  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return null;
    }

    const { eventId, guess } = item;

    if (
      !Number.isSafeInteger(eventId) ||
      !Number.isSafeInteger(guess) ||
      guess < 1 ||
      guess > currentYear ||
      usedEventIds.has(eventId)
    ) {
      return null;
    }

    const actualYear = EVENT_YEARS.get(eventId);

    if (actualYear === undefined) {
      return null;
    }

    usedEventIds.add(eventId);
    score += scoreGuess(guess, actualYear);
  }

  return score;
}

export function buildShareText(score, url) {
  const result =
    score === 0
      ? "I placed five moments in history without missing a year."
      : `I was ${new Intl.NumberFormat("en-US").format(
          score,
        )} years out across five moments in history.`;

  return `${result}\n\nThink you can do better?\n${url}`;
}
