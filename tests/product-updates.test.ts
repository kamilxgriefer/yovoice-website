import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { productUpdates } from "../src/content/product-updates.ts";

describe("product update ledger", () => {
  test("uses unique stable slugs", () => {
    const slugs = productUpdates.map((update) => update.slug);

    assert.equal(new Set(slugs).size, slugs.length);
    for (const slug of slugs) {
      assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  test("keeps valid ISO dates in newest-first order", () => {
    const dates = productUpdates.map((update) => update.updatedOn);

    for (const date of dates) {
      assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(
        new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10),
        date,
      );
    }

    assert.deepEqual(dates, [...dates].sort().reverse());
  });

  test("keeps every release card concise and complete", () => {
    for (const update of productUpdates) {
      assert.equal(update.highlights.length, 3, update.slug);
      assert.ok(update.title.trim(), update.slug);
      assert.ok(update.summary.trim(), update.slug);
      assert.ok(update.eyebrow.trim(), update.slug);
      assert.ok(update.highlights.every((highlight) => highlight.trim()), update.slug);
    }
  });

  test("keeps Premium sandbox verification behind the live checkout boundary", () => {
    const premium = productUpdates.find(
      (update) => update.slug === "premium-plan-chooser",
    );

    assert.ok(premium);
    assert.equal(premium.status, "verification");
    assert.match(premium.summary, /sandbox/i);
    assert.match(premium.summary, /without completing a payment/i);
    assert.match(premium.summary, /live checkout remains disabled/i);
    assert.match(premium.highlights.join(" "), /€6 monthly/);
    assert.match(premium.highlights.join(" "), /€60 yearly/);
    assert.match(premium.highlights.join(" "), /PLN 26 for 30 days/);
    assert.match(premium.highlights.join(" "), /PLN 260 for 365 days/);
  });

  test("keeps mobile build 7 rollout truthful for each store", () => {
    const ios = productUpdates.find(
      (update) => update.slug === "ios-build-7-processing",
    );
    const android = productUpdates.find(
      (update) => update.slug === "android-adaptive-icon",
    );

    assert.ok(ios);
    assert.equal(ios.status, "verification");
    assert.equal(ios.updatedOn, "2026-08-28");
    assert.match(ios.summary, /1\.0\.0 build 7/);
    assert.match(ios.summary, /source commit 9a92072/);
    assert.match(ios.summary, /August 28 at 13:34 CEST/);
    assert.match(ios.summary, /processing/i);
    assert.match(ios.summary, /not yet confirmed as available to testers/i);
    assert.match(ios.highlights.join(" "), /availability has not yet been confirmed/i);

    assert.ok(android);
    assert.equal(android.status, "testing");
    assert.match(android.summary, /remains active and available on Google Play Internal Testing/i);
    assert.match(android.summary, /No newer mobile client code has landed since this build/i);
    assert.match(android.highlights.join(" "), /existing opt-in/i);
    assert.match(android.highlights.join(" "), /correct Google Account/i);

    assert.doesNotMatch(JSON.stringify(productUpdates), /\b[^\s@]+@[^\s@]+\b/);
  });
});
