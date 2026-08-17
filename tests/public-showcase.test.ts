import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { parseVerifiedPublicShowcase } from "../src/lib/public-showcase.ts";

const NOW = 1_800_000_000_000;

function timestamp(millis: number) {
  return { seconds: Math.floor(millis / 1000), nanoseconds: 0 };
}

function payload(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    people: [
      {
        displayName: "A real member",
        accountType: "creator",
        activity: "activeRecently",
      },
    ],
    clubs: [{ name: "A real Club", memberCount: 7 }],
    generatedAt: timestamp(NOW),
    activityValidUntil: timestamp(NOW + 90_000),
    validUntil: timestamp(NOW + 180_000),
    ...overrides,
  };
}

describe("public showcase parser", () => {
  test("accepts the exact fresh schema and preserves honest labels", () => {
    const result = parseVerifiedPublicShowcase(payload(), NOW + 1_000);
    assert.equal(result.status, "fresh");
    if (result.status !== "fresh") return;
    assert.equal(result.showcase.people[0]?.displayName, "A real member");
    assert.equal(result.showcase.people[0]?.activity, "activeRecently");
    assert.equal(result.showcase.clubs[0]?.memberCount, 7);
  });

  test("downgrades activity at its independent expiry", () => {
    const result = parseVerifiedPublicShowcase(payload(), NOW + 90_000);
    assert.equal(result.status, "fresh");
    if (result.status !== "fresh") return;
    assert.equal(result.showcase.people[0]?.activity, "undisclosed");
  });

  test("hides an expired showcase", () => {
    assert.equal(
      parseVerifiedPublicShowcase(payload(), NOW + 180_000).status,
      "stale",
    );
  });

  test("rejects extra fields, invalid counts and names outside the contract", () => {
    assert.equal(
      parseVerifiedPublicShowcase({ ...payload(), email: "private@example.com" }, NOW)
        .status,
      "unavailable",
    );
    assert.equal(
      parseVerifiedPublicShowcase(payload({ clubs: [{ name: "Club", memberCount: -1 }] }), NOW)
        .status,
      "unavailable",
    );
    assert.equal(
      parseVerifiedPublicShowcase(
        payload({
          people: [{
            displayName: "x".repeat(81),
            accountType: "personal",
            activity: "undisclosed",
          }],
        }),
        NOW,
      ).status,
      "unavailable",
    );
  });

  test("rejects wrong versions and overlong validity windows", () => {
    assert.equal(
      parseVerifiedPublicShowcase(payload({ schemaVersion: 2 }), NOW).status,
      "unavailable",
    );
    assert.equal(
      parseVerifiedPublicShowcase(
        payload({ validUntil: timestamp(NOW + 181_000) }),
        NOW,
      ).status,
      "unavailable",
    );
  });
});
