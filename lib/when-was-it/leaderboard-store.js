import "server-only";

import { createHash, createHmac } from "node:crypto";
import { mkdir, open, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_REDIS_KEY_PREFIX = "when-was-it:leaderboard:v1";
const DEFAULT_DATA_FILE = ".data/when-was-it-leaderboard.json";
const SUBMISSION_RATE_LIMIT_SECONDS = 24 * 60 * 60;
const MIGRATED_ENTRY = Object.freeze({
  id: 1,
  submissionId: "migrated-sites-entry-1",
  name: "Pete The Heat",
  score: 474,
  createdAt: "2026-07-23T03:07:49.000Z",
});

const REDIS_SEED_SCRIPT = `
local function keyType(key)
  local result = redis.call("TYPE", key)
  if type(result) == "table" then
    return result["ok"]
  end
  return result
end

local expectedTypes = {"string", "hash", "hash", "zset"}

for index, expected in ipairs(expectedTypes) do
  local actual = keyType(KEYS[index])
  if actual ~= "none" and actual ~= expected then
    return redis.error_reply("leaderboard key has unexpected type")
  end
end

local counterValue = redis.call("GET", KEYS[1])
local currentCounter = tonumber(counterValue or "0")

if not currentCounter then
  return redis.error_reply("leaderboard counter is invalid")
end

if not counterValue then
  local members = redis.call("HKEYS", KEYS[2])
  for _, member in ipairs(members) do
    local memberId = tonumber(member)
    if memberId and memberId > currentCounter then
      currentCounter = memberId
    end
  end
end

if currentCounter < tonumber(ARGV[1]) then
  currentCounter = tonumber(ARGV[1])
end

redis.call("SET", KEYS[1], currentCounter)
redis.call("HSET", KEYS[2], ARGV[2], ARGV[3])
redis.call("HSET", KEYS[3], ARGV[4], ARGV[2])
redis.call("ZADD", KEYS[4], ARGV[5], ARGV[2])

return "ok"
`;

const REDIS_SUBMIT_SCRIPT = `
local function keyType(key)
  local result = redis.call("TYPE", key)
  if type(result) == "table" then
    return result["ok"]
  end
  return result
end

local expectedTypes = {"string", "hash", "hash", "zset", "string"}

for index, expected in ipairs(expectedTypes) do
  local actual = keyType(KEYS[index])
  if actual ~= "none" and actual ~= expected then
    return redis.error_reply("leaderboard key has unexpected type")
  end
end

local currentLeaders = redis.call("ZRANGE", KEYS[4], 0, 2)

for _, currentMember in ipairs(currentLeaders) do
  local encoded = redis.call("HGET", KEYS[2], currentMember)
  if not encoded then
    return redis.error_reply("leaderboard metadata is missing")
  end

  local decodedOk, decoded = pcall(cjson.decode, encoded)
  local rankedScore = tonumber(redis.call("ZSCORE", KEYS[4], currentMember))

  if not decodedOk
    or type(decoded) ~= "table"
    or tonumber(decoded["id"]) == nil
    or type(decoded["submissionId"]) ~= "string"
    or type(decoded["name"]) ~= "string"
    or tonumber(decoded["score"]) == nil
    or type(decoded["createdAt"]) ~= "string"
    or rankedScore ~= tonumber(decoded["score"]) then
    return redis.error_reply("leaderboard metadata is invalid")
  end
end

local member = redis.call("HGET", KEYS[3], ARGV[1])
local entry = nil
local idempotent = false

if member then
  local existing = redis.call("HGET", KEYS[2], member)
  if not existing then
    return redis.error_reply("submission metadata is missing")
  end

  local existingOk, existingEntry = pcall(cjson.decode, existing)
  if not existingOk
    or type(existingEntry) ~= "table"
    or tonumber(existingEntry["id"]) == nil
    or type(existingEntry["submissionId"]) ~= "string"
    or type(existingEntry["name"]) ~= "string"
    or tonumber(existingEntry["score"]) == nil
    or type(existingEntry["createdAt"]) ~= "string" then
    return redis.error_reply("submission metadata is invalid")
  end

  entry = existingEntry
  redis.call("ZADD", KEYS[4], entry["score"], member)
  idempotent = true
else
  if redis.call("EXISTS", KEYS[5]) == 1 then
    return cjson.encode({rateLimited = true})
  end

  local id = redis.call("INCR", KEYS[1])
  member = string.format("%012d", id)

  while redis.call("HEXISTS", KEYS[2], member) == 1 do
    id = redis.call("INCR", KEYS[1])
    member = string.format("%012d", id)
  end

  entry = {
    id = id,
    submissionId = ARGV[1],
    name = ARGV[2],
    score = tonumber(ARGV[3]),
    createdAt = ARGV[4]
  }
  local encoded = cjson.encode(entry)
  redis.call("HSET", KEYS[2], member, encoded)
  redis.call("HSET", KEYS[3], ARGV[1], member)
  redis.call("ZADD", KEYS[4], ARGV[3], member)
  redis.call("SET", KEYS[5], "1", "EX", ARGV[5])
end

local leaders = {}
local qualified = false
local topMembers = redis.call("ZRANGE", KEYS[4], 0, 2)

for _, topMember in ipairs(topMembers) do
  local encoded = redis.call("HGET", KEYS[2], topMember)
  if encoded then
    leaders[#leaders + 1] = cjson.decode(encoded)
    if topMember == member then
      qualified = true
    end
  end
end

return cjson.encode({
  entry = entry,
  leaderboard = leaders,
  qualified = qualified,
  idempotent = idempotent
})
`;

export class WhenWasItStoreConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "WhenWasItStoreConfigError";
  }
}

