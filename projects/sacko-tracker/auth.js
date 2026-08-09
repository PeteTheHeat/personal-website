import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "sacko-admin-session";
const SESSION_COOKIE_PATH = "/sacko-tracker-admin";
const SESSION_LIFETIME_SECONDS = 8 * 60 * 60;
const SESSION_LIFETIME_MS = SESSION_LIFETIME_SECONDS * 1000;
const MINIMUM_PASSWORD_LENGTH = 12;
const MINIMUM_SESSION_SECRET_LENGTH = 32;

function getPassword() {
  return process.env.SACKO_ADMIN_PASSWORD ?? "";
}

function getSessionSecret() {
  return process.env.SACKO_SESSION_SECRET ?? "";
}

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest();
}

function signSessionPayload(payload) {
  return createHmac("sha256", getSessionSecret()).update(payload, "utf8").digest();
}

function signaturesMatch(payload, encodedSignature) {
  let suppliedSignature;

  try {
    suppliedSignature = Buffer.from(encodedSignature, "base64url");
  } catch {
    return false;
  }

  const expectedSignature = signSessionPayload(payload);

  return (
    suppliedSignature.length === expectedSignature.length &&
    timingSafeEqual(suppliedSignature, expectedSignature)
  );
}

function createSessionValue(now = new Date()) {
  const issuedAt = now.getTime();
  const expiresAt = issuedAt + SESSION_LIFETIME_MS;
  const payload = `v1.${issuedAt}.${expiresAt}`;
  const signature = signSessionPayload(payload).toString("base64url");

  return {
    expiresAt,
    value: `${payload}.${signature}`,
  };
}

function isValidSessionValue(value, now = new Date()) {
  if (!isSackoAuthConfigured() || typeof value !== "string") {
    return false;
  }

  const [version, issuedAtValue, expiresAtValue, encodedSignature, ...extra] =
    value.split(".");
  const issuedAt = Number(issuedAtValue);
  const expiresAt = Number(expiresAtValue);

  if (
    version !== "v1" ||
    extra.length > 0 ||
    !Number.isSafeInteger(issuedAt) ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= issuedAt ||
    expiresAt - issuedAt !== SESSION_LIFETIME_MS ||
    issuedAt > now.getTime() + 60_000 ||
    expiresAt <= now.getTime()
  ) {
    return false;
  }

  const payload = `${version}.${issuedAtValue}.${expiresAtValue}`;
  return signaturesMatch(payload, encodedSignature);
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: SESSION_COOKIE_PATH,
  };
}

export function getMissingSackoAuthEnvironmentVariables() {
  const missing = [];

  if (getPassword().length < MINIMUM_PASSWORD_LENGTH) {
    missing.push("SACKO_ADMIN_PASSWORD");
  }

  if (getSessionSecret().length < MINIMUM_SESSION_SECRET_LENGTH) {
    missing.push("SACKO_SESSION_SECRET");
  }

  return missing;
}

export function isSackoAuthConfigured() {
  return getMissingSackoAuthEnvironmentVariables().length === 0;
}

export function verifySackoAdminPassword(candidate) {
  if (!isSackoAuthConfigured() || typeof candidate !== "string") {
    return false;
  }

  return timingSafeEqual(sha256(candidate), sha256(getPassword()));
}

export async function createSackoAdminSession(now = new Date()) {
  if (!isSackoAuthConfigured()) {
    throw new Error("Sacko admin authentication is not configured.");
  }

  const cookieStore = await cookies();
  const session = createSessionValue(now);

  cookieStore.set(SESSION_COOKIE_NAME, session.value, {
    ...sessionCookieOptions(),
    expires: new Date(session.expiresAt),
    maxAge: SESSION_LIFETIME_SECONDS,
  });
}

export async function clearSackoAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
}

export async function isSackoAdminAuthenticated(now = new Date()) {
  if (!isSackoAuthConfigured()) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return isValidSessionValue(sessionValue, now);
}
