import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import {
  APPLE_PROVIDER_ID,
  APPLE_SCOPES,
  GOOGLE_CUSTOM_PARAMETERS,
  SOCIAL_BUTTON_LABEL,
  SocialProviderUnavailableError,
  appleButtonState,
  appleProviderProbeRequest,
  parseAppleProviderProbeResponse,
} from "../src/lib/auth/social-sign-in.ts";
import {
  getAuthErrorMessage,
  getSocialAuthErrorMessage,
} from "../src/lib/auth/auth-errors.ts";
import {
  holdSignedInRedirect,
  isSignedInRedirectHeld,
  isSignedInRedirectHeldOnServer,
  subscribeSignedInRedirectHold,
} from "../src/lib/auth/signed-in-redirect-hold.ts";
import { shouldRedirectSignedInVisitor } from "../src/lib/auth/registration-flow.ts";

const read = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const appleAuthUri =
  "https://appleid.apple.com/auth/authorize?response_type=code&client_id=app.yovoice.web&redirect_uri=https://auth.yovoice.app/__/auth/handler&scope=email+name&response_mode=form_post";

describe("the Apple availability probe mirrors the app's parser", () => {
  test("an Apple authorisation URL for apple.com is available", () => {
    const body = JSON.stringify({
      kind: "identitytoolkit#CreateAuthUriResponse",
      authUri: appleAuthUri,
      providerId: "apple.com",
      sessionId: "session",
    });
    assert.equal(parseAppleProviderProbeResponse(200, body), "available");
  });

  test("a provider switched off in Firebase is not configured (Coming soon)", () => {
    const body = JSON.stringify({
      error: {
        code: 400,
        message: "OPERATION_NOT_ALLOWED : The identity provider configuration is not found.",
      },
    });
    assert.equal(parseAppleProviderProbeResponse(400, body), "notConfigured");
  });

  test("everything else fails closed as temporarily unavailable", () => {
    const cases: [number, string][] = [
      // Same fixtures as the app's test/apple_sign_in_test.dart.
      [200, JSON.stringify({ authUri: "https://example.com/phish", providerId: "apple.com" })],
      [200, "not-json"],
      // A genuine Apple URL, but for another provider or over http.
      [200, JSON.stringify({ authUri: appleAuthUri, providerId: "google.com" })],
      [200, JSON.stringify({ authUri: appleAuthUri.replace("https:", "http:"), providerId: "apple.com" })],
      [200, JSON.stringify({ authUri: "https://appleid.apple.com.evil.test/auth", providerId: "apple.com" })],
      [200, JSON.stringify({ authUri: "", providerId: "apple.com" })],
      [200, JSON.stringify({ authUri: 42, providerId: "apple.com" })],
      [200, JSON.stringify({ providerId: "apple.com" })],
      [200, "[]"],
      [200, "null"],
      // An origin Firebase does not accept (observed live for an unlisted domain).
      [400, JSON.stringify({ error: { code: 400, message: "INVALID_CONTINUE_URI : Invalid OAuth request for apple.com" } })],
      // The dummy local key.
      [400, JSON.stringify({ error: { code: 400, message: "API key not valid. Please pass a valid API key." } })],
      // OPERATION_NOT_ALLOWED only counts on a 400.
      [403, JSON.stringify({ error: { message: "OPERATION_NOT_ALLOWED" } })],
      [400, JSON.stringify({ error: { message: "PREFIX OPERATION_NOT_ALLOWED" } })],
      [400, JSON.stringify({ error: "OPERATION_NOT_ALLOWED" })],
      [400, JSON.stringify({ error: { message: 7 } })],
      [500, "<html>"],
      [503, ""],
    ];
    for (const [status, body] of cases) {
      assert.equal(parseAppleProviderProbeResponse(status, body), "temporarilyUnavailable", `${status} ${body}`);
    }
  });

  test("the probe asks createAuthUri for apple.com on this origin, and only with a key", () => {
    const request = appleProviderProbeRequest(" test-key ", "https://yovoice.app");
    assert.ok(request);
    const url = new URL(request.url);
    assert.equal(url.origin + url.pathname, "https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri");
    assert.equal(url.searchParams.get("key"), "test-key");
    assert.deepEqual(JSON.parse(request.body), { providerId: "apple.com", continueUri: "https://yovoice.app" });
    for (const key of [undefined, null, "", "   "]) {
      assert.equal(appleProviderProbeRequest(key, "https://yovoice.app"), null);
    }
  });

  test("the Apple button follows the app: pending, Coming soon, Try again, ready", () => {
    assert.deepEqual(appleButtonState(null), { pending: true, disabled: true, status: null, reprobes: false });
    assert.deepEqual(appleButtonState("notConfigured"), { pending: false, disabled: true, status: "Coming soon", reprobes: false });
    assert.deepEqual(appleButtonState("temporarilyUnavailable"), { pending: false, disabled: false, status: "Try again", reprobes: true });
    assert.deepEqual(appleButtonState("available"), { pending: false, disabled: false, status: null, reprobes: false });
  });

  test("providers use the app's parameters and the brands' own labels", () => {
    assert.deepEqual({ ...GOOGLE_CUSTOM_PARAMETERS }, { prompt: "select_account" });
    assert.equal(APPLE_PROVIDER_ID, "apple.com");
    assert.deepEqual([...APPLE_SCOPES], ["email", "name"]);
    assert.deepEqual(SOCIAL_BUTTON_LABEL, { google: "Continue with Google", apple: "Continue with Apple" });
  });
});

