import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  ACCOUNT_ENTRY_PATH,
  APP_ENTRY_PATH,
  buildAppHandoffUrl,
  CANONICAL_APP_URL,
  isAppLaunchRedirect,
  resolveAuthRedirect,
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

  test("preserves campaign attribution through the app hand-off", () => {
    assert.equal(
      buildAppHandoffUrl(
        CANONICAL_APP_URL,
        "?utm_source=instagram&utm_medium=paid_social&utm_campaign=voice_moments&fbclid=abc123",
      ),
      "https://app.yovoice.app/?utm_source=instagram&utm_medium=paid_social&utm_campaign=voice_moments&fbclid=abc123",
    );
  });

  test("drops unrelated query parameters from the app hand-off", () => {
    assert.equal(
      buildAppHandoffUrl(
        CANONICAL_APP_URL,
        "?utm_content=single_4x5&email=private%40example.com&redirect=https%3A%2F%2Fevil.example",
      ),
      "https://app.yovoice.app/?utm_content=single_4x5",
    );
  });

  test("keeps ordinary website sign-in inside the account portal", () => {
    assert.equal(resolveAuthRedirect(null), ACCOUNT_ENTRY_PATH);
    assert.equal(resolveAuthRedirect("https://evil.example"), ACCOUNT_ENTRY_PATH);
    assert.equal(resolveAuthRedirect("/premium/manage"), "/premium/manage");
  });

  test("recognizes a legacy app redirect so website auth can be skipped", () => {
    assert.equal(isAppLaunchRedirect(APP_ENTRY_PATH), true);
    assert.equal(isAppLaunchRedirect([APP_ENTRY_PATH]), false);
    assert.equal(isAppLaunchRedirect("/download"), false);
    assert.equal(isAppLaunchRedirect(null), false);
  });
});
