import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import {
  DISPLAY_NAME_CHANGE_WINDOW_MS,
  formatDisplayNameChangeDate,
  getDisplayNameAvailability,
  getDisplayNameChangeErrorMessage,
  getDisplayNameInputError,
  isCanonicalDisplayName,
  parseDisplayNameCooldownError,
  parseDisplayNameAuthAccountMissingError,
  parseDisplayNameSyncPendingError,
  parseOwnProfileDisplayNameState,
  parseUpdateDisplayNameResult,
} from "../src/lib/profile/display-name-change.ts";

const CHANGED_AT = Date.UTC(2026, 7, 17, 12, 0, 0);
const NEXT_AT = CHANGED_AT + DISPLAY_NAME_CHANGE_WINDOW_MS;

function success(overrides: Record<string, unknown> = {}) {
  return {
    displayName: "Nowa Nazwa 🌙",
    changed: true,
    displayNameChangedAtMs: CHANGED_AT,
    nextDisplayNameChangeAtMs: NEXT_AT,
    canChange: false,
    ...overrides,
  };
}

describe("display-name callable contract", () => {
  test("website profile save has no client-side Auth-first mutation", () => {
    const page = readFileSync(
      new URL(
        "../src/app/(account)/account/profile/page.tsx",
        import.meta.url,
      ),
      "utf8",
    );
    const provider = readFileSync(
      new URL("../src/providers/auth-provider.tsx", import.meta.url),
      "utf8",
    );
    assert.match(page, /"updateMyDisplayName"/);
    assert.doesNotMatch(page, /updateProfile\s*\(/);
    assert.doesNotMatch(provider, /updateDisplayName:\s*async/);
  });

  test("accepts the exact canonical success response", () => {
    assert.deepEqual(parseUpdateDisplayNameResult(success()), {
      displayName: "Nowa Nazwa 🌙",
      changed: true,
      displayNameChangedAtMs: CHANGED_AT,
      nextDisplayNameChangeAtMs: NEXT_AT,
      canChange: false,
      needsCanonicalization: false,
      source: "callable",
    });
  });

  test("accepts legacy idempotent success without cooldown metadata", () => {
    assert.deepEqual(
      parseUpdateDisplayNameResult(
        success({
          changed: false,
          displayNameChangedAtMs: null,
          nextDisplayNameChangeAtMs: null,
          canChange: true,
        }),
      ),
      {
        displayName: "Nowa Nazwa 🌙",
        changed: false,
        displayNameChangedAtMs: null,
        nextDisplayNameChangeAtMs: null,
        canChange: true,
        needsCanonicalization: false,
        source: "callable",
      },
    );
  });

  test("rejects extra fields, malformed timestamps and impossible changes", () => {
    assert.equal(
      parseUpdateDisplayNameResult(success({ admin: true })),
      null,
    );
    assert.equal(
      parseUpdateDisplayNameResult(
        success({ nextDisplayNameChangeAtMs: "tomorrow" }),
      ),
      null,
    );
    assert.equal(
      parseUpdateDisplayNameResult(
        success({ nextDisplayNameChangeAtMs: NEXT_AT + 1 }),
      ),
      null,
    );
    assert.equal(
      parseUpdateDisplayNameResult(success({ canChange: true })),
      null,
    );
    assert.equal(
      parseUpdateDisplayNameResult(
        success({
          displayNameChangedAtMs: null,
          nextDisplayNameChangeAtMs: null,
        }),
      ),
      null,
    );
  });
});

describe("server profile metadata", () => {
  test("derives the exact next date from the server Timestamp", () => {
    const state = parseOwnProfileDisplayNameState(
      {
        displayName: "Canonical Name",
        displayNameChangedAt: {
          seconds: CHANGED_AT / 1000,
          nanoseconds: 0,
        },
        unrelatedPrivateField: "ignored",
      },
      { nowMs: CHANGED_AT + 1_000, fromCache: false },
    );
    assert.equal(state?.displayName, "Canonical Name");
    assert.equal(state?.displayNameChangedAtMs, CHANGED_AT);
    assert.equal(state?.nextDisplayNameChangeAtMs, NEXT_AT);
    assert.equal(state?.canChange, false);
    assert.equal(state?.source, "server");
  });

  test("supports Firestore Timestamp objects and legacy missing metadata", () => {
    assert.equal(
      parseOwnProfileDisplayNameState(
        {
          displayName: "Timestamp Name",
          displayNameChangedAt: { toMillis: () => CHANGED_AT },
        },
        { nowMs: NEXT_AT, fromCache: false },
      )?.canChange,
      true,
    );
    assert.deepEqual(
      parseOwnProfileDisplayNameState(
        { displayName: "Legacy Name" },
        { nowMs: CHANGED_AT, fromCache: false },
      ),
      {
        displayName: "Legacy Name",
        displayNameChangedAtMs: null,
        nextDisplayNameChangeAtMs: null,
        canChange: true,
        needsCanonicalization: false,
        source: "server",
      },
    );
  });

  test("cached metadata never claims that a change is available", () => {
    const cached = parseOwnProfileDisplayNameState(
      { displayName: "Cached Name" },
      { nowMs: CHANGED_AT, fromCache: true },
    );
    assert.ok(cached);
    const presentation = getDisplayNameAvailability(cached, CHANGED_AT);
    assert.equal(presentation.stale, true);
    assert.equal(presentation.blocksSubmit, false);
    assert.equal(presentation.title, "Checking name-change availability…");
    assert.match(presentation.description, /availability is not assumed/i);
  });

  test("cached future date is labeled last-known and remains blocked", () => {
    const cached = parseOwnProfileDisplayNameState(
      {
        displayName: "Cached Name",
        displayNameChangedAt: { toMillis: () => CHANGED_AT },
      },
      { nowMs: CHANGED_AT + 1_000, fromCache: true },
    );
    assert.ok(cached);
    const presentation = getDisplayNameAvailability(
      cached,
      CHANGED_AT + 1_000,
    );
    assert.equal(presentation.stale, true);
    assert.equal(presentation.blocksSubmit, true);
    assert.equal(presentation.nextChangeAtMs, NEXT_AT);
    assert.match(presentation.title, /last known/i);
  });

  test("unlocks exactly at the authoritative boundary without a new snapshot", () => {
    const staleSnapshotHint = {
      displayName: "Boundary Name",
      displayNameChangedAtMs: CHANGED_AT,
      nextDisplayNameChangeAtMs: NEXT_AT,
      canChange: false,
      needsCanonicalization: false,
      source: "server" as const,
    };
    assert.equal(
      getDisplayNameAvailability(staleSnapshotHint, NEXT_AT - 1).blocksSubmit,
      true,
    );
    assert.equal(
      getDisplayNameAvailability(staleSnapshotHint, NEXT_AT).blocksSubmit,
      false,
    );
  });

  test("invalid or malformed metadata becomes unavailable", () => {
    assert.equal(
      parseOwnProfileDisplayNameState(
        { displayName: "Name", displayNameChangedAt: "yesterday" },
        { nowMs: CHANGED_AT, fromCache: false },
      ),
      null,
    );
    assert.equal(
      parseOwnProfileDisplayNameState(
        { displayName: "  " },
        { nowMs: CHANGED_AT, fromCache: false },
      ),
      null,
    );
  });

  test("legacy surrounding whitespace is exposed as a real canonicalization change", () => {
    const state = parseOwnProfileDisplayNameState(
      { displayName: "  New Voice  " },
      { nowMs: CHANGED_AT, fromCache: false },
    );
    assert.equal(state?.displayName, "New Voice");
    assert.equal(state?.needsCanonicalization, true);
  });
});

describe("display-name validation and authoritative errors", () => {
  test("counts Unicode code points and rejects forbidden Unicode characters", () => {
    assert.equal(getDisplayNameInputError("Żółw 🐢"), null);
    assert.equal(getDisplayNameInputError("A"), "Enter at least 2 characters.");
    assert.equal(
      getDisplayNameInputError("A\u200BName"),
      "Display names cannot contain control, formatting, or line-separator characters.",
    );
    assert.equal(
      getDisplayNameInputError("Line\u2028separator"),
      "Display names cannot contain control, formatting, or line-separator characters.",
    );
    assert.equal(
      getDisplayNameInputError("Paragraph\u2029separator"),
      "Display names cannot contain control, formatting, or line-separator characters.",
    );
    assert.equal(isCanonicalDisplayName("Line\u2028separator"), false);
    assert.equal(isCanonicalDisplayName("Paragraph\u2029separator"), false);
    assert.equal(
      parseUpdateDisplayNameResult(
        success({ displayName: "Line\u2028separator" }),
      ),
      null,
    );
    assert.equal(
      getDisplayNameInputError("x".repeat(121)),
      "Use no more than 120 characters.",
    );
  });

  test("parses server cooldown details and keeps its exact date", () => {
    const error = {
      code: "functions/failed-precondition",
      details: {
        reason: "display-name-cooldown",
        nextDisplayNameChangeAtMs: NEXT_AT,
        retryAfterSeconds: 123,
      },
    };
    assert.deepEqual(parseDisplayNameCooldownError(error), {
      nextDisplayNameChangeAtMs: NEXT_AT,
      retryAfterSeconds: 123,
    });
    assert.equal(
      parseDisplayNameCooldownError({
        ...error,
        details: { ...error.details, unexpected: true },
      }),
      null,
    );
    assert.equal(
      parseDisplayNameCooldownError({
        ...error,
        details: { ...error.details, retryAfterSeconds: 1.5 },
      }),
      null,
    );
    assert.match(getDisplayNameChangeErrorMessage(error), /30-day/i);
  });

  test("recognizes canonical-save/Auth-sync-pending as partial success", () => {
    const error = {
      code: "functions/unavailable",
      details: {
        reason: "auth-display-name-sync-pending",
        displayName: "Saved Name",
        displayNameChangedAtMs: CHANGED_AT,
        nextDisplayNameChangeAtMs: NEXT_AT,
      },
    };
    assert.deepEqual(parseDisplayNameSyncPendingError(error), {
      displayName: "Saved Name",
      displayNameChangedAtMs: CHANGED_AT,
      nextDisplayNameChangeAtMs: NEXT_AT,
    });
    assert.match(getDisplayNameChangeErrorMessage(error), /was saved/i);
    assert.match(getDisplayNameChangeErrorMessage(error), /retry/i);

    assert.equal(
      parseDisplayNameSyncPendingError({
        ...error,
        details: { ...error.details, unexpected: "private" },
      }),
      null,
    );
    assert.equal(
      parseDisplayNameSyncPendingError({
        ...error,
        details: {
          ...error.details,
          nextDisplayNameChangeAtMs: CHANGED_AT + 1,
        },
      }),
      null,
    );
  });

  test("recognizes a committed name when the Auth account is missing", () => {
    const error = {
      code: "functions/failed-precondition",
      details: {
        reason: "auth-account-missing",
        displayName: "Saved Canonical Name",
        displayNameChangedAtMs: CHANGED_AT,
        nextDisplayNameChangeAtMs: NEXT_AT,
      },
    };
    assert.deepEqual(parseDisplayNameAuthAccountMissingError(error), {
      displayName: "Saved Canonical Name",
      displayNameChangedAtMs: CHANGED_AT,
      nextDisplayNameChangeAtMs: NEXT_AT,
    });
    assert.match(getDisplayNameChangeErrorMessage(error), /was saved/i);
    assert.equal(
      parseDisplayNameAuthAccountMissingError({
        ...error,
        details: { ...error.details, extra: true },
      }),
      null,
    );
  });

  test("maps exact failed-precondition reasons without inventing email errors", () => {
    assert.equal(
      getDisplayNameChangeErrorMessage({
        code: "functions/failed-precondition",
        details: { reason: "email-verification-required" },
      }),
      "Verify your email before changing your display name.",
    );
    assert.match(
      getDisplayNameChangeErrorMessage({
        code: "functions/failed-precondition",
        details: { reason: "display-name-state-invalid" },
      }),
      /could not verify your display-name state/i,
    );
    assert.match(
      getDisplayNameChangeErrorMessage({
        code: "functions/failed-precondition",
        details: { reason: "auth-account-missing" },
      }),
      /sign-in account could not be verified/i,
    );
    assert.doesNotMatch(
      getDisplayNameChangeErrorMessage({
        code: "functions/failed-precondition",
        details: { reason: "unknown" },
      }),
      /verify your email/i,
    );
    assert.equal(
      getDisplayNameChangeErrorMessage(new Error("secret internal message")),
      "The display name could not be changed. Please try again.",
    );
  });

  test("maps the private request budget to an actionable wait message", () => {
    assert.equal(
      getDisplayNameChangeErrorMessage({
        code: "functions/resource-exhausted",
      }),
      "Too many display-name attempts. Wait a minute and try again.",
    );
  });

  test("formats the authoritative next date for people, not as raw millis", () => {
    const formatted = formatDisplayNameChangeDate(NEXT_AT, "en-GB");
    assert.match(formatted, /2026/);
    assert.doesNotMatch(formatted, new RegExp(String(NEXT_AT)));
  });
});