describe("social sign-in errors never show a raw Firebase code", () => {
  const error = (code: string) => Object.assign(new Error(`Firebase: Error (${code}).`), { code });

  test("closing or replacing the provider window says nothing", () => {
    for (const code of ["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"]) {
      assert.equal(getSocialAuthErrorMessage(error(code), "Google"), null, code);
    }
  });

  test("a blocked window asks for pop-ups on yovoice.app", () => {
    assert.equal(
      getSocialAuthErrorMessage(error("auth/popup-blocked"), "Apple"),
      "Your browser blocked the Apple sign-in window. Allow pop-ups for yovoice.app and try again.",
    );
  });

  test("an email that already has an account is sent to its password", () => {
    const message = getSocialAuthErrorMessage(error("auth/account-exists-with-different-credential"), "Google");
    assert.match(message ?? "", /^This email already has a YO Voice account\. Log in with its password/);
  });

  test("a provider the project cannot use right now is named, not coded", () => {
    for (const code of [
      "auth/unauthorized-domain",
      "auth/operation-not-allowed",
      "auth/operation-not-supported-in-this-environment",
    ]) {
      assert.equal(getSocialAuthErrorMessage(error(code), "Google"), "Sign-in with Google is not available right now.", code);
    }
    assert.equal(
      getSocialAuthErrorMessage(new SocialProviderUnavailableError("apple"), "Apple"),
      "Sign-in with Apple is not available right now.",
    );
  });

  test("network, throttling and unknown failures reuse the site's wording", () => {
    assert.equal(
      getSocialAuthErrorMessage(error("auth/network-request-failed"), "Apple"),
      "Network error. Check your connection and try again.",
    );
    assert.equal(
      getSocialAuthErrorMessage(error("auth/too-many-requests"), "Google"),
      getAuthErrorMessage(error("auth/too-many-requests")),
    );
    assert.equal(getSocialAuthErrorMessage(error("auth/internal-error"), "Google"), "Something went wrong. Please try again.");
    assert.equal(getSocialAuthErrorMessage(null, "Google"), "Something went wrong. Please try again.");
    // A refused provider credential is not "wrong email or password".
    assert.doesNotMatch(getSocialAuthErrorMessage(error("auth/invalid-credential"), "Apple") ?? "", /password/);
  });

  test("no social message contains a Firebase code", () => {
    for (const code of [
      "auth/popup-blocked",
      "auth/account-exists-with-different-credential",
      "auth/unauthorized-domain",
      "auth/operation-not-allowed",
      "auth/network-request-failed",
      "auth/invalid-credential",
      "auth/web-storage-unsupported",
    ]) {
      assert.doesNotMatch(getSocialAuthErrorMessage(error(code), "Google") ?? "", /auth\/|Firebase/, code);
    }
  });
});

describe("a social sign-in holds the signed-in redirect until its profile is written", () => {
  test("holds are counted and each release is idempotent", () => {
    assert.equal(isSignedInRedirectHeld(), false);
    assert.equal(isSignedInRedirectHeldOnServer(), false);
    let notifications = 0;
    const unsubscribe = subscribeSignedInRedirectHold(() => {
      notifications += 1;
    });
    const first = holdSignedInRedirect();
    const second = holdSignedInRedirect();
    assert.equal(isSignedInRedirectHeld(), true);
    first();
    first();
    assert.equal(isSignedInRedirectHeld(), true, "an overlapping flow keeps its own hold");
    second();
    assert.equal(isSignedInRedirectHeld(), false);
    assert.equal(notifications, 4);
    unsubscribe();
    holdSignedInRedirect()();
    assert.equal(notifications, 4);
  });

  test("a held page never redirects, whatever Firebase reports meanwhile", () => {
    const release = holdSignedInRedirect();
    const suspended = isSignedInRedirectHeld();
    assert.equal(shouldRedirectSignedInVisitor({ loading: false, signedIn: true, suspended }), false);
    release();
    assert.equal(
      shouldRedirectSignedInVisitor({ loading: false, signedIn: true, suspended: isSignedInRedirectHeld() }),
      true,
    );
  });

  test("the redirect consults the hold and the flow releases it only when finished", () => {
    const guard = read("src/components/auth/redirect-if-authenticated.tsx");
    assert.match(guard, /useSyncExternalStore\(\s*subscribeSignedInRedirectHold,\s*isSignedInRedirectHeld,\s*isSignedInRedirectHeldOnServer,?\s*\)/);
    assert.match(guard, /const suspended = suspendedByForm \|\| heldBySocialSignIn;/);

    const block = read("src/components/auth/social-sign-in.tsx");
    const hold = block.indexOf("const release = holdSignedInRedirect()");
    const signIn = block.indexOf("await signInWithProvider(provider)");
    const released = block.indexOf("release();");
    assert.ok(hold > 0 && signIn > hold && released > signIn, "hold, sign in (with profile bootstrap), then release");
    assert.match(block.slice(block.indexOf("} finally {")), /^\} finally \{\s*release\(\);/);
  });
});

