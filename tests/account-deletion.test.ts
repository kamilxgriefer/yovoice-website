import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import {
  ACCOUNT_DELETION_PATH,
  DELETION_EMAIL_SUBJECT,
  DELETION_LIMITS,
  DELETION_REMOVES,
  DELETION_REQUEST_MAILTO,
  PRIVACY_MAILBOX,
  PUBLIC_DELETION_PATH,
  SELF_SERVICE_DELETION_LIVE,
  SUPPORT_MAILBOX,
  accountDeletionRetains,
  accountDeletionRoutes,
  accountDeletionSummary,
  accountDeletionTiming,
  deletionRetains,
  deletionRoutes,
  deletionSummary,
  deletionTiming,
} from "../src/content/account-deletion.ts";
import {
  ACCOUNT_DELETION_CALLABLE,
  getAccountDeletionConfirmation,
  getAccountDeletionErrorMessage,
  hasPasswordSignIn,
  isStaleAuthenticationError,
  parseAccountDeletionResult,
} from "../src/lib/account/account-deletion.ts";

/**
 * Account deletion is the one page Google Play reads next to the app, and the
 * one promise a privacy policy must not overstate. These tests hold two lines:
 *
 *  1. Whatever the release switch says, the copy describes the process that
 *     really runs — by hand today, self-service once the callable is deployed.
 *  2. The public page, the account page and the Privacy Policy render the same
 *     lists from one module, so a retention cannot be disclosed on one page and
 *     forgotten on another.
 */

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