export class WhenWasItRateLimitError extends Error {
  constructor() {
    super("This connection has already added a leaderboard score today.");
    this.name = "WhenWasItRateLimitError";
  }
}

function compareEntries(first, second) {
  return first.score - second.score || first.id - second.id;
}

function publicEntry(entry) {
  return {
    id: entry.id,
    name: entry.name,
    score: entry.score,
    createdAt: entry.createdAt,
  };
}

function normalizeEntry(value) {
  if (
    !value ||
    typeof value !== "object" ||
    !Number.isSafeInteger(value.id) ||
    value.id < 1 ||
    typeof value.submissionId !== "string" ||
    typeof value.name !== "string" ||
    !Number.isSafeInteger(value.score) ||
    value.score < 0 ||
    typeof value.createdAt !== "string"
  ) {
    throw new Error("When Was It leaderboard data is malformed.");
  }

  return {
    id: value.id,
    submissionId: value.submissionId,
    name: value.name,
    score: value.score,
    createdAt: value.createdAt,
  };
}

function parseState(serialized, source) {
  try {
    const value = JSON.parse(serialized);

    if (!value || typeof value !== "object" || !Array.isArray(value.entries)) {
      throw new TypeError("expected an entries array");
    }

    return {
      entries: value.entries.map(normalizeEntry).sort(compareEntries),
    };
  } catch (error) {
    throw new Error(`Invalid When Was It leaderboard data in ${source}.`, {
      cause: error,
    });
  }
}

function serializeState(state) {
  return `${JSON.stringify(
    {
      entries: state.entries.map(normalizeEntry).sort(compareEntries),
    },
    null,
    2,
  )}\n`;
}

