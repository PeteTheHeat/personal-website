import "server-only";

import { mkdir, open, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  SEED_STATE,
  TARGET,
  normalizeChallengeState,
  transitionChallengeState,
  validateProgress,
} from "./domain.js";

const DEFAULT_REDIS_KEY_PREFIX = "sacko-tracker:state:v1";
const DEFAULT_DATA_DIRECTORY = ".data";
const DEFAULT_DATA_FILE = "sacko-tracker.json";
const LOGIN_RATE_LIMIT_ATTEMPTS = 8;
const LOGIN_RATE_LIMIT_WINDOW_SECONDS = 15 * 60;

const REDIS_UPDATE_SCRIPT = `
local currentRaw = redis.call("GET", KEYS[1])
local nextState = cjson.decode(ARGV[1])

local total = tonumber(nextState["donuts"])
  + tonumber(nextState["beers"])
  + tonumber(nextState["miles"])

if total >= tonumber(ARGV[2]) then
  -- The pre-EVAL candidate may be stale. Only the state currently in Redis can
  -- supply an existing completion timestamp.
  nextState["completedAt"] = cjson.null

  if currentRaw then
    local currentState = cjson.decode(currentRaw)
    if currentState["completedAt"] and currentState["completedAt"] ~= cjson.null then
      nextState["completedAt"] = currentState["completedAt"]
    end
  end

  if not nextState["completedAt"] or nextState["completedAt"] == cjson.null then
    nextState["completedAt"] = ARGV[3]
  end
else
  nextState["completedAt"] = cjson.null
end

local encoded = cjson.encode(nextState)
redis.call("SET", KEYS[1], encoded)
return encoded
`;

const REDIS_LOGIN_RATE_LIMIT_SCRIPT = `
local attempts = redis.call("INCR", KEYS[1])
if attempts == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
return attempts
`;

export class SackoStoreConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "SackoStoreConfigError";
  }
}

function serializeState(state) {
  return `${JSON.stringify(normalizeChallengeState(state), null, 2)}\n`;
}

function parseState(serialized, source) {
  try {
    return normalizeChallengeState(JSON.parse(serialized));
  } catch (error) {
    throw new Error(`Invalid Sacko Tracker state in ${source}: ${error.message}`, {
      cause: error,
    });
  }
}

function timestamp(value = new Date()) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError("now must be a valid timestamp");
  }

  return date.toISOString();
}

function redisConfigFromEnvironment() {
  const upstash = {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    label: "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN",
  };
  const vercelKv = {
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
    label: "KV_REST_API_URL and KV_REST_API_TOKEN",
  };

  for (const candidate of [upstash, vercelKv]) {
    if (candidate.url || candidate.token) {
      if (!candidate.url || !candidate.token) {
        throw new SackoStoreConfigError(
          `Sacko Tracker Redis is partially configured. Set both ${candidate.label}.`,
        );
      }

      return {
        type: "redis",
        url: candidate.url.replace(/\/+$/, ""),
        token: candidate.token,
        key:
          process.env.SACKO_REDIS_KEY ||
          `${DEFAULT_REDIS_KEY_PREFIX}:${
            process.env.VERCEL_ENV ||
            (process.env.NODE_ENV === "production" ? "production" : "development")
          }`,
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
    throw new SackoStoreConfigError(
      "Sacko Tracker requires persistent Redis in production. Set " +
        "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or " +
        "KV_REST_API_URL and KV_REST_API_TOKEN).",
    );
  }

  return {
    type: "file",
    file: path.join(process.cwd(), DEFAULT_DATA_DIRECTORY, DEFAULT_DATA_FILE),
  };
}

async function redisCommand(config, command) {
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });

  let payload;

  try {
    payload = await response.json();
  } catch (error) {
    throw new Error(
      `Sacko Tracker Redis returned an invalid response (${response.status}).`,
      { cause: error },
    );
  }

  if (!response.ok || payload.error) {
    throw new Error(
      `Sacko Tracker Redis request failed (${response.status}): ${
        payload.error || "unknown error"
      }`,
    );
  }

  return payload.result;
}

