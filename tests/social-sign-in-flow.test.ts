import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, describe, test } from "node:test";

import {
  claimSocialSignInOutcomes,
  getSocialSignInFlow,
  getSocialSignInFlowOnServer,
  startSocialSignIn,
  subscribeSocialSignInFlow,
  type SocialSignInOutcome,
} from "../src/lib/auth/social-sign-in-flow.ts";
import { isSignedInRedirectHeld } from "../src/lib/auth/signed-in-redirect-hold.ts";
import { firebaseAuthDomain } from "../src/lib/firebase/auth-domain.ts";
import type { SignInResult, TotpSignInChallenge } from "../src/lib/auth/totp-sign-in.ts";
import type { SocialProvider } from "../src/lib/auth/social-sign-in.ts";

const read = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

/** An attempt the test settles by hand. */
function manualAttempt() {
  let resolve!: (result: SignInResult) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<SignInResult>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { attempt: () => promise, resolve, reject };
}

type Heard = { provider: SocialProvider; outcome: SocialSignInOutcome; heldWhenHeard: boolean };

function listen() {
  const heard: Heard[] = [];
  const release = claimSocialSignInOutcomes((provider, outcome) => {
    heard.push({ provider, outcome, heldWhenHeard: isSignedInRedirectHeld() });
  });
  return { heard, release };
}

const challenge: TotpSignInChallenge = { factors: [], resolve: async () => {} };
const releases: (() => void)[] = [];

afterEach(() => {
  // Leave no form registered and no finished flow behind.
  while (releases.length) releases.pop()!();
  assert.equal(getSocialSignInFlow(), null, "a test left an attempt running");
  assert.equal(isSignedInRedirectHeld(), false, "a test left the redirect held");
});

describe("one Google / Apple attempt per tab, owned by the tab", () => {
  test("an attempt holds the signed-in redirect and shows as running until it settles", async () => {
    const form = listen();
    releases.push(form.release);
    const manual = manualAttempt();
    let notified = 0;
    const unsubscribe = subscribeSocialSignInFlow(() => {
      notified += 1;
    });

    const done = startSocialSignIn("google", "waiting", manual.attempt);
    assert.ok(done);
    assert.deepEqual(getSocialSignInFlow(), { provider: "google", step: "waiting" });
    assert.equal(isSignedInRedirectHeld(), true);
    assert.equal(getSocialSignInFlowOnServer(), null);

    manual.reject(Object.assign(new Error("closed"), { code: "auth/popup-closed-by-user" }));
    const outcome = await done;
    assert.equal(outcome.kind, "failed");
    assert.equal(getSocialSignInFlow(), null, "the buttons come back");
    assert.equal(isSignedInRedirectHeld(), false);
    assert.equal(form.heard.length, 1);
    assert.equal(form.heard[0].heldWhenHeard, true, "the form hears it before the hold goes");
    assert.ok(notified >= 2);
    unsubscribe();
  });

  test("a second press while one runs does nothing", async () => {
    const manual = manualAttempt();
    const done = startSocialSignIn("google", "waiting", manual.attempt);
    let secondCalled = false;
    assert.equal(
      startSocialSignIn("apple", "waiting", () => {
        secondCalled = true;
        return manual.attempt();
      }),
      null,
    );
    assert.equal(secondCalled, false);
    assert.equal(getSocialSignInFlow()?.provider, "google");
    manual.resolve({ status: "totp-required", challenge });
    await done;
  });

  test("the attempt starts inside the call, so the provider's window opens inside the click", async () => {
    let calledSynchronously = false;
    const manual = manualAttempt();
    const done = startSocialSignIn("google", "waiting", () => {
      calledSynchronously = true;
      return manual.attempt();
    });
    assert.equal(calledSynchronously, true);
    manual.resolve({ status: "totp-required", challenge });
    await done;
  });

  test("Apple's re-check reports checking, then waiting; late step reports are ignored", async () => {
    const manual = manualAttempt();
    let setStep!: (step: "checking" | "waiting") => void;
    const done = startSocialSignIn("apple", "checking", (report) => {
      setStep = report;
      return manual.attempt();
    });
    assert.deepEqual(getSocialSignInFlow(), { provider: "apple", step: "checking" });
    setStep("waiting");
    assert.deepEqual(getSocialSignInFlow(), { provider: "apple", step: "waiting" });
    manual.reject(new Error("unavailable"));
    await done;
    setStep("waiting");
    assert.equal(getSocialSignInFlow(), null);
  });

  test("an attempt that throws synchronously still settles and lets go", async () => {
    const form = listen();
    releases.push(form.release);
    const done = startSocialSignIn("google", "waiting", () => {
      throw new Error("boom");
    });
    assert.ok(done);
    assert.equal((await done)?.kind, "failed");
    assert.equal(form.heard.length, 1);
  });
});

