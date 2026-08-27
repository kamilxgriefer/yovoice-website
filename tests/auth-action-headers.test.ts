import assert from "node:assert/strict";
import { test } from "node:test";

import nextConfig from "../next.config.ts";

const TOKEN_PATHS = [
  "/auth/action",
  "/reset-password",
  "/verify-email",
  "/recover-email",
  "/revert-second-factor",
];

test("every email action-code page suppresses caching, referrers and indexing", async () => {
  assert.equal(typeof nextConfig.headers, "function");
  const entries = await nextConfig.headers!();

  for (const path of TOKEN_PATHS) {
    const entry = entries.find(({ source }) => source === path);
    assert.ok(entry, `missing security headers for ${path}`);

    const headers = new Map(
      entry.headers.map(({ key, value }) => [key.toLowerCase(), value]),
    );
    assert.equal(headers.get("cache-control"), "private, no-store, max-age=0");
    assert.equal(headers.get("referrer-policy"), "no-referrer");
    assert.equal(headers.get("x-robots-tag"), "noindex");
  }
});
