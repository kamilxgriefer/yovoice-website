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

test("every route receives the shared low-risk security baseline", async () => {
  assert.equal(typeof nextConfig.headers, "function");
  const entries = await nextConfig.headers!();
  const global = entries.find(({ source }) => source === "/:path*");

  assert.ok(global, "missing global security headers");
  const headers = new Map(
    global.headers.map(({ key, value }) => [key.toLowerCase(), value]),
  );

  assert.equal(headers.get("x-content-type-options"), "nosniff");
  assert.equal(headers.get("x-frame-options"), "DENY");
  assert.equal(
    headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
  );
  assert.equal(
    headers.get("strict-transport-security"),
    "max-age=63072000",
  );
  assert.match(headers.get("permissions-policy") ?? "", /camera=\(\)/);
  assert.match(headers.get("permissions-policy") ?? "", /microphone=\(\)/);
  assert.match(
    headers.get("content-security-policy-report-only") ?? "",
    /frame-ancestors 'none'/,
  );
  assert.match(
    headers.get("content-security-policy-report-only") ?? "",
    /https:\/\/auth\.yovoice\.app/,
  );
  assert.doesNotMatch(
    headers.get("content-security-policy-report-only") ?? "",
    /report-uri|report-to/i,
  );
});

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