describe("the outcome lands on the form on screen when it arrives", () => {
  test("switching Log in -> Create account mid-attempt: the new form hears it, the old one does not", async () => {
    const login = listen();
    const manual = manualAttempt();
    const done = startSocialSignIn("google", "waiting", manual.attempt);
    // The switch: /login unmounts, /register mounts (same commit).
    login.release();
    const register = listen();
    releases.push(register.release);
    assert.equal(getSocialSignInFlow()?.step, "waiting", "the new form draws the running attempt");

    manual.resolve({ status: "totp-required", challenge });
    await done;
    assert.equal(login.heard.length, 0);
    assert.equal(register.heard.length, 1);
    assert.deepEqual(register.heard[0].outcome, { kind: "totp-required", challenge });
  });

  test("with no auth form on screen the outcome is dropped, and nothing stays busy", async () => {
    const manual = manualAttempt();
    const done = startSocialSignIn("apple", "waiting", manual.attempt);
    manual.reject(Object.assign(new Error("x"), { code: "auth/network-request-failed" }));
    assert.equal((await done)?.kind, "failed");
    assert.equal(getSocialSignInFlow(), null);
  });

  test("a completed sign-in keeps the block busy until its page leaves, then releases the redirect once", async () => {
    const form = listen();
    const manual = manualAttempt();
    const holdChanges: boolean[] = [];
    const done = startSocialSignIn("google", "waiting", manual.attempt);
    manual.resolve({ status: "signed-in" });
    // The hold is released after the form hears the outcome: that release is
    // what lets RedirectIfAuthenticated navigate, once.
    const outcome = await done;
    holdChanges.push(isSignedInRedirectHeld());
    assert.deepEqual(outcome, { kind: "signed-in" });
    assert.equal(form.heard[0].heldWhenHeard, true);
    assert.deepEqual(holdChanges, [false]);
    assert.deepEqual(getSocialSignInFlow(), { provider: "google", step: "signed-in" });
    // No second attempt while the page is on its way out.
    assert.equal(startSocialSignIn("apple", "waiting", manualAttempt().attempt), null);
    // The page navigates away: the form unmounts.
    form.release();
    assert.equal(getSocialSignInFlow(), null);
  });

  test("a completed sign-in with no form on screen is not left busy", async () => {
    const manual = manualAttempt();
    const done = startSocialSignIn("google", "waiting", manual.attempt);
    manual.resolve({ status: "signed-in" });
    await done;
    assert.equal(getSocialSignInFlow(), null);
  });

  test("a stale form giving up its claim does not unregister the form that replaced it", async () => {
    const first = listen();
    const second = listen();
    first.release();
    releases.push(second.release);
    const manual = manualAttempt();
    const done = startSocialSignIn("google", "waiting", manual.attempt);
    manual.reject(new Error("x"));
    await done;
    assert.equal(first.heard.length, 0);
    assert.equal(second.heard.length, 1);
  });

  test("a form that throws while showing the outcome does not leave the tab stuck", async () => {
    const release = claimSocialSignInOutcomes(() => {
      throw new Error("render bug");
    });
    releases.push(release);
    const originalError = console.error;
    const logged: unknown[] = [];
    console.error = (...args: unknown[]) => logged.push(args);
    try {
      const manual = manualAttempt();
      const done = startSocialSignIn("google", "waiting", manual.attempt);
      manual.reject(new Error("x"));
      await done;
    } finally {
      console.error = originalError;
    }
    assert.equal(logged.length, 1);
    assert.equal(getSocialSignInFlow(), null);
    assert.equal(isSignedInRedirectHeld(), false);
  });
});

describe("OAuth popups finish on the Firebase handler, not auth.yovoice.app", () => {
  test("the SDK authDomain is the project's firebaseapp.com domain", () => {
    assert.equal(firebaseAuthDomain("yovoice-ec54a"), "yovoice-ec54a.firebaseapp.com");
    assert.equal(firebaseAuthDomain(" yovoice-ec54a "), "yovoice-ec54a.firebaseapp.com");
    assert.equal(firebaseAuthDomain("local-preview"), "local-preview.firebaseapp.com");
    for (const missing of [undefined, null, "", "   "]) assert.equal(firebaseAuthDomain(missing), undefined);
  });

  test("the config derives it and no longer reads NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", () => {
    const config = read("src/lib/firebase/config.ts");
    assert.match(config, /authDomain: firebaseAuthDomain\(projectId\),/);
    assert.doesNotMatch(config, /process\.env\.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN/);
    // Still required: everything else the SDK needs (authDomain follows projectId).
    const required = config.slice(config.indexOf("const requiredFirebaseConfig"), config.indexOf("];"));
    for (const key of ["apiKey", "projectId", "storageBucket", "messagingSenderId", "appId"]) {
      assert.match(required, new RegExp(`firebaseConfig\\.${key},`), key);
    }
    assert.doesNotMatch(required, /authDomain/);
    assert.doesNotMatch(read(".env.example"), /^NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=/m);
  });
});
