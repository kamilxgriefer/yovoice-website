import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  CANONICAL_APP_URL,
  resolveConfiguredAppUrl,
} from "../src/lib/auth/auth-redirect.ts";

describe("application URL", () => {
  test("uses the short custom domain by default", () => {
    assert.equal(resolveConfiguredAppUrl(), CANONICAL_APP_URL);
    assert.equal(resolveConfiguredAppUrl("   "), CANONICAL_APP_URL);
  });

  test("migrates both legacy Firebase Hosting origins", () => {
    assert.equal(
      resolveConfiguredAppUrl("https://yovoice-ec54a.web.app/"),
      CANONICAL_APP_URL,
    );
    assert.equal(
      resolveConfiguredAppUrl("https://yovoice-ec54a.firebaseapp.com"),
      CANONICAL_APP_URL,
    );
  });

  test("preserves an intentional custom preview origin", () => {
    assert.equal(
      resolveConfiguredAppUrl(" https://preview.example.test/app/ "),
      "https://preview.example.test/app",
    );
  });
});
