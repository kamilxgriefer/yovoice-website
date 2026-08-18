import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  TOTP_CHALLENGE_A11Y,
  UnsupportedSecondFactorError,
  createTotpChallengeFromResolver,
  formatTotpInput,
  isMultiFactorRequiredError,
  normalizeTotpCode,
  totpChallengeLayoutForWidth,
} from "../src/lib/auth/totp-sign-in.ts";

function hint(
  uid: string,
  factorId: "phone" | "totp",
  displayName?: string,
) {
  return {
    uid,
    factorId,
    displayName,
    enrollmentTime: "2026-08-18T00:00:00.000Z",
  };
}

describe("Firebase TOTP sign-in challenge", () => {
  test("recognizes only Firebase's MFA-required error", () => {
    assert.equal(
      isMultiFactorRequiredError({ code: "auth/multi-factor-auth-required" }),
      true,
    );
    assert.equal(
      isMultiFactorRequiredError({ code: "auth/invalid-credential" }),
      false,
    );
    assert.equal(isMultiFactorRequiredError(null), false);
  });

  test("exposes TOTP factors and never falls back to SMS", async () => {
    let resolveCalls = 0;
    const challenge = createTotpChallengeFromResolver({
      hints: [
        hint("phone-factor", "phone", "Phone"),
        hint("totp-primary", "totp", "Main authenticator"),
        hint("totp-backup", "totp"),
      ],
      resolveSignIn: async () => {
        resolveCalls += 1;
        return {} as never;
      },
    });

    assert.deepEqual(
      challenge.factors.map(({ uid, displayName }) => ({ uid, displayName })),
      [
        { uid: "totp-primary", displayName: "Main authenticator" },
        { uid: "totp-backup", displayName: "Authenticator 2" },
      ],
    );

    await challenge.resolve("totp-backup", "12 34-56");
    assert.equal(resolveCalls, 1);
    await assert.rejects(
      challenge.resolve("totp-backup", "123456"),
      /already been completed/i,
    );
  });

  test("fails closed when an account has no TOTP enrollment", () => {
    assert.throws(
      () =>
        createTotpChallengeFromResolver({
          hints: [hint("phone-factor", "phone", "Phone")],
          resolveSignIn: async () => ({}) as never,
        }),
      UnsupportedSecondFactorError,
    );
  });

  test("rejects unknown factors and malformed one-time codes", async () => {
    const challenge = createTotpChallengeFromResolver({
      hints: [hint("totp-primary", "totp", "Main authenticator")],
      resolveSignIn: async () => ({}) as never,
    });

    await assert.rejects(
      challenge.resolve("other-factor", "123456"),
      /choose one of the authenticator factors/i,
    );
    await assert.rejects(
      challenge.resolve("totp-primary", "12345"),
      /6-digit code/i,
    );
  });

  test("normalizes formatted codes while the input formatter caps visible digits", () => {
    assert.equal(normalizeTotpCode(" 12 34-56 "), "123456");
    assert.equal(normalizeTotpCode("123456789"), "123456789");
    assert.equal(formatTotpInput("123456789"), "123456");
    assert.equal(normalizeTotpCode("letters"), "");
  });
});

describe("TOTP challenge responsive and accessibility contract", () => {
  test("keeps compact layout at phone widths and standard layout elsewhere", () => {
    assert.equal(totpChallengeLayoutForWidth(320), "compact");
    assert.equal(totpChallengeLayoutForWidth(390), "compact");
    assert.equal(totpChallengeLayoutForWidth(768), "standard");
    assert.equal(totpChallengeLayoutForWidth(1100), "standard");
    assert.equal(totpChallengeLayoutForWidth(1440), "standard");
  });

  test("publishes one-time-code semantics for assistive technology", () => {
    assert.deepEqual(TOTP_CHALLENGE_A11Y, {
      codeLabel: "6-digit authenticator code",
      inputMode: "numeric",
      autoComplete: "one-time-code",
      maxLength: 6,
    });
  });
});
