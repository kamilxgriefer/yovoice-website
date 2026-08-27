import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { resolveAuthActionDestination } from "../src/lib/auth/auth-action-routing.ts";
import { safeContinueUrl } from "../src/lib/auth/safe-continue-url.ts";

const ORIGIN = "https://yovoice.app";

function resolve(
  mode: string | null,
  oobCode: string | null = "oob-code",
  continueUrl: string | null = null,
  lang: string | null = null,
) {
  return resolveAuthActionDestination({
    origin: ORIGIN,
    mode,
    oobCode,
    safeContinueUrl: safeContinueUrl(continueUrl),
    lang,
  }).toString();
}

describe("Firebase email action routing", () => {
  test("sends password-reset codes to the branded reset page", () => {
    assert.equal(
      resolve(
        "resetPassword",
        "reset-code",
        "https://app.yovoice.app/chats",
        "pl-PL",
      ),
      "https://yovoice.app/reset-password?oobCode=reset-code&continueUrl=https%3A%2F%2Fapp.yovoice.app%2Fchats&lang=pl-PL",
    );
  });

  test("strips an attacker-controlled continue URL", () => {
    assert.equal(
      resolve("resetPassword", "reset-code", "https://evil.example/phish"),
      "https://yovoice.app/reset-password?oobCode=reset-code",
    );
  });

  test("routes every project-wide Firebase action mode", () => {
    assert.equal(
      resolve("verifyEmail"),
      "https://yovoice.app/verify-email?oobCode=oob-code&mode=verifyEmail",
    );
    assert.equal(
      resolve("recoverEmail"),
      "https://yovoice.app/recover-email?oobCode=oob-code&mode=recoverEmail",
    );
    assert.equal(
      resolve("verifyAndChangeEmail"),
      "https://yovoice.app/recover-email?oobCode=oob-code&mode=verifyAndChangeEmail",
    );
    assert.equal(
      resolve("revertSecondFactorAddition"),
      "https://yovoice.app/revert-second-factor?oobCode=oob-code",
    );
  });

  test("falls back safely for missing codes and unknown modes", () => {
    assert.equal(resolve("resetPassword", null), "https://yovoice.app/login");
    assert.equal(resolve("unexpected"), "https://yovoice.app/login");
  });

  test("forwards only bounded language tags", () => {
    assert.equal(
      resolve("resetPassword", "code", null, "pl"),
      "https://yovoice.app/reset-password?oobCode=code&lang=pl",
    );
    assert.equal(
      resolve("resetPassword", "code", null, "pl<script>"),
      "https://yovoice.app/reset-password?oobCode=code",
    );
  });
});

describe("auth action continuation allowlist", () => {
  test("accepts same-site paths and explicit legacy origins", () => {
    assert.equal(safeContinueUrl("/login?from=reset"), "/login?from=reset");
    assert.equal(
      safeContinueUrl("https://yovoice-ec54a.web.app/"),
      "https://yovoice-ec54a.web.app/",
    );
  });

  test("rejects URL parser tricks, credentials and insecure schemes", () => {
    for (const candidate of [
      "//evil.example",
      "/\\evil.example",
      "javascript:alert(1)",
      "http://yovoice.app/login",
      "https://user:password@yovoice.app/login",
      "https://evil.example/login",
    ]) {
      assert.equal(safeContinueUrl(candidate), null, candidate);
    }
  });
});
