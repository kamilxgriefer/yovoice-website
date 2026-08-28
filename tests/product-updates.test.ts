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
});
