import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import {
  FALLBACK_REGISTRATION_DISPLAY_NAME,
  completeRegistration,
  planUserProfileBootstrap,
  resolveRegistrationDisplayName,
} from "../src/lib/auth/registration-profile.ts";

// Independent oracle copied from the YO Voice app repository,
// firestore.rules at commit e8f0e0ce: `userCreateAllowed` (users/{uid} create)
// and the owner branch of `match /users/{userId}` update (affectedKeys).
// Keep in sync when the app changes either allowlist.
const APP_USER_CREATE_ALLOWED_KEYS = new Set([
  "uid", "email", "displayName", "username",
  "bio", "country", "nativeLanguage",
  "spokenLanguages", "learningLanguages", "website",
  "statusMessage", "accountType", "profileUpdatedAt",
  "createdAt", "isOnline", "lastSeen", "presenceUpdatedAt",
  "availability",
  "messageCount", "followerCount", "followingCount",
  "roomCount", "communityCount", "voiceMinutes",
  "reactionCount", "hostMinutes", "activeDays", "momentCount",
  "friendCount", "unlockedTitleIds", "unlockedTitleTimestamps",
  "selectedTitleId", "achievementsUpdatedAt",
  "notificationPreferences", "messagePrivacy",
]);

const APP_USER_OWNER_UPDATE_ALLOWED_KEYS = new Set([
  "uid", "email", "displayName", "username",
  "bio", "country", "nativeLanguage",
  "spokenLanguages", "learningLanguages", "website",
  "statusMessage",
  "accountType", "profileUpdatedAt",
  "isOnline", "lastSeen", "presenceUpdatedAt",
  "availability",
  "messageCount",
  "roomCount", "communityCount", "voiceMinutes",
  "reactionCount", "hostMinutes", "activeDays",
  "momentCount", "unlockedTitleIds",
  "unlockedTitleTimestamps", "selectedTitleId",
  "achievementsUpdatedAt",
  "notificationPreferences", "messagePrivacy",
]);

const SERVER_TIMESTAMP = Symbol("serverTimestamp");

function keysOutside(data: Record<string, unknown>, allowed: Set<string>) {
  return Object.keys(data).filter((key) => !allowed.has(key)).sort();
}

/** Mirrors the non-allowlist predicates of `userCreateAllowed`. */
function createRuleRejections(uid: string, data: Record<string, unknown>) {
  const reasons = keysOutside(data, APP_USER_CREATE_ALLOWED_KEYS).map(
    (key) => `key ${key} is outside userCreateAllowed`,
  );
  if ("uid" in data && data.uid !== uid) reasons.push("uid mismatch");
  if ("accountType" in data && data.accountType !== "personal") {
    reasons.push("accountType must be personal");
  }
  for (const counter of ["friendCount", "followerCount", "followingCount"]) {
    if (counter in data && data[counter] !== 0) reasons.push(`${counter} must be 0`);
  }
  return reasons;
}

describe("website registration writes only what the app's users rules accept", () => {
  test("a brand-new account is created with keys inside userCreateAllowed only", () => {
    const plan = planUserProfileBootstrap({
      uid: "user-1",
      email: " New.Person@Example.com ",
      displayName: "  Ola  ",
      existing: null,
      serverTimestamp: SERVER_TIMESTAMP,
    });

    assert.equal(plan.kind, "create");
    if (plan.kind !== "create") return;
    assert.deepEqual(createRuleRejections("user-1", plan.data), []);
    assert.equal(plan.data.photoUrl, undefined);
    assert.equal(plan.data.uid, "user-1");
    assert.equal(plan.data.email, "new.person@example.com");
    assert.equal(plan.data.displayName, "Ola");
    assert.equal(plan.data.username, "Ola");
    assert.equal(plan.data.accountType, "personal");
    assert.equal(plan.data.createdAt, SERVER_TIMESTAMP);
    assert.equal(plan.data.profileUpdatedAt, SERVER_TIMESTAMP);
  });

  test("a partial document gains identity through owner-update keys only", () => {
    const plan = planUserProfileBootstrap({
      uid: "user-1",
      email: "ola@example.com",
      displayName: "Ola",
      existing: { uid: "user-1", isOnline: true },
      serverTimestamp: SERVER_TIMESTAMP,
    });

    assert.equal(plan.kind, "merge");
    if (plan.kind !== "merge") return;
    assert.deepEqual(keysOutside(plan.data, APP_USER_OWNER_UPDATE_ALLOWED_KEYS), []);
    assert.equal("createdAt" in plan.data, false);
    assert.equal("photoUrl" in plan.data, false);
    for (const counter of ["friendCount", "followerCount", "followingCount"]) {
      assert.equal(counter in plan.data, false, counter);
    }
    const name = plan.data.displayName as string;
    assert.ok(name.length >= 2 && name.length <= 120);
  });

  test("an already named profile is never rewritten", () => {
    assert.deepEqual(
      planUserProfileBootstrap({
        uid: "user-1",
        email: "ola@example.com",
        displayName: "Someone Else",
        existing: { displayName: "Ola" },
        serverTimestamp: SERVER_TIMESTAMP,
      }),
      { kind: "skip" },
    );
  });

  test("the rule oracle rejects the payload the website used to send", () => {
    // The pre-fix website payload for users/{uid}. It must stay rejected by
    // the oracle, otherwise the assertions above prove nothing.
    const legacyPayload = {
      uid: "user-1",
      displayName: "Ola",
      email: "ola@example.com",
      photoUrl: null,
      isOnline: false,
      lastSeen: SERVER_TIMESTAMP,
      createdAt: SERVER_TIMESTAMP,
    };
    assert.deepEqual(keysOutside(legacyPayload, APP_USER_CREATE_ALLOWED_KEYS), ["photoUrl"]);
    assert.deepEqual(
      keysOutside(legacyPayload, APP_USER_OWNER_UPDATE_ALLOWED_KEYS),
      ["createdAt", "photoUrl"],
    );
  });

  test("display names follow the app's resolution order and rule bounds", () => {
    assert.equal(resolveRegistrationDisplayName("  Ada  ", "ada@example.com"), "Ada");
    assert.equal(resolveRegistrationDisplayName("A", "kasia.nowak@example.com"), "kasia.nowak");
    assert.equal(resolveRegistrationDisplayName("", "x@example.com"), FALLBACK_REGISTRATION_DISPLAY_NAME);
    assert.equal(resolveRegistrationDisplayName(undefined, undefined), FALLBACK_REGISTRATION_DISPLAY_NAME);

    const longName = `${"a".repeat(119)}🌙tail`;
    const bounded = resolveRegistrationDisplayName(longName, "ada@example.com");
    assert.equal(bounded, "a".repeat(119));
    assert.ok(bounded.length <= 120);
  });
});

