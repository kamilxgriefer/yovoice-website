import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import {
  shouldRedirectSignedInVisitor,
  verificationEmailDelivery,
  verificationSendState,
  verifyEmailPathAfterRegistration,
  verifyEmailPathWithoutSendState,
} from "../src/lib/auth/registration-flow.ts";
import { completeRegistration } from "../src/lib/auth/registration-profile.ts";

const read = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("a created account always learns whether its verification email was sent", () => {
  test("a sent email is reported as sent", async () => {
    const failures: unknown[] = [];
    const delivery = await verificationEmailDelivery(
      async () => {},
      (error) => failures.push(error),
    );
    assert.equal(delivery, "sent");
    assert.deepEqual(failures, []);
  });

  test("a failed send is an explicit outcome, not an exception", async () => {
    const quota = Object.assign(new Error("quota"), { code: "auth/too-many-requests" });
    const failures: unknown[] = [];
    const delivery = await verificationEmailDelivery(
      async () => {
        throw quota;
      },
      (error) => failures.push(error),
    );
    assert.equal(delivery, "failed");
    assert.deepEqual(failures, [quota]);
  });

  test("a synchronous throw is a failed send too", async () => {
    const delivery = await verificationEmailDelivery(() => {
      throw new Error("sync");
    });
    assert.equal(delivery, "failed");
  });

  test("only the verification email decides the outcome of the WEB-01 steps", async () => {
    const sendFails = await verificationEmailDelivery(() =>
      completeRegistration({
        writeProfile: async () => {},
        sendVerificationEmail: async () => {
          throw new Error("auth/too-many-requests");
        },
      }),
    );
    assert.equal(sendFails, "failed");

    const profileFails = await verificationEmailDelivery(() =>
      completeRegistration({
        writeProfile: async () => {
          throw Object.assign(new Error("denied"), { code: "permission-denied" });
        },
        sendVerificationEmail: async () => {},
        onNonFatalError: () => {},
      }),
    );
    assert.equal(profileFails, "sent");
  });
});

describe("the register page keeps its form until sign-up resolves", () => {
  test("the signed-in redirect never fires while suspended", () => {
    for (const loading of [false, true]) {
      for (const signedIn of [false, true]) {
        assert.equal(
          shouldRedirectSignedInVisitor({ loading, signedIn, suspended: true }),
          false,
        );
        assert.equal(
          shouldRedirectSignedInVisitor({ loading, signedIn, suspended: false }),
          !loading && signedIn,
        );
      }
    }
  });

  test("the sign-up timeline that used to unmount the form now reaches the form's own navigation", () => {
    // Order observed in the round-2 accessibility run (register-mock S3):
    // submit, Firebase reports the new user, then the verification email
    // fails ~0-250 ms later. The guard is evaluated on every render.
    type Step = { name: string; loading: boolean; signedIn: boolean; suspended: boolean };
    const timeline: Step[] = [
      { name: "page ready, signed out", loading: false, signedIn: false, suspended: false },
      { name: "submit pressed", loading: false, signedIn: false, suspended: true },
      { name: "Auth reports the new account", loading: false, signedIn: true, suspended: true },
      { name: "verification email fails, form navigates", loading: false, signedIn: true, suspended: true },
    ];
    const redirects = timeline.filter((step) => shouldRedirectSignedInVisitor(step)).map((step) => step.name);
    assert.deepEqual(redirects, []);

    // A visitor who is already signed in when the page opens is still sent on.
    assert.equal(
      shouldRedirectSignedInVisitor({ loading: false, signedIn: true, suspended: false }),
      true,
    );
  });

  test("the form routes to /verify-email with an explicit failure report", () => {
    assert.equal(verifyEmailPathAfterRegistration("sent", null), "/verify-email");
    assert.equal(verifyEmailPathAfterRegistration("failed", null), "/verify-email?send=failed");
    assert.equal(
      verifyEmailPathAfterRegistration("sent", "/premium/manage"),
      "/verify-email?redirect=%2Fpremium%2Fmanage",
    );
    const failedWithRedirect = verifyEmailPathAfterRegistration(
      "failed",
      "/download?utm_source=mail&plan=yearly",
    );
    const params = new URL(failedWithRedirect, "https://yovoice.test").searchParams;
    assert.equal(new URL(failedWithRedirect, "https://yovoice.test").pathname, "/verify-email");
    assert.equal(params.get("send"), "failed");
    assert.equal(params.get("redirect"), "/download?utm_source=mail&plan=yearly");
  });

  test("/verify-email claims a send only without a failure report, and drops the report after a resend", () => {
    const failed = new URLSearchParams("send=failed&redirect=%2Fpremium");
    assert.equal(verificationSendState({ searchParams: failed, resentFromThisPage: false }), "failed");
    assert.equal(verificationSendState({ searchParams: failed, resentFromThisPage: true }), "resent");
    for (const query of ["", "send=sent", "send=FAILED", "redirect=%2Fpremium"]) {
      assert.equal(
        verificationSendState({ searchParams: new URLSearchParams(query), resentFromThisPage: false }),
        "requested",
        query,
      );
    }
    assert.equal(verifyEmailPathWithoutSendState(failed), "/verify-email?redirect=%2Fpremium");
    assert.equal(verifyEmailPathWithoutSendState(new URLSearchParams("send=failed")), "/verify-email");
  });
});