async function seedRedis(config) {
  await redisCommand(config, [
    "SET",
    config.key,
    JSON.stringify(SEED_STATE),
    "NX",
  ]);
}

async function readRedis(config) {
  let serialized = await redisCommand(config, ["GET", config.key]);

  if (serialized === null) {
    await seedRedis(config);
    serialized = await redisCommand(config, ["GET", config.key]);
  }

  if (typeof serialized !== "string") {
    throw new Error("Sacko Tracker Redis did not return a stored state.");
  }

  return parseState(serialized, "Redis");
}

async function seedFile(file) {
  await mkdir(path.dirname(file), { recursive: true });

  let handle;

  try {
    handle = await open(file, "wx", 0o600);
    await handle.writeFile(serializeState(SEED_STATE), "utf8");
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
const localLoginAttempts = new Map();

function withLocalWriteLock(operation) {
  const result = localWriteQueue.then(operation, operation);
  localWriteQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export async function getChallengeState() {
  const config = storageConfig();

  return config.type === "redis"
    ? readRedis(config)
    : readFileState(config.file);
}

export async function updateChallengeProgress(progress, now = new Date()) {
  const validatedProgress = validateProgress(progress);
  const updatedAt = timestamp(now);
  const config = storageConfig();

  if (config.type === "redis") {
    const current = await readRedis(config);
    const candidate = transitionChallengeState(current, validatedProgress, updatedAt);
    const serialized = await redisCommand(config, [
      "EVAL",
      REDIS_UPDATE_SCRIPT,
      "1",
      config.key,
      JSON.stringify(candidate),
      String(TARGET),
      updatedAt,
    ]);

    if (typeof serialized !== "string") {
      throw new Error("Sacko Tracker Redis update did not return a stored state.");
    }

    return parseState(serialized, "Redis");
  }

  return withLocalWriteLock(async () => {
    const current = await readFileState(config.file);
    const candidate = transitionChallengeState(current, validatedProgress, updatedAt);
    await writeFileState(config.file, candidate);
    return candidate;
  });
}

export async function consumeSackoLoginAttempt(identifier, now = new Date()) {
  if (!/^[a-f0-9]{64}$/.test(identifier)) {
    throw new TypeError("Login rate-limit identifier must be a SHA-256 digest.");
  }

  const config = storageConfig();

  if (config.type === "redis") {
    const attempts = Number(
      await redisCommand(config, [
        "EVAL",
        REDIS_LOGIN_RATE_LIMIT_SCRIPT,
        "1",
        `${config.key}:login:${identifier}`,
        String(LOGIN_RATE_LIMIT_WINDOW_SECONDS),
      ]),
    );

    if (!Number.isFinite(attempts)) {
      throw new Error(
        "Sacko Tracker Redis returned an invalid login attempt count.",
      );
    }

    return attempts <= LOGIN_RATE_LIMIT_ATTEMPTS;
  }

  const nowMs = new Date(now).getTime();
  const windowMs = LOGIN_RATE_LIMIT_WINDOW_SECONDS * 1000;
  const current = localLoginAttempts.get(identifier);
  const next =
    !current || current.expiresAt <= nowMs
      ? { attempts: 1, expiresAt: nowMs + windowMs }
      : { ...current, attempts: current.attempts + 1 };

  localLoginAttempts.set(identifier, next);
  return next.attempts <= LOGIN_RATE_LIMIT_ATTEMPTS;
}

export async function clearSackoLoginAttempts(identifier) {
  if (!/^[a-f0-9]{64}$/.test(identifier)) {
    throw new TypeError("Login rate-limit identifier must be a SHA-256 digest.");
  }

  const config = storageConfig();

  if (config.type === "redis") {
    await redisCommand(config, ["DEL", `${config.key}:login:${identifier}`]);
    return;
  }

  localLoginAttempts.delete(identifier);
}
