export const DISPLAY_NAME_CHANGE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const SUCCESS_KEYS = [
  "canChange",
  "changed",
  "displayName",
  "displayNameChangedAtMs",
  "nextDisplayNameChangeAtMs",
] as const;

type RecordValue = Record<string, unknown>;

// Keep this aligned with the callable: control/format characters and the two
// Unicode line/paragraph separators are never valid inside a display name.
const FORBIDDEN_DISPLAY_NAME_CHARACTERS = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;

export type DisplayNameChangeSource = "server" | "cache" | "callable";

export type DisplayNameChangeState = {
  displayName: string;
  displayNameChangedAtMs: number | null;
  nextDisplayNameChangeAtMs: number | null;
  canChange: boolean;
  needsCanonicalization: boolean;
  source: DisplayNameChangeSource;
};

export type UpdateDisplayNameResult = DisplayNameChangeState & {
  changed: boolean;
  source: "callable";
};

export type DisplayNameAvailability = {
  title: string;
  description: string;
  nextChangeAtMs: number | null;
  blocksSubmit: boolean;
  stale: boolean;
};

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: RecordValue, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
  );
}

function isMillis(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
  );
}

function isNullableMillis(value: unknown): value is number | null {
  return value === null || isMillis(value);
}

function timestampToMillis(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) return null;

  const toMillis = value.toMillis;
  if (typeof toMillis === "function") {
    const result = toMillis.call(value) as unknown;
    return isMillis(result) ? result : null;
  }

  const seconds = value.seconds;
  const nanoseconds = value.nanoseconds ?? 0;
  if (
    !Number.isSafeInteger(seconds) ||
    typeof seconds !== "number" ||
    !Number.isInteger(nanoseconds) ||
    typeof nanoseconds !== "number" ||
    nanoseconds < 0 ||
    nanoseconds >= 1_000_000_000
  ) {
    return null;
  }
  const millis = seconds * 1000 + Math.floor(nanoseconds / 1_000_000);
  return isMillis(millis) ? millis : null;
}

export function isCanonicalDisplayName(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value === value.trim() &&
    Array.from(value).length >= 2 &&
    Array.from(value).length <= 120 &&
    !FORBIDDEN_DISPLAY_NAME_CHARACTERS.test(value)
  );
}

export function getDisplayNameInputError(displayName: string): string | null {
  const normalized = displayName.trim();
  const length = Array.from(normalized).length;
  if (length < 2) return "Enter at least 2 characters.";
  if (length > 120) return "Use no more than 120 characters.";
  if (FORBIDDEN_DISPLAY_NAME_CHARACTERS.test(normalized)) {
    return "Display names cannot contain control, formatting, or line-separator characters.";
  }
  return null;
}

/**
 * Parses only the exact callable success contract. A malformed response is
 * unavailable state, never permission to enable a rename.
 */
export function parseUpdateDisplayNameResult(
  value: unknown,
): UpdateDisplayNameResult | null {
  if (!isRecord(value) || !hasExactKeys(value, SUCCESS_KEYS)) return null;
  if (
    !isCanonicalDisplayName(value.displayName) ||
    typeof value.changed !== "boolean" ||
    typeof value.canChange !== "boolean" ||
    !isNullableMillis(value.displayNameChangedAtMs) ||
    !isNullableMillis(value.nextDisplayNameChangeAtMs)
  ) {
    return null;
  }

  const changedAt = value.displayNameChangedAtMs;
  const nextAt = value.nextDisplayNameChangeAtMs;
  if ((changedAt === null) !== (nextAt === null)) return null;
  if (
    changedAt !== null &&
    nextAt !== null &&
    nextAt - changedAt !== DISPLAY_NAME_CHANGE_WINDOW_MS
  ) {
    return null;
  }
  if (value.changed && (changedAt === null || nextAt === null)) return null;
  if (value.changed && value.canChange) return null;

  return {
    displayName: value.displayName,
    changed: value.changed,
    displayNameChangedAtMs: changedAt,
    nextDisplayNameChangeAtMs: nextAt,
    canChange: value.canChange,
    needsCanonicalization: false,
    source: "callable",
  };
}

/**
 * Parses the signed-in account's own private profile document. The document
 * may contain many unrelated fields, so only the canonical name and optional
 * server Timestamp are read.
 */
