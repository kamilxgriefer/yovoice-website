import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import { passwordResetPhaseForError } from "../src/lib/auth/password-reset-flow.ts";

describe("password-reset action-code failures", () => {
  test("distinguishes expired, used and disabled-account links", () => {
    assert.deepEqual(
      passwordResetPhaseForError({ code: "auth/expired-action-code" }),
      {
        name: "link-invalid",
        title: "This link has expired",
        body:
          "Password reset links are temporary for your security. Request a new one and we'll send it to your email.",
      },
    );
    assert.equal(
      passwordResetPhaseForError({ code: "auth/invalid-action-code" }).name,
      "link-invalid",
    );
    assert.deepEqual(
      passwordResetPhaseForError({ code: "auth/user-disabled" }),
      {
        name: "link-invalid",
        title: "Account unavailable",
        body:
          "This account has been disabled. Contact support if you think that's a mistake.",
      },
    );
  });

  test("does not disclose whether a removed account existed", () => {
    const phase = passwordResetPhaseForError({
      code: "auth/user-not-found",
      message: "private provider detail",
    });
    assert.equal(phase.name, "link-invalid");
    assert.equal(
      phase.name === "link-invalid" ? phase.title : "",
      "This link is no longer valid",
    );
    assert.doesNotMatch(JSON.stringify(phase), /private provider detail/);
  });

  test("keeps network errors retryable and unknown errors generic", () => {
    assert.deepEqual(
      passwordResetPhaseForError({ code: "auth/network-request-failed" }),
      { name: "network-error" },
    );
    assert.deepEqual(passwordResetPhaseForError(new Error("raw secret")), {
      name: "link-invalid",
      title: "Something went wrong",
      body: "We couldn't check this link. Request a new one and try again.",
    });
  });
});

test("the reset page validates then confirms through Firebase Auth", () => {
  const source = readFileSync(
    new URL("../src/app/(auth)/reset-password/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /verifyPasswordResetCode\(getFirebaseAuth\(\), oobCode\)/);
  assert.match(source, /confirmPasswordReset\(getFirebaseAuth\(\), oobCode, password\)/);
  assert.match(source, /safeContinueUrl\(searchParams\.get\("continueUrl"\)\)/);
  assert.doesNotMatch(source, /error\.toString\(\)/);
});

test("the MFA recovery page requires confirmation before consuming its code", () => {
  const source = readFileSync(
    new URL(
      "../src/app/(auth)/revert-second-factor/page.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /checkActionCode\(getFirebaseAuth\(\), oobCode\)/);
  assert.match(
    source,
    /ActionCodeOperation\.REVERT_SECOND_FACTOR_ADDITION/,
  );
  assert.match(source, /onClick=\{removeAuthenticator\}/);
  assert.match(source, /applyActionCode\(getFirebaseAuth\(\), oobCode\)/);
  assert.doesNotMatch(source, /error\.toString\(\)/);
});
