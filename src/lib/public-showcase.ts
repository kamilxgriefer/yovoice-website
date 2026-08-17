const PUBLIC_SHOWCASE_SCHEMA_VERSION = 1;
const MAX_FUTURE_CLOCK_SKEW_MS = 60 * 1000;
const MAX_DOCUMENT_LIFETIME_MS = 3 * 60 * 1000;
const ROOT_KEYS = [
  "activityValidUntil",
  "clubs",
  "generatedAt",
  "people",
  "schemaVersion",
  "validUntil",
] as const;
const PERSON_KEYS = ["accountType", "activity", "displayName"] as const;
const CLUB_KEYS = ["memberCount", "name"] as const;

export type PublicShowcasePerson = {
  displayName: string;
  accountType: "personal" | "creator" | "official";
  activity: "activeRecently" | "undisclosed";
};

export type PublicShowcaseClub = {
  name: string;
  memberCount: number;
};

export type VerifiedPublicShowcase = {
  people: PublicShowcasePerson[];
  clubs: PublicShowcaseClub[];
  generatedAt: Date;
  activityValidUntil: Date;
  validUntil: Date;
};

export type ParsedPublicShowcase =
  | { status: "fresh"; showcase: VerifiedPublicShowcase }
  | { status: "stale" | "unavailable"; showcase: null };

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]) {
  const keys = Object.keys(value).sort();
  return keys.length === expected.length && expected.every((key, i) => keys[i] === key);
}

function timestampMillis(value: unknown): number | null {
  if (typeof value !== "object" || value === null || !("seconds" in value)) return null;
  const seconds = (value as { seconds?: unknown }).seconds;
  return typeof seconds === "number" && Number.isSafeInteger(seconds)
    ? seconds * 1000
    : null;
}

function safeLabel(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= maxLength ? normalized : null;
}

function parsePerson(value: unknown): PublicShowcasePerson | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const displayName = safeLabel(row.displayName, 80);
  if (
    !hasExactKeys(row, PERSON_KEYS) ||
    displayName === null ||
    !["personal", "creator", "official"].includes(String(row.accountType)) ||
    !["activeRecently", "undisclosed"].includes(String(row.activity))
  ) {
    return null;
  }
  return {
    displayName,
    accountType: row.accountType as PublicShowcasePerson["accountType"],
    activity: row.activity as PublicShowcasePerson["activity"],
  };
}

function parseClub(value: unknown): PublicShowcaseClub | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const name = safeLabel(row.name, 80);
  if (
    !hasExactKeys(row, CLUB_KEYS) ||
    name === null ||
    typeof row.memberCount !== "number" ||
    !Number.isSafeInteger(row.memberCount) ||
    row.memberCount < 0
  ) {
    return null;
  }
  return { name, memberCount: row.memberCount };
}

export function parseVerifiedPublicShowcase(
  value: Record<string, unknown>,
  now = Date.now(),
): ParsedPublicShowcase {
  if (
    !hasExactKeys(value, ROOT_KEYS) ||
    value.schemaVersion !== PUBLIC_SHOWCASE_SCHEMA_VERSION ||
    !Array.isArray(value.people) ||
    value.people.length > 4 ||
    !Array.isArray(value.clubs) ||
    value.clubs.length > 4
  ) {
    return { status: "unavailable", showcase: null };
  }

  const people = value.people.map(parsePerson);
  const clubs = value.clubs.map(parseClub);
  const generatedAtMs = timestampMillis(value.generatedAt);
  const activityValidUntilMs = timestampMillis(value.activityValidUntil);
  const validUntilMs = timestampMillis(value.validUntil);
  if (
    people.some((row) => row === null) ||
    clubs.some((row) => row === null) ||
    generatedAtMs === null ||
    activityValidUntilMs === null ||
    validUntilMs === null ||
    generatedAtMs > now + MAX_FUTURE_CLOCK_SKEW_MS ||
    validUntilMs <= generatedAtMs ||
    activityValidUntilMs <= generatedAtMs ||
    activityValidUntilMs > validUntilMs ||
    validUntilMs - generatedAtMs > MAX_DOCUMENT_LIFETIME_MS
  ) {
    return { status: "unavailable", showcase: null };
  }
  if (validUntilMs <= now) return { status: "stale", showcase: null };

  return {
    status: "fresh",
    showcase: {
      people: (people as PublicShowcasePerson[]).map((person) =>
        activityValidUntilMs <= now
          ? { ...person, activity: "undisclosed" as const }
          : person,
      ),
      clubs: clubs as PublicShowcaseClub[],
      generatedAt: new Date(generatedAtMs),
      activityValidUntil: new Date(activityValidUntilMs),
      validUntil: new Date(validUntilMs),
    },
  };
}