export function parseOwnProfileDisplayNameState(
  value: unknown,
  options: { nowMs: number; fromCache: boolean },
): DisplayNameChangeState | null {
  if (!isRecord(value)) return null;
  const rawName = value.displayName;
  if (typeof rawName !== "string" || rawName.trim().length === 0) return null;

  const changedAt = timestampToMillis(value.displayNameChangedAt);
  if (
    value.displayNameChangedAt !== null &&
    value.displayNameChangedAt !== undefined &&
    changedAt === null
  ) {
    return null;
  }
  const nextAt =
    changedAt === null ? null : changedAt + DISPLAY_NAME_CHANGE_WINDOW_MS;

  return {
    displayName: rawName.trim(),
    displayNameChangedAtMs: changedAt,
    nextDisplayNameChangeAtMs: nextAt,
    canChange: nextAt === null || options.nowMs >= nextAt,
    needsCanonicalization: rawName !== rawName.trim(),
    source: options.fromCache ? "cache" : "server",
  };
}

export function getDisplayNameAvailability(
  state: DisplayNameChangeState,
  nowMs: number,
): DisplayNameAvailability {
  const nextAt = state.nextDisplayNameChangeAtMs;
  // `canChange` is a snapshot hint, not a permanent lock. The page keeps its
  // own clock running, so the field must unlock at the authoritative boundary
  // even when Firestore does not emit another snapshot at that exact minute.
  const knownCooldown =
    nextAt !== null ? nextAt > nowMs : !state.canChange;

  if (state.source === "cache") {
    if (knownCooldown && nextAt !== null) {
      return {
        title: "Last known name-change date",
        description:
          "This date came from cached profile metadata. The server will confirm it before any change.",
        nextChangeAtMs: nextAt,
        blocksSubmit: true,
        stale: true,
      };
    }
    return {
      title: "Checking name-change availability…",
      description:
        "This profile copy may be out of date. Saving always asks the server; availability is not assumed.",
      nextChangeAtMs: nextAt,
      blocksSubmit: false,
      stale: true,
    };
  }

  if (knownCooldown && nextAt !== null) {
    return {
      title: "Your next display-name change",
      description:
        "The 30-day limit is enforced by YO Voice, not by this browser.",
      nextChangeAtMs: nextAt,
      blocksSubmit: true,
      stale: false,
    };
  }

  return {
    title: "Display-name change available",
    description:
      "The server will still validate the name and confirm availability when you save.",
    nextChangeAtMs: nextAt,
    blocksSubmit: false,
    stale: false,
  };
}

export function formatDisplayNameChangeDate(
  millis: number,
  locale?: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(millis));
}

type CooldownDetails = {
  nextDisplayNameChangeAtMs: number;
  retryAfterSeconds: number;
};

export type DisplayNameSyncPendingDetails = {
  displayName: string;
  displayNameChangedAtMs: number;
  nextDisplayNameChangeAtMs: number;
};

export type DisplayNameAuthAccountMissingDetails =
  DisplayNameSyncPendingDetails;

export function parseDisplayNameCooldownError(
  error: unknown,
): CooldownDetails | null {
  if (!isRecord(error)) return null;
  const code = error.code;
  if (
    code !== "failed-precondition" &&
    code !== "functions/failed-precondition"
  ) {
    return null;
  }
  const details = error.details;
  if (
    !isRecord(details) ||
    !hasExactKeys(details, [
      "reason",
      "nextDisplayNameChangeAtMs",
      "retryAfterSeconds",
    ]) ||
    details.reason !== "display-name-cooldown"
  ) {
    return null;
  }
  if (
    !isMillis(details.nextDisplayNameChangeAtMs) ||
    !isMillis(details.retryAfterSeconds)
  ) {
    return null;
  }
  return {
    nextDisplayNameChangeAtMs: details.nextDisplayNameChangeAtMs,
    retryAfterSeconds: details.retryAfterSeconds,
  };
}

/**
 * The canonical Firestore transaction can succeed while the secondary Auth
 * display-name mirror is temporarily unavailable. This error is not a failed
 * rename: the returned canonical values must replace any stale browser state,
 * and retrying the same name asks the callable to finish the mirror sync.
 */