function redisConfigFromEnvironment() {
  const candidates = [
    {
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
      label: "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN",
    },
    {
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
      label: "KV_REST_API_URL and KV_REST_API_TOKEN",
    },
  ];

  for (const candidate of candidates) {
    if (candidate.url || candidate.token) {
      if (!candidate.url || !candidate.token) {
        throw new WhenWasItStoreConfigError(
          `When Was It Redis is partially configured. Set both ${candidate.label}.`,
        );
      }

      const environment =
        process.env.VERCEL_ENV ||
        (process.env.NODE_ENV === "production" ? "production" : "development");
      const baseKey =
        process.env.WHEN_WAS_IT_REDIS_KEY ||
        `${DEFAULT_REDIS_KEY_PREFIX}:${environment}`;

      return {
        type: "redis",
        url: candidate.url.replace(/\/+$/, ""),
        token: candidate.token,
        syncToken: null,
        keys: {
          counter: `${baseKey}:counter`,
          entries: `${baseKey}:entries`,
          submissions: `${baseKey}:submissions`,
          ranking: `${baseKey}:ranking`,
          rateLimit: `${baseKey}:rate-limit`,
        },
      };
    }
  }

  return null;
}

function storageConfig() {
  const redis = redisConfigFromEnvironment();

  if (redis) {
    return redis;
  }

  if (process.env.NODE_ENV === "production") {
    throw new WhenWasItStoreConfigError(
      "When Was It requires persistent Redis in production.",
    );
  }

  return {
    type: "file",
    file: path.join(process.cwd(), DEFAULT_DATA_FILE),
  };
}

async function redisCommand(config, command) {
  const headers = {
    authorization: `Bearer ${config.token}`,
    "content-type": "application/json",
  };

  if (config.syncToken) {
    headers["upstash-sync-token"] = config.syncToken;
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers,
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });

  let payload;

  try {
    payload = await response.json();
  } catch (error) {
    throw new Error(
      `When Was It Redis returned an invalid response (${response.status}).`,
      { cause: error },
    );
  }

  if (!response.ok || payload.error) {
    throw new Error(
      `When Was It Redis request failed (${response.status}): ${
        payload.error || "unknown error"
      }`,
    );
  }

  config.syncToken =
    response.headers.get("upstash-sync-token") || config.syncToken;

  return payload.result;
}

function memberForId(id) {
  return String(id).padStart(12, "0");
}

async function ensureRedisSeed(config) {
  const entry = JSON.stringify(MIGRATED_ENTRY);

  await redisCommand(config, [
    "EVAL",
    REDIS_SEED_SCRIPT,
    "4",
    config.keys.counter,
    config.keys.entries,
    config.keys.submissions,
    config.keys.ranking,
    String(MIGRATED_ENTRY.id),
    memberForId(MIGRATED_ENTRY.id),
    entry,
    MIGRATED_ENTRY.submissionId,
    String(MIGRATED_ENTRY.score),
  ]);
}

async function readRedisLeaderboard(config) {
  await ensureRedisSeed(config);

  const members = await redisCommand(config, [
    "ZRANGE",
    config.keys.ranking,
    "0",
    "2",
  ]);

  if (!Array.isArray(members) || members.length === 0) {
    return [];
  }

  const serializedEntries = await redisCommand(config, [
    "HMGET",
    config.keys.entries,
    ...members,
  ]);

  if (!Array.isArray(serializedEntries)) {
    throw new Error("When Was It Redis returned invalid leaderboard metadata.");
  }

  return serializedEntries
    .map((serialized) => {
      if (typeof serialized !== "string") {
        throw new Error(
          "When Was It Redis is missing leaderboard entry metadata.",
        );
      }

      return normalizeEntry(JSON.parse(serialized));
    })
    .sort(compareEntries)
    .slice(0, 3)
    .map(publicEntry);
}