describe("both auth forms offer the same Google and Apple block", () => {
  const forms = ["src/components/auth/login-form.tsx", "src/components/auth/register-form.tsx"];

  test("each form renders <SocialSignIn> first, with the same props", () => {
    const blocks = forms.map((path) => {
      const source = read(path);
      const formOpen = source.indexOf('<form className="mt-8 space-y-4"');
      assert.ok(formOpen > 0, path);
      const block = source.slice(formOpen).match(/<SocialSignIn[\s\S]*?\/>/);
      assert.ok(block, `${path} renders <SocialSignIn`);
      // Nothing that takes space comes before it: only the (null-rendering)
      // redirect guard and comments.
      const before = source.slice(formOpen, source.indexOf("<SocialSignIn", formOpen));
      assert.doesNotMatch(before, /<(AuthFold|Input|div|p|label)\b/, path);
      return block[0].replace(/\s+/g, " ");
    });
    assert.equal(blocks[0], blocks[1]);
    assert.match(blocks[0], /onTotpRequired=\{openSocialChallenge\}/);
    assert.match(blocks[0], /onSignedIn=\{finishSignIn\}/);
  });

  test("each form handles a second factor owed after Google or Apple", () => {
    for (const path of forms) {
      const source = read(path);
      assert.match(source, /<div data-auth-challenge>\s*<TotpChallengeForm/, path);
      assert.match(source, /function openSocialChallenge\(challenge: TotpSignInChallenge\) \{[\s\S]*?setTotpChallenge\(challenge\);/, path);
      assert.match(source, /onComplete=\{finishSignIn\}/, path);
      assert.match(source, /router\.replace\(resolveAuthRedirect\(searchParams\.get\("redirect"\)\)\)/, path);
      // The password flow waits while a provider window is open.
      assert.match(source, /disabled=\{submitting \|\| socialBusy\}/, path);
      assert.match(source, /if \(socialBusy\) return;/, path);
    }
    // Social accounts skip /verify-email: only the email sign-up goes there.
    const register = read("src/components/auth/register-form.tsx");
    assert.equal(register.match(/verifyEmailPathAfterRegistration\(/g)?.length, 1);
  });

  test("the provider opens the popups the app opens and bootstraps new accounts by the plan", () => {
    const provider = read("src/providers/auth-provider.tsx");
    assert.match(provider, /new GoogleAuthProvider\(\)/);
    assert.match(provider, /setCustomParameters\(\{ \.\.\.GOOGLE_CUSTOM_PARAMETERS \}\)/);
    assert.match(provider, /new OAuthProvider\(APPLE_PROVIDER_ID\)/);
    assert.match(provider, /for \(const scope of APPLE_SCOPES\) apple\.addScope\(scope\);/);
    assert.doesNotMatch(provider, /signInWithRedirect/);

    const body = provider.slice(provider.indexOf("signInWithProvider: async"), provider.indexOf("signUp: async"));
    // The popup is the first thing awaited, so it opens inside the click.
    assert.ok(body.indexOf("await signInWithPopup(") < body.indexOf("await createSocialUserProfileIfNeeded("));
    assert.equal(body.match(/await /g)?.length, 2);
    assert.match(body, /isMultiFactorRequiredError\(error\)[\s\S]*createFirebaseTotpSignInChallenge\(auth, error\)/);

    const bootstrap = provider.slice(
      provider.indexOf("function createSocialUserProfileIfNeeded("),
      provider.indexOf("function createSocialAuthProvider("),
    );
    assert.match(bootstrap, /getAdditionalUserInfo\(credential\)\?\.isNewUser/);
    // The same rule-safe transaction as registration (planUserProfileBootstrap).
    assert.match(bootstrap, /ensureUserProfile\(\s*credential\.user,\s*credential\.user\.displayName \?\? "",?\s*\)/);
    assert.match(bootstrap, /\.catch\(\(error: unknown\) => \{\s*console\.error\(/);
  });

  test("the provider marks appear only in the sign-in block", () => {
    const block = read("src/components/auth/social-sign-in.tsx");
    assert.match(block, /<GoogleMark /);
    assert.match(block, /<AppleMark /);
    const marks = read("src/components/auth/provider-marks.tsx");
    for (const colour of ["#4285F4", "#34A853", "#FBBC05", "#EA4335"]) assert.match(marks, new RegExp(colour));
    assert.match(read("docs/design/design-system.md"), /Continue with Google/);
  });
});
