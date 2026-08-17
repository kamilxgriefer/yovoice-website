const PUBLIC_STATS_SCHEMA_VERSION = 2;
const MAX_STALENESS_MS = 15 * 60 * 1000;
const MAX_FUTURE_CLOCK_SKEW_MS = 60 * 1000;
const PUBLIC_STATS_KEYS = [
  "activeAccounts",
  "existingRooms",
  "schemaVersion",
  "updatedAt",
] as const;

export type VerifiedPublicStats = {
  activeAccounts: number;
  existingRooms: number;
  updatedAt: Date;
};

export type ParsedPublicStats =
  | { status: "fresh"; stats: VerifiedPublicStats }
  | { status: "stale" | "unavailable"; stats: null };

function isNonNegativeSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function timestampSeconds(value: unknown): number | null {
  if (typeof value !== "object" || value === null || !("seconds" in value)) {
    return null;
  }
  const seconds = (value as { seconds?: unknown }).seconds;
  return typeof seconds === "number" && Number.isSafeInteger(seconds)
    ? seconds
    : null;
}

export function parseVerifiedPublicStats(
  value: Record<string, unknown>,
  now = Date.now(),
): ParsedPublicStats {
  const keys = Object.keys(value).sort();
  const hasExactSchema =
    keys.length === PUBLIC_STATS_KEYS.length &&
    PUBLIC_STATS_KEYS.every((key, index) => keys[index] === key);
  const seconds = timestampSeconds(value.updatedAt);
  if (
    !hasExactSchema ||
    value.schemaVersion !== PUBLIC_STATS_SCHEMA_VERSION ||
    !isNonNegativeSafeInteger(value.activeAccounts) ||
    !isNonNegativeSafeInteger(value.existingRooms) ||
    seconds === null
  ) {
    return { status: "unavailable", stats: null };
  }

  const updatedAt = new Date(seconds * 1000);
  const age = now - updatedAt.getTime();
  if (age < -MAX_FUTURE_CLOCK_SKEW_MS) {
    return { status: "unavailable", stats: null };
  }
  if (age > MAX_STALENESS_MS) {
    return { status: "stale", stats: null };
  }

  return {
    status: "fresh",
    stats: {
      activeAccounts: value.activeAccounts,
      existingRooms: value.existingRooms,
      updatedAt,
    },
  };
}

export const publicStatsFreshnessMs = MAX_STALENESS_MS;
