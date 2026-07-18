export const TARGET = 24;
export const START_AT = "2026-07-11T00:00:00.000Z";
export const CHALLENGE_DURATION_MS = 24 * 60 * 60 * 1000;
export const COMPLETION_TIMING = Object.freeze({
  BEFORE_DEADLINE: "before-deadline",
  AFTER_DEADLINE: "after-deadline",
});

export const SEED_STATE = Object.freeze({
  donuts: 8,
  beers: 6,
  miles: 2,
  startAt: START_AT,
  completedAt: null,
  completionTiming: null,
  updatedAt: START_AT,
});

export class SackoValidationError extends TypeError {
  constructor(field, message) {
    super(`${field} ${message}`);
    this.name = "SackoValidationError";
    this.field = field;
  }
}

function toNumber(value, field) {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && value.trim() === "")
  ) {
    throw new SackoValidationError(field, "must be a number");
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new SackoValidationError(field, "must be a finite number");
  }

  return Object.is(number, -0) ? 0 : number;
}

function validateWholeNumber(value, field) {
  const number = toNumber(value, field);

  if (!Number.isSafeInteger(number) || number < 0) {
    throw new SackoValidationError(field, "must be a non-negative whole number");
  }

  return number;
}

function validateMiles(value) {
  const number = toNumber(value, "miles");

  if (number < 0) {
    throw new SackoValidationError("miles", "must be non-negative");
  }

  return number;
}

function normalizeOptionalTimestamp(value, field) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new SackoValidationError(field, "must be a valid timestamp");
  }

  return date.toISOString();
}

export function normalizeCompletionTiming(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (
    value !== COMPLETION_TIMING.BEFORE_DEADLINE &&
    value !== COMPLETION_TIMING.AFTER_DEADLINE
  ) {
    throw new SackoValidationError(
      "completionTiming",
      "must be before-deadline, after-deadline, or null",
    );
  }

  return value;
}

function normalizeNow(value) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new SackoValidationError("now", "must be a valid timestamp");
  }

  return date;
}

export function validateProgress(progress) {
  if (!progress || typeof progress !== "object" || Array.isArray(progress)) {
    throw new SackoValidationError("progress", "must be an object");
  }

  return {
    donuts: validateWholeNumber(progress.donuts, "donuts"),
    beers: validateWholeNumber(progress.beers, "beers"),
    miles: validateMiles(progress.miles),
  };
}

export function normalizeChallengeState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw new SackoValidationError("state", "must be an object");
  }

  return {
    ...validateProgress(state),
    startAt: normalizeOptionalTimestamp(state.startAt, "startAt"),
    completedAt: normalizeOptionalTimestamp(state.completedAt, "completedAt"),
    completionTiming: normalizeCompletionTiming(state.completionTiming),
    updatedAt: normalizeOptionalTimestamp(state.updatedAt, "updatedAt"),
  };
}

export function transitionChallengeState(
  state,
  progress,
  now = new Date(),
  completionTiming = undefined,
) {
  const current = normalizeChallengeState(state);
  const nextProgress = validateProgress(progress);
  const updatedAt = normalizeNow(now).toISOString();
  const totalProgress =
    nextProgress.donuts + nextProgress.beers + nextProgress.miles;
  const nextCompletionTiming =
    completionTiming === undefined
      ? current.completionTiming
      : normalizeCompletionTiming(completionTiming);
  const isComplete = totalProgress >= TARGET;

  return normalizeChallengeState({
    ...current,
    ...nextProgress,
    completedAt: isComplete
      ? nextCompletionTiming
        ? null
        : current.completedAt || updatedAt
      : null,
    completionTiming: isComplete ? nextCompletionTiming : null,
    updatedAt,
  });
}

export function deriveChallenge(state, now = new Date()) {
  const normalizedState = normalizeChallengeState(state);
  const currentTime = normalizeNow(now);
  const totalProgress =
    normalizedState.beers + normalizedState.donuts + normalizedState.miles;
  const remaining = Math.max(0, TARGET - totalProgress);
  const progressPercent = Math.min(100, (totalProgress / TARGET) * 100);
  const endAt = normalizedState.startAt
    ? new Date(
        new Date(normalizedState.startAt).getTime() + CHALLENGE_DURATION_MS,
      ).toISOString()
    : null;

  let status;

  if (totalProgress >= TARGET) {
    status = "complete";
  } else if (!normalizedState.startAt) {
    status = "not-started";
  } else if (currentTime.getTime() < new Date(endAt).getTime()) {
    status = "active";
  } else {
    status = "time-expired";
  }

  let completedBeforeDeadline = null;

  if (status === "complete" && endAt) {
    if (normalizedState.completionTiming === COMPLETION_TIMING.BEFORE_DEADLINE) {
      completedBeforeDeadline = true;
    } else if (
      normalizedState.completionTiming === COMPLETION_TIMING.AFTER_DEADLINE
    ) {
      completedBeforeDeadline = false;
    } else if (normalizedState.completedAt) {
      completedBeforeDeadline =
        new Date(normalizedState.completedAt).getTime() < new Date(endAt).getTime();
    }
  }

  return {
    ...normalizedState,
    totalProgress,
    remaining,
    progressPercent,
    endAt,
    status,
    completedBeforeDeadline,
  };
}