describe("registration always attempts the verification email", () => {
  function recorder() {
    const calls: string[] = [];
    const nonFatal: string[] = [];
    return { calls, nonFatal };
  }

  test("a refused profile write does not skip the verification email", async () => {
    const { calls, nonFatal } = recorder();
    const denied = Object.assign(new Error("Missing or insufficient permissions."), {
      code: "permission-denied",
    });

    await completeRegistration({
      updateAuthDisplayName: async () => {
        calls.push("authDisplayName");
      },
      writeProfile: async () => {
        calls.push("profile");
        throw denied;
      },
      sendVerificationEmail: async () => {
        calls.push("verification");
      },
      onNonFatalError: (step, error) => {
        assert.equal(error, denied);
        nonFatal.push(step);
      },
    });

    assert.ok(calls.includes("verification"), calls.join(","));
    assert.equal(calls[0], "authDisplayName");
    assert.deepEqual(nonFatal, ["profile"]);
  });

  test("a synchronous profile failure still sends the verification email", async () => {
    const { calls, nonFatal } = recorder();

    await completeRegistration({
      writeProfile: () => {
        calls.push("profile");
        throw new Error("sync failure");
      },
      sendVerificationEmail: async () => {
        calls.push("verification");
      },
      onNonFatalError: (step) => nonFatal.push(step),
    });

    assert.deepEqual(calls.sort(), ["profile", "verification"]);
    assert.deepEqual(nonFatal, ["profile"]);
  });

  test("an Auth display-name failure does not block profile or verification", async () => {
    const { calls, nonFatal } = recorder();

    await completeRegistration({
      updateAuthDisplayName: async () => {
        throw new Error("network");
      },
      writeProfile: async () => {
        calls.push("profile");
      },
      sendVerificationEmail: async () => {
        calls.push("verification");
      },
      onNonFatalError: (step) => nonFatal.push(step),
    });

    assert.deepEqual(calls.sort(), ["profile", "verification"]);
    assert.deepEqual(nonFatal, ["authDisplayName"]);
  });

  test("a verification failure is surfaced after the profile write was attempted", async () => {
    const { calls } = recorder();
    const quota = new Error("auth/too-many-requests");

    await assert.rejects(
      completeRegistration({
        writeProfile: async () => {
          calls.push("profile");
        },
        sendVerificationEmail: async () => {
          calls.push("verification");
          throw quota;
        },
      }),
      (error) => error === quota,
    );
    assert.deepEqual(calls.sort(), ["profile", "verification"]);
  });

  test("the auth provider routes sign-up through the rule-safe helpers", () => {
    const provider = readFileSync(
      new URL("../src/providers/auth-provider.tsx", import.meta.url),
      "utf8",
    );

    assert.doesNotMatch(provider, /photoUrl/);
    assert.match(provider, /planUserProfileBootstrap\(/);
    assert.match(provider, /completeRegistration\(\{/);
    assert.match(provider, /sendVerificationEmail:\s*\(\)\s*=>/);
    assert.doesNotMatch(provider, /await ensureUserProfile\(/);
  });
});