async function submitRedisScore(config, submission) {
  await ensureRedisSeed(config);

  const rateLimitDigest = createHmac("sha256", config.token)
    .update(submission.rateLimitIdentity, "utf8")
    .digest("hex");
  const serialized = await redisCommand(config, [
    "EVAL",
    REDIS_SUBMIT_SCRIPT,
    "5",
    config.keys.counter,
    config.keys.entries,
    config.keys.submissions,
    config.keys.ranking,
    `${config.keys.rateLimit}:${rateLimitDigest}`,
    submission.submissionId,
    submission.name,
    String(submission.score),
    submission.createdAt,
    String(SUBMISSION_RATE_LIMIT_SECONDS),
  ]);

  if (typeof serialized !== "string") {
    throw new Error("When Was It Redis returned an invalid submission result.");
  }

  const value = JSON.parse(serialized);

  if (value.rateLimited) {
    throw new WhenWasItRateLimitError();
  }

  return {
    entry: publicEntry(normalizeEntry(value.entry)),
    leaderboard: value.leaderboard
      .map(normalizeEntry)
      .sort(compareEntries)
      .slice(0, 3)
      .map(publicEntry),
    qualified: Boolean(value.qualified),
    idempotent: Boolean(value.idempotent),
  };
}

async function seedFile(file) {
  await mkdir(path.dirname(file), { recursive: true });

  let handle;

  try {
    handle = await open(file, "wx", 0o600);
    await handle.writeFile(
      serializeState({ entries: [MIGRATED_ENTRY] }),
      "utf8",
    );
    await handle.sync();
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  } finally {
    await handle?.close();
  }
}

async function readFileState(file) {
  await seedFile(file);
  return parseState(await readFile(file, "utf8"), file);
}

async function writeFileState(file, state) {
  const temporaryFile = `${file}.${process.pid}.${Date.now()}.tmp`;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(temporaryFile, serializeState(state), {
    encoding: "utf8",
    mode: 0o600,
  });
  await rename(temporaryFile, file);
}

let localWriteQueue = Promise.resolve();
const localSubmissionAttempts = new Map();

function withLocalWriteLock(operation) {
  const result = localWriteQueue.then(operation, operation);
  localWriteQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export async function getWhenWasItLeaderboard() {
  const config = storageConfig();

  if (config.type === "redis") {
    return readRedisLeaderboard(config);
  }

  const state = await readFileState(config.file);
  return state.entries.slice(0, 3).map(publicEntry);
}

export async function submitWhenWasItScore({
  submissionId,
  name,
  score,
  rateLimitIdentity,
  createdAt = new Date().toISOString(),
}) {
  if (
    typeof rateLimitIdentity !== "string" ||
    rateLimitIdentity.length < 1 ||
    rateLimitIdentity.length > 512
  ) {
    throw new TypeError("A valid rate-limit identity is required.");
  }

  const submission = {
    submissionId,
    name,
    score,
    rateLimitIdentity,
    createdAt,
  };
  const config = storageConfig();

  if (config.type === "redis") {
    return submitRedisScore(config, submission);
  }

  return withLocalWriteLock(async () => {
    const state = await readFileState(config.file);
    let entry = state.entries.find(
      (candidate) => candidate.submissionId === submissionId,
    );
    const idempotent = Boolean(entry);

    if (!entry) {
      const rateLimitDigest = createHash("sha256")
        .update(rateLimitIdentity, "utf8")
        .digest("hex");
      const now = Date.now();
      const rateLimitExpiry = localSubmissionAttempts.get(rateLimitDigest);

      if (rateLimitExpiry && rateLimitExpiry > now) {
        throw new WhenWasItRateLimitError();
      }

      const id = state.entries.reduce(
        (largest, candidate) => Math.max(largest, candidate.id),
        0,
      ) + 1;
      entry = normalizeEntry({ id, ...submission });
      state.entries.push(entry);
      state.entries.sort(compareEntries);
      await writeFileState(config.file, state);
      localSubmissionAttempts.set(
        rateLimitDigest,
        now + SUBMISSION_RATE_LIMIT_SECONDS * 1000,
      );
    }

    const leaderboard = state.entries.slice(0, 3);

    return {
      entry: publicEntry(entry),
      leaderboard: leaderboard.map(publicEntry),
      qualified: leaderboard.some(
        (candidate) => candidate.id === entry.id,
      ),
      idempotent,
    };
  });
}
