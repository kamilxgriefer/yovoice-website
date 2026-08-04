import type { ActionCodeSettings } from "firebase/auth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yovoice.app";

/**
 * Confirmed by testing real emailed links (2026-08-04, not assumed):
 * for verifyEmail/resetPassword oob codes, Firebase ALWAYS routes through
 * its own hosted action-handler page first (at the project's authDomain).
 * `url` here becomes the `continueUrl` query param on that hosted page,
 * which correctly sends the user to it afterward — confirmed with a
 * from-scratch browser profile (no prior session on this origin at all)
 * clicking a real link end to end. An EARLIER round of testing appeared
 * to show verifyEmail's Continue button landing on yovoice-ec54a.web.app
 * instead — that was this site's OWN "already verified, redirecting to
 * the app" logic firing correctly, misattributed to Firebase, because the
 * test browser tabs shared a previously-verified session on this origin
 * (IndexedDB/localStorage are origin-scoped, not tab-scoped) left over
 * from earlier steps in the same test sequence. Root-caused by repeating
 * the test in a tab with zero prior interaction with this origin.
 *
 * handleCodeInApp is omitted — it signals "try to hand this off to a
 * native app" for the passwordless email-link *sign-in* feature
 * specifically; it has no effect on verifyEmail/resetPassword, and there's
 * no Flutter deep-link handler to hand off to regardless. No
 * androidPackageName/iOSBundleId for the same reason.
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