export function parseDisplayNameSyncPendingError(
  error: unknown,
): DisplayNameSyncPendingDetails | null {
  if (!isRecord(error)) return null;
  const code = error.code;
  if (code !== "unavailable" && code !== "functions/unavailable") return null;
  const details = error.details;
  if (
    !isRecord(details) ||
    !hasExactKeys(details, [
      "reason",
      "displayName",
      "displayNameChangedAtMs",
      "nextDisplayNameChangeAtMs",
    ]) ||
    details.reason !== "auth-display-name-sync-pending" ||
    !isCanonicalDisplayName(details.displayName) ||
    !isMillis(details.displayNameChangedAtMs) ||
    !isMillis(details.nextDisplayNameChangeAtMs) ||
    details.nextDisplayNameChangeAtMs - details.displayNameChangedAtMs !==
      DISPLAY_NAME_CHANGE_WINDOW_MS
  ) {
    return null;
  }
  return {
    displayName: details.displayName,
    displayNameChangedAtMs: details.displayNameChangedAtMs,
    nextDisplayNameChangeAtMs: details.nextDisplayNameChangeAtMs,
  };
}

/**
 * Firestore is canonical and can commit before the secondary Auth lookup
 * discovers that the sign-in account disappeared. Preserve the committed
 * name and cooldown truth, but do not offer the transient Auth-sync retry.
 */
export function parseDisplayNameAuthAccountMissingError(
  error: unknown,
): DisplayNameAuthAccountMissingDetails | null {
  if (!isRecord(error)) return null;
  const code = error.code;
  if (
    code !== "failed-precondition" &&
    code !== "functions/failed-precondition"
  ) {
    return null;
  }
  const details = error.details;
  if (
    !isRecord(details) ||
    !hasExactKeys(details, [
      "reason",
      "displayName",
      "displayNameChangedAtMs",
      "nextDisplayNameChangeAtMs",
    ]) ||
    details.reason !== "auth-account-missing" ||
    !isCanonicalDisplayName(details.displayName) ||
    !isMillis(details.displayNameChangedAtMs) ||
    !isMillis(details.nextDisplayNameChangeAtMs) ||
    details.nextDisplayNameChangeAtMs - details.displayNameChangedAtMs !==
      DISPLAY_NAME_CHANGE_WINDOW_MS
  ) {
    return null;
  }
  return {
    displayName: details.displayName,
    displayNameChangedAtMs: details.displayNameChangedAtMs,
    nextDisplayNameChangeAtMs: details.nextDisplayNameChangeAtMs,
  };
}

export function getDisplayNameChangeErrorMessage(error: unknown): string {
  if (!isRecord(error)) {
    return "The display name could not be changed. Please try again.";
  }
  const code = error.code;
  if (parseDisplayNameSyncPendingError(error)) {
    return "Your YO Voice profile name was saved, but account sync is still pending. Retry the same name to finish syncing.";
  }
  if (parseDisplayNameAuthAccountMissingError(error)) {
    return "Your YO Voice profile name was saved, but the sign-in account could not be found. Sign in again before continuing.";
  }
  if (code === "invalid-argument" || code === "functions/invalid-argument") {
    return "Use 2–120 visible characters for your display name.";
  }
  if (code === "unauthenticated" || code === "functions/unauthenticated") {
    return "Your session expired. Sign in again before changing your name.";
  }
  if (
    code === "permission-denied" ||
    code === "functions/permission-denied"
  ) {
    return "This account cannot change its display name right now.";
  }
  if (code === "not-found" || code === "functions/not-found") {
    return "Your YO Voice profile is not available yet. Open the app once and try again.";
  }
  if (
    code === "resource-exhausted" ||
    code === "functions/resource-exhausted"
  ) {
    return "Too many display-name attempts. Wait a minute and try again.";
  }
  if (parseDisplayNameCooldownError(error)) {
    return "Your display name is still within the 30-day change limit.";
  }
  if (
    code === "failed-precondition" ||
    code === "functions/failed-precondition"
  ) {
    const details = error.details;
    const reason = isRecord(details) ? details.reason : null;
    if (reason === "email-verification-required") {
      return "Verify your email before changing your display name.";
    }
    if (reason === "auth-account-missing") {
      return "Your sign-in account could not be verified. Sign in again and retry.";
    }
    return "YO Voice could not verify your display-name state. Reopen the profile and try again.";
  }
  return "The display name could not be changed. Please try again.";
}
