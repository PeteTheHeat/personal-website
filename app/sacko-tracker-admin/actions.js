"use server";

import { createHash } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearSackoAdminSession,
  createSackoAdminSession,
  isSackoAdminAuthenticated,
  isSackoAuthConfigured,
  verifySackoAdminPassword,
} from "../../lib/sacko/auth";
import {
  clearSackoLoginAttempts,
  consumeSackoLoginAttempt,
  updateChallengeProgress,
} from "../../lib/sacko/store";
import { SACKO_STATE_CACHE_TAG } from "../../lib/sacko/cached-state";

const ADMIN_PATH = "/sacko-tracker-admin";
const PUBLIC_PATH = "/sacko-tracker";
const FAILED_LOGIN_DELAY_MS = 600;

function redirectWithResult(kind, code) {
  redirect(`${ADMIN_PATH}?${kind}=${encodeURIComponent(code)}`);
}

function getFormText(formData, name) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function parseWholeNumber(value) {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

function parseDecimal(value) {
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function parseCompletionTiming(value) {
  if (value === "recorded") {
    return null;
  }

  if (value === "before-deadline" || value === "after-deadline") {
    return value;
  }

  return undefined;
}

async function getLoginFingerprint() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwardedFor || requestHeaders.get("x-real-ip") || "unknown";
  return createHash("sha256").update(address, "utf8").digest("hex");
}

export async function loginSackoAdmin(formData) {
  if (!isSackoAuthConfigured()) {
    redirectWithResult("error", "not-configured");
  }

  const loginFingerprint = await getLoginFingerprint();
  let loginAllowed;

  try {
    loginAllowed = await consumeSackoLoginAttempt(loginFingerprint);
  } catch (error) {
    console.error("Unable to check the Sacko admin login limit.", error);
    redirectWithResult("error", "auth-unavailable");
  }

  if (!loginAllowed) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
    redirectWithResult("error", "rate-limited");
  }

  const password = formData.get("password");

  if (typeof password !== "string" || !verifySackoAdminPassword(password)) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
    redirectWithResult("error", "invalid-password");
  }

  await clearSackoLoginAttempts(loginFingerprint);
  await createSackoAdminSession();
  redirectWithResult("success", "signed-in");
}

export async function logoutSackoAdmin() {
  await isSackoAdminAuthenticated();
  await clearSackoAdminSession();
  redirectWithResult("success", "signed-out");
}

export async function updateSackoChallenge(formData) {
  if (!(await isSackoAdminAuthenticated())) {
    redirectWithResult("error", "session-expired");
  }

  const donuts = parseWholeNumber(getFormText(formData, "donuts"));
  const beers = parseWholeNumber(getFormText(formData, "beers"));
  const miles = parseDecimal(getFormText(formData, "miles"));
  const completionTiming = parseCompletionTiming(
    getFormText(formData, "completionTiming"),
  );

  if (
    donuts === null ||
    beers === null ||
    miles === null ||
    completionTiming === undefined
  ) {
    redirectWithResult("error", "invalid-progress");
  }

  try {
    await updateChallengeProgress(
      { donuts, beers, miles },
      new Date(),
      completionTiming,
    );
  } catch (error) {
    console.error("Unable to update Sacko challenge progress.", error);
    redirectWithResult("error", "save-failed");
  }

  revalidatePath(PUBLIC_PATH);
  revalidatePath(ADMIN_PATH);
  updateTag(SACKO_STATE_CACHE_TAG);
  redirectWithResult("success", "progress-updated");
}
