import assert from "node:assert/strict";
import test from "node:test";
import {
  SEED_STATE,
  START_AT,
  TARGET,
  deriveChallenge,
  transitionChallengeState,
  validateProgress,
} from "../lib/sacko/domain.js";

function state(overrides = {}) {
  return {
    ...SEED_STATE,
    ...overrides,
  };
}

test("uses the specified target, start time, and mockup seed values", () => {
  assert.equal(TARGET, 24);
  assert.equal(START_AT, "2026-07-11T00:00:00.000Z");
  assert.deepEqual(
    {
      donuts: SEED_STATE.donuts,
      beers: SEED_STATE.beers,
      miles: SEED_STATE.miles,
    },
    { donuts: 8, beers: 6, miles: 2 },
  );
});

test("calculates total, remaining, and uncapped percentage inputs", () => {
  const challenge = deriveChallenge(state(), "2026-07-11T01:00:00.000Z");

  assert.equal(challenge.totalProgress, 16);
  assert.equal(challenge.remaining, 8);
  assert.equal(challenge.progressPercent, (16 / 24) * 100);
  assert.equal(challenge.endAt, "2026-07-12T00:00:00.000Z");
  assert.equal(challenge.status, "active");
});

test("keeps an over-target numeric total while capping visual progress at 100", () => {
  const challenge = deriveChallenge(
    state({ donuts: 5, beers: 4, miles: 15.5 }),
    "2026-07-11T08:00:00.000Z",
  );

  assert.equal(challenge.totalProgress, 24.5);
  assert.equal(challenge.remaining, 0);
  assert.equal(challenge.progressPercent, 100);
  assert.equal(challenge.status, "complete");
});

test("accepts form-like numeric strings and validates category constraints", () => {
  assert.deepEqual(validateProgress({ donuts: "10", beers: "6", miles: "8.25" }), {
    donuts: 10,
    beers: 6,
    miles: 8.25,
  });

  for (const invalid of [
    { donuts: -1, beers: 1, miles: 1 },
    { donuts: 1.5, beers: 1, miles: 1 },
    { donuts: 1, beers: -1, miles: 1 },
    { donuts: 1, beers: 1.2, miles: 1 },
    { donuts: Number.MAX_SAFE_INTEGER + 1, beers: 1, miles: 1 },
    { donuts: 1, beers: 1, miles: -0.1 },
    { donuts: 1, beers: 1, miles: Number.POSITIVE_INFINITY },
    { donuts: "", beers: 1, miles: 1 },
  ]) {
    assert.throws(() => validateProgress(invalid));
  }
});

test("is not started only when no start timestamp exists", () => {
  const challenge = deriveChallenge(
    state({ startAt: null, donuts: 0, beers: 0, miles: 0 }),
    "2026-07-20T00:00:00.000Z",
  );

  assert.equal(challenge.endAt, null);
  assert.equal(challenge.status, "not-started");
});

test("becomes time-expired at the exact 24-hour deadline", () => {
  const before = deriveChallenge(state(), "2026-07-11T23:59:59.999Z");
  const boundary = deriveChallenge(state(), "2026-07-12T00:00:00.000Z");

  assert.equal(before.status, "active");
  assert.equal(boundary.status, "time-expired");
});

test("complete status takes precedence after the deadline", () => {
  const challenge = deriveChallenge(
    state({ donuts: 8, beers: 8, miles: 8 }),
    "2026-07-13T00:00:00.000Z",
  );

  assert.equal(challenge.totalProgress, 24);
  assert.equal(challenge.status, "complete");

  const completeWithoutStart = deriveChallenge(
    state({ donuts: 8, beers: 8, miles: 8, startAt: null }),
    "2026-07-13T00:00:00.000Z",
  );

  assert.equal(completeWithoutStart.status, "complete");
});

test("reports completion timing only when both timestamps are known", () => {
  assert.equal(
    deriveChallenge(
      state({ donuts: 8, beers: 8, miles: 8, completedAt: "2026-07-11T23:59:59.999Z" }),
      "2026-07-13T00:00:00.000Z",
    ).completedBeforeDeadline,
    true,
  );
  assert.equal(
    deriveChallenge(
      state({ donuts: 8, beers: 8, miles: 8, completedAt: "2026-07-12T00:00:00.000Z" }),
      "2026-07-13T00:00:00.000Z",
    ).completedBeforeDeadline,
    false,
  );
  assert.equal(
    deriveChallenge(
      state({ donuts: 8, beers: 8, miles: 8, completedAt: "2026-07-12T00:00:00.001Z" }),
      "2026-07-13T00:00:00.000Z",
    ).completedBeforeDeadline,
    false,
  );
  assert.equal(
    deriveChallenge(
      state({ donuts: 8, beers: 8, miles: 8, completedAt: null }),
      "2026-07-13T00:00:00.000Z",
    ).completedBeforeDeadline,
    null,
  );
  assert.equal(
    deriveChallenge(
      state({
        donuts: 8,
        beers: 8,
        miles: 8,
        startAt: null,
        completedAt: "2026-07-11T23:00:00.000Z",
      }),
      "2026-07-13T00:00:00.000Z",
    ).completedBeforeDeadline,
    null,
  );
});

test("clears a mistaken completion on correction and timestamps the next crossing", () => {
  const completed = transitionChallengeState(
    state(),
    { donuts: 8, beers: 8, miles: 8 },
    "2026-07-11T06:00:00.000Z",
  );
  assert.equal(completed.completedAt, "2026-07-11T06:00:00.000Z");

  const corrected = transitionChallengeState(
    completed,
    { donuts: 8, beers: 8, miles: 7 },
    "2026-07-11T06:05:00.000Z",
  );
  assert.equal(corrected.completedAt, null);
  assert.equal(
    deriveChallenge(corrected, "2026-07-11T06:05:00.000Z").status,
    "active",
  );

  const completedAgain = transitionChallengeState(
    corrected,
    { donuts: 8, beers: 8, miles: 8.5 },
    "2026-07-11T06:10:00.000Z",
  );
  assert.equal(completedAgain.completedAt, "2026-07-11T06:10:00.000Z");
});
