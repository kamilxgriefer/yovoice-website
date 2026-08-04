import type { ActionCodeSettings } from "firebase/auth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yovoice.app";

/**
 * Confirmed by testing a real emailed link (2026-08-04, not assumed):
 * for verifyEmail/resetPassword oob codes, Firebase ALWAYS routes through
 * its own hosted action-handler page first (at the project's authDomain).
 * `url` here becomes the `continueUrl` query param on that hosted page,
 * which is where its own "Continue" button sends the user afterward —
 * NOT a bypass of Firebase's page. VerifyEmailPage's own applyActionCode
 * branch still exists for defense in depth (e.g. a future mobile deep
 * link) but a real emailed link never actually reaches it; Firebase's
 * hosted page consumes the code first.
 *
 * handleCodeInApp is deliberately OMITTED (not just false) — it signals
 * "try to hand this off to a native app," and empirically, leaving it
 * `true` was the cause of verifyEmail's Continue button landing on
 * yovoice-ec54a.web.app (Firebase's default Hosting site, associated via
 * mobileLinksConfig.domain=HOSTING_DOMAIN) instead of the configured
 * continueUrl — resetPassword, which has no such "hand off to the app"
 * semantics, honored continueUrl correctly the whole time with the exact
 * same settings shape. No androidPackageName/iOSBundleId either — the
 * Flutter app has no deep-link handler for these at all.
 */
function actionCodeSettings(
  path: string,
  redirectPath?: string | null,
): ActionCodeSettings {
  const url = new URL(`${SITE_URL}${path}`);
  if (redirectPath) url.searchParams.set("redirect", redirectPath);
  return {
    url: url.toString(),
  };
}

export function verifyEmailActionCodeSettings(
  redirectPath?: string | null,
): ActionCodeSettings {
  return actionCodeSettings("/verify-email", redirectPath);
}

export function resetPasswordActionCodeSettings(): ActionCodeSettings {
  return actionCodeSettings("/login");
}