function prose(relativePath: string): string {
  return source(relativePath)
    .replace(/\{"\s*"\}/g, " ")
    .replace(/<\/?[A-Za-z][^>]*>/g, " ")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

const publicPage = source("../src/app/(marketing)/delete-account/page.tsx");
const accountPage = source("../src/app/(account)/account/delete/page.tsx");
const accountLayout = source("../src/app/(account)/account/layout.tsx");
const privacyPage = source("../src/app/(marketing)/privacy/page.tsx");
const footer = source("../src/components/layout/site-footer.tsx");
const sitemap = source("../src/app/sitemap.ts");
const authProvider = source("../src/providers/auth-provider.tsx");
const deletionBanner = source("../src/components/legal/deletion-request-banner.tsx");

function copyBlob(live: boolean): string {
  return [
    accountDeletionSummary(live),
    ...accountDeletionRoutes(live).map((route) => `${route.title} ${route.detail}`),
    ...DELETION_REMOVES,
    ...accountDeletionRetains(live).flatMap((entry) => [entry.item, entry.reason]),
    accountDeletionTiming(live).headline,
    accountDeletionTiming(live).detail,
    ...DELETION_LIMITS,
  ].join("\n");
}

describe("what the site promises about deletion", () => {
  test("while the switch is off, nothing claims a deletion the servers cannot perform", () => {
    const manual = copyBlob(false);

    assert.match(
      accountDeletionSummary(false),
      /no self-service account deletion in the app yet/,
    );
    for (const route of accountDeletionRoutes(false)) {
      assert.equal(route.selfService, false);
    }
    assert.match(accountDeletionTiming(false).headline, /by hand/);
    // The disclosure the deployed Auth trigger makes necessary: the private
    // account record survives, and it still holds the email address.
    assert.match(manual, /still contains your email address/);
    assert.match(manual, /removed by a person/);
    // A ban digest is part of the pipeline that does not exist yet.
    assert.doesNotMatch(manual, /salted, one-way hash/);
  });

  test("with the switch on, the copy describes the deployed pipeline instead", () => {
    const live = copyBlob(true);

    assert.match(accountDeletionSummary(true), /delete your account yourself/);
    assert.equal(
      accountDeletionRoutes(true).filter((route) => route.selfService).length,
      2,
    );
    assert.match(accountDeletionTiming(true).detail, /within minutes/);
    assert.match(accountDeletionTiming(true).detail, /30 days/);
    assert.match(live, /salted, one-way hash of your email address/);
    // The retained email-bearing record is exactly what the pipeline removes.
    assert.doesNotMatch(live, /still contains your email address/);
    assert.match(live, /no email address, name, username or content in it/);
  });

  test("the published copy is the branch the release switch selects", () => {
    assert.deepEqual(deletionRoutes, accountDeletionRoutes(SELF_SERVICE_DELETION_LIVE));
    assert.deepEqual(deletionRetains, accountDeletionRetains(SELF_SERVICE_DELETION_LIVE));
    assert.deepEqual(deletionTiming, accountDeletionTiming(SELF_SERVICE_DELETION_LIVE));
    assert.equal(deletionSummary, accountDeletionSummary(SELF_SERVICE_DELETION_LIVE));
  });

  test("every retention names its reason, and none is open-ended by accident", () => {
    for (const live of [false, true]) {
      const retained = accountDeletionRetains(live);
      assert.ok(retained.length >= 5);
      for (const entry of retained) {
        assert.ok(entry.item.length > 20, entry.item);
        assert.ok(entry.reason.length > 40, `reason missing for: ${entry.item}`);
        assert.match(entry.reason, /\.$/);
      }
    }
  });

  test("no invented retention period, and no blanket erasure promise", () => {
    for (const live of [false, true]) {
      const blob = copyBlob(live);
      assert.doesNotMatch(
        blob,
        /we (?:remove|erase|delete) (?:or anonymi[sz]e )?all your personal data/i,
      );
      // Log retention is Google's setting, not a number we may quote.
      assert.match(blob, /under those services' own retention settings/);
      assert.doesNotMatch(blob, /logs? (?:are|is) kept for \d+/i);
    }
  });

  test("the direct-message decision is stated rather than buried", () => {
    for (const live of [false, true]) {
      const blob = copyBlob(live);
      assert.match(blob, /stay in the other person's copy of that thread/);
      assert.match(blob, /photos, videos, voice notes and files you sent are deleted/);
    }
  });

  test("one rights mailbox, and the older address stays published", () => {
    assert.equal(PRIVACY_MAILBOX, "privacy@yovoice.app");
    assert.equal(SUPPORT_MAILBOX, "support@yovoice.app");
    assert.equal(
      DELETION_REQUEST_MAILTO,
      `mailto:privacy@yovoice.app?subject=${encodeURIComponent(DELETION_EMAIL_SUBJECT)}`,
    );
    // A request mailto carries the subject only: no address, name or uid ends
    // up in a URL.
    assert.doesNotMatch(DELETION_REQUEST_MAILTO, /body=/);
  });
});

describe("the public /delete-account page", () => {
  test("is the Play-facing URL: indexable, in the sitemap, linked from the footer", () => {
    assert.equal(PUBLIC_DELETION_PATH, "/delete-account");
    assert.match(publicPage, /path: "\/delete-account"/);
    assert.ok(sitemap.includes('"/delete-account"'));
    assert.match(footer, /\["Delete account","\/delete-account"\]/);
    // The (marketing) group has no noindex, unlike (account).
    assert.doesNotMatch(publicPage, /robots/);
  });

  test("renders the shared lists instead of retyping them", () => {
    assert.match(publicPage, /from "@\/content\/account-deletion"/);
    for (const symbol of [
      "deletionRoutes.map",
      "DELETION_REMOVES.map",
      "deletionRetains.map",
      "DELETION_LIMITS.map",
      "deletionTiming",
    ]) {
      assert.ok(publicPage.includes(symbol), symbol);
    }
    // It answers the four questions Play asks a deletion URL to answer.
    const text = prose("../src/app/(marketing)/delete-account/page.tsx");
    assert.match(text, /How to delete your account/);
    assert.match(text, /What deleting your account removes/);
    assert.match(text, /What we keep, and why/);
    assert.match(text, /How we check that the account is yours/);
  });

  test("the request confirmation cannot appear while deletion is by hand", () => {
    const banner = source("../src/components/legal/deletion-request-banner.tsx");
    assert.match(banner, /if \(!SELF_SERVICE_DELETION_LIVE\) return null;/);
    assert.match(banner, /requested"\) !== "1"/);
    assert.match(banner, /role="status"/);
    // Static rendering is preserved: the island is read through Suspense.
    assert.match(publicPage, /<Suspense fallback=\{null\}>/);
  });
});

describe("the signed-in /account/delete page", () => {
  test("is reachable from the account navigation, marked out from the rest", () => {
    assert.match(accountLayout, /href: "\/account\/delete", label: "Delete account"/);
    assert.match(accountLayout, /danger: true/);
    assert.match(accountLayout, /aria-current=\{active \? "page" : undefined\}/);
  });

  test("shows the consequences before any control that acts on them", () => {
    assert.ok(
      accountPage.indexOf("<Consequences />") <
        accountPage.indexOf("<DeleteAccountForm />"),
    );
    assert.match(accountPage, /DELETION_REMOVES\.map/);
    assert.match(accountPage, /deletionRetains\.map/);
    assert.match(accountPage, /the public deletion page/);
  });

  test("only offers the delete button when the callable is deployed", () => {
    assert.match(
      accountPage,
      /SELF_SERVICE_DELETION_LIVE \? \(\s*<DeleteAccountForm \/>\s*\) : \(\s*<RequestByEmailPanel \/>/,
    );
    assert.match(accountPage, /!canReauthenticate \? \(\s*<ProviderAccountPanel \/>/);
  });

  test("re-authenticates immediately before the callable, then signs out", () => {
    const reauth = accountPage.indexOf("await reauthenticate(password)");
    const call = accountPage.indexOf("await deleteAccount({})");
    const signOut = accountPage.indexOf("await signOut()");
    assert.ok(reauth > 0 && call > reauth, "re-authentication must precede the call");
    assert.ok(signOut > call, "sign-out must follow a successful call");
    assert.match(accountPage, /ACCOUNT_DELETION_CALLABLE/);
    // The outcome is read from the response and shown, so a slow navigation
    // never leaves a person wondering whether it worked.
    assert.match(
      accountPage,
      /getAccountDeletionConfirmation\(parseAccountDeletionResult\(response\.data\)\)/,
    );
    assert.match(accountPage, /<p role="status"/);
    assert.match(accountPage, /window\.location\.assign\(`\$\{PUBLIC_DELETION_PATH\}\?requested=1`\)/);
    // The provider exposes the re-authentication the server requires, and
    // refreshes the token so the callable sees the new auth_time.
    assert.match(authProvider, /reauthenticate: \(currentPassword: string\) => Promise<void>;/);
    assert.match(authProvider, /await current\.getIdToken\(true\);/);
  });

  test("the destructive form is labelled, announced and operable", () => {
    assert.match(accountPage, /<label\s+htmlFor=\{passwordId\}/);
    assert.match(accountPage, /<label htmlFor=\{confirmId\}/);
    assert.match(accountPage, /autoComplete="current-password"/);
    assert.match(accountPage, /role="alert"/);
    assert.match(accountPage, /aria-busy=\{submitting\}/);
    assert.match(accountPage, /aria-describedby=\{error \? errorId : undefined\}/);
    // Touch target and a confirmation the person has to make on purpose.
    assert.match(accountPage, /min-h-12/);
    assert.match(accountPage, /type="checkbox"/);
    assert.match(accountPage, /aria-labelledby="deletion-consequences-heading"/);
  });
});

describe("callable contract", () => {
  test("names the deployed callable", () => {
    assert.equal(ACCOUNT_DELETION_CALLABLE, "deleteAccountSelfV1");
  });

  test("reads the states the server can return", () => {
    assert.deepEqual(parseAccountDeletionResult({ state: "pending", requestedAtMillis: 17 }), {
      state: "pending",
      requestedAtMillis: 17,
    });
    assert.deepEqual(parseAccountDeletionResult({ state: "running" }), {
      state: "running",
      requestedAtMillis: null,
    });
    assert.deepEqual(
      parseAccountDeletionResult({ state: "completed", requestedAtMillis: Number.NaN }),
      { state: "completed", requestedAtMillis: null },
    );
    for (const malformed of [null, undefined, "pending", 7, {}, { state: "queued" }]) {
      assert.equal(parseAccountDeletionResult(malformed), null);
    }
  });

  test("the confirmation matches the state the server reported", () => {
    assert.match(
      getAccountDeletionConfirmation({ state: "completed", requestedAtMillis: null }),
      /has been deleted/,
    );
    assert.match(
      getAccountDeletionConfirmation({ state: "pending", requestedAtMillis: null }),
      /is being deleted/,
    );
    assert.match(getAccountDeletionConfirmation(null), /is being deleted/);
  });

  test("the confirmation never claims a sign-out that has not finished", () => {
    // The page sets this string BEFORE awaiting signOut(), because awaiting
    // first flips useAuth() to "no user" and DeleteAccountPage returns null,
    // which would unmount the panel this string lives in. The string therefore
    // has to describe the sign-out as in progress. A past tense here would be
    // the page asserting a thing that has not happened yet.
    for (const request of [
      { state: "completed" as const, requestedAtMillis: null },
      { state: "pending" as const, requestedAtMillis: null },
      null,
    ]) {
      const sentence = getAccountDeletionConfirmation(request);
      assert.match(sentence, /You are being signed out/);
      assert.doesNotMatch(
        sentence,
        /have been signed out/,
        `"${sentence}" claims a completed sign-out while signOut() is still in flight`,
      );
    }

    // The ordering is deliberate and documented where it happens, so the next
    // reader does not "fix" it by awaiting and silently kill the panel.
    const confirmation = accountPage.indexOf("setConfirmation(");
    const signOut = accountPage.indexOf("await signOut()");
    assert.ok(
      confirmation > 0 && signOut > confirmation,
      "the confirmation is set before the sign-out is awaited",
    );
    assert.match(accountPage, /returns null the moment/);

    // The one place that may claim a finished sign-out is the banner on the
    // public page, which renders only after the sign-out resolved.
    assert.match(deletionBanner, /you have been signed out/i);
  });

  test("a stale sign-in is told to re-authenticate, not just to try again", () => {
    for (const code of [
      "auth/requires-recent-login",
      "auth/user-token-expired",
      "functions/unauthenticated",
    ]) {
      assert.equal(isStaleAuthenticationError({ code }), true, code);
    }
    for (const code of ["functions/internal", "auth/wrong-password", undefined]) {
      assert.equal(isStaleAuthenticationError({ code }), false, String(code));
    }
    assert.match(
      getAccountDeletionErrorMessage({ code: "functions/unauthenticated" }),
      /password again/,
    );
  });

  test("every failure gives a person something to do, and never leaks a code", () => {
    const cases = [
      "functions/failed-precondition",
      "functions/unimplemented",
      "functions/not-found",
      "functions/resource-exhausted",
      "functions/deadline-exceeded",
      "functions/unavailable",
      "functions/internal",
      "functions/aborted",
      "auth/wrong-password",
      "auth/too-many-requests",
    ];
    for (const code of cases) {
      const message = getAccountDeletionErrorMessage({ code });
      assert.ok(message.length > 20, code);
      assert.doesNotMatch(message, /functions\/|auth\//, code);
    }
    // The kill switch and a missing deployment both point at the human route.
    assert.match(
      getAccountDeletionErrorMessage({ code: "functions/failed-precondition" }),
      new RegExp(PRIVACY_MAILBOX),
    );
    assert.match(
      getAccountDeletionErrorMessage({ code: "functions/unimplemented" }),
      new RegExp(PRIVACY_MAILBOX),
    );
    // A wrong password reuses the shared auth copy rather than inventing one.
    assert.equal(
      getAccountDeletionErrorMessage({ code: "auth/wrong-password" }),
      "That email or password is incorrect.",
    );
    assert.match(getAccountDeletionErrorMessage(new Error("boom")), new RegExp(PRIVACY_MAILBOX));
  });

  test("an account without a password is never shown a password form", () => {
    assert.equal(hasPasswordSignIn([{ providerId: "password" }]), true);
    assert.equal(hasPasswordSignIn([{ providerId: "google.com" }]), false);
    assert.equal(hasPasswordSignIn([]), false);
    assert.equal(hasPasswordSignIn(null), false);
    assert.equal(hasPasswordSignIn(undefined), false);
  });
});

describe("the policy and the deletion page stay one document", () => {
  test("the policy renders the same module, and links to the public page", () => {
    assert.match(privacyPage, /from "@\/content\/account-deletion"/);
    for (const symbol of [
      "deletionRoutes.map",
      "DELETION_REMOVES.map",
      "deletionRetains.map",
      "DELETION_LIMITS.map",
      "deletionSummary",
    ]) {
      assert.ok(privacyPage.includes(symbol), symbol);
    }
    assert.match(privacyPage, /href=\{PUBLIC_DELETION_PATH\}/);
  });

  test("the account page and the public page point at each other", () => {
    assert.equal(ACCOUNT_DELETION_PATH, "/account/delete");
    assert.ok(publicPage.includes("ACCOUNT_DELETION_PATH"));
    assert.ok(accountPage.includes("PUBLIC_DELETION_PATH"));
  });
});