describe("the sign-up screens are wired to the flow", () => {
  test("the register page no longer mounts a redirect that can unmount the form", () => {
    const page = read("src/app/(auth)/register/page.tsx");
    assert.doesNotMatch(page, /<RedirectIfAuthenticated/);
    assert.match(page, /<RegisterForm \/>/);

    // The other signed-out pages keep the unconditional redirect.
    for (const path of ["src/app/(auth)/login/page.tsx", "src/app/(auth)/forgot-password/page.tsx"]) {
      assert.match(read(path), /<RedirectIfAuthenticated \/>/, path);
    }
  });

  test("the register form suspends the redirect before sign-up starts and routes by the email outcome", () => {
    const form = read("src/components/auth/register-form.tsx");
    assert.match(form, /<RedirectIfAuthenticated suspended=\{registrationStarted\} \/>/);
    const started = form.indexOf("setRegistrationStarted(true)");
    const signUp = form.indexOf("await signUp(");
    assert.ok(started > 0 && signUp > started, "the redirect is suspended before signUp is awaited");
    assert.match(form, /const \{ verificationEmail \} = await signUp\(/);
    assert.match(form, /verifyEmailPathAfterRegistration\(\s*verificationEmail,\s*searchParams\.get\("redirect"\),?\s*\)/);
    // Only an account that was not created re-enables the redirect.
    const catchBlock = form.slice(form.indexOf("} catch (err) {"));
    assert.match(catchBlock, /setError\(getAuthErrorMessage\(err\)\);[\s\S]*setRegistrationStarted\(false\)/);

    const guard = read("src/components/auth/redirect-if-authenticated.tsx");
    assert.match(guard, /shouldRedirectSignedInVisitor\(\{ loading, signedIn: Boolean\(user\), suspended \}\)/);
    assert.match(guard, /\[loading, user, suspended, router, searchParams\]/);
  });

  test("sign-up returns the verification outcome instead of throwing after the account exists", () => {
    const provider = read("src/providers/auth-provider.tsx");
    assert.match(provider, /\) => Promise<RegistrationResult>;/);
    assert.match(provider, /const verificationEmail = await verificationEmailDelivery\(\s*\(\) =>\s*completeRegistration\(\{/);
    assert.match(provider, /return \{ verificationEmail \};/);
  });

  test("/verify-email announces a failed send with role=alert and offers resend", () => {
    const page = read("src/app/(auth)/verify-email/page.tsx");
    const failedBranch = page.match(/\{sendState === "failed" \? \(([\s\S]*?)\) : \(([\s\S]*?)\)\}/);
    assert.ok(failedBranch, "failed and default branches");
    const [, failed, otherwise] = failedBranch;
    assert.match(failed, /role="alert"/);
    assert.match(failed, /was not sent/);
    assert.match(failed, /Resend email/);
    assert.doesNotMatch(failed, /We sent/);
    assert.match(otherwise, /We sent a confirmation link/);
    assert.equal(page.match(/We sent a confirmation link/g)?.length, 1);

    assert.match(page, /ref=\{resendButtonRef\}/);
    assert.match(page, /resendButtonRef\.current\?\.focus\(\)/);
    assert.match(page, /router\.replace\(verifyEmailPathWithoutSendState\(searchParams\)/);
  });
});
