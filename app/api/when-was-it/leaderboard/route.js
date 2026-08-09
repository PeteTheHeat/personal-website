import {
  calculateVerifiedScore,
  normalizePlayerName,
  normalizeSubmissionId,
} from "../../../../projects/when-was-it/game.js";
import {
  getWhenWasItLeaderboard,
  submitWhenWasItScore,
} from "../../../../projects/when-was-it/leaderboard-store.js";

function json(data, init) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");

  return Response.json(data, { ...init, headers });
}

export async function GET() {
  try {
    return json({ leaderboard: await getWhenWasItLeaderboard() });
  } catch (error) {
    console.error("Unable to load the When Was It leaderboard.", error);
    return json({ error: "Unable to load the leaderboard." }, { status: 500 });
  }
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return json(
      { error: "Request body must be a JSON object." },
      { status: 400 },
    );
  }

  const name = normalizePlayerName(payload.name);
  const submissionId = normalizeSubmissionId(payload.submissionId);
  const score = calculateVerifiedScore(payload.guesses);

  if (!name) {
    return json(
      { error: "Name must be between 1 and 20 characters." },
      { status: 400 },
    );
  }

  if (!submissionId) {
    return json({ error: "Submission ID is invalid." }, { status: 400 });
  }

  if (!Number.isSafeInteger(score) || score < 0) {
    return json(
      { error: "Exactly five valid, unique event guesses are required." },
      { status: 400 },
    );
  }

  try {
    const result = await submitWhenWasItScore({
      submissionId,
      name,
      score,
    });

    return json(
      {
        qualified: result.qualified,
        leaderboard: result.leaderboard,
        score: result.entry.score,
        idempotent: result.idempotent,
      },
      { status: result.qualified ? 201 : 200 },
    );
  } catch (error) {
    console.error("Unable to submit a When Was It score.", error);
    return json(
      { error: "Unable to submit the leaderboard entry." },
      { status: 500 },
    );
  }
}
