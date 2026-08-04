import type { ActionCodeSettings } from "firebase/auth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yovoice.app";

/**
 * handleCodeInApp: true means Firebase skips its own generic hosted
 * handler page entirely and sends the emailed link straight to `url` with
 * mode/oobCode/apiKey appended as query params — VerifyEmailPage reads
 * those and applies the code itself. Without this, the link would land on
 * Firebase's default https://<project>.firebaseapp.com/__/auth/action
 * page, which has no way back to this site.
 *
 * No androidPackageName/iOSBundleId/dynamicLinkDomain here — the Flutter
 * app doesn't implement any email-verification handling at all yet (a
 * separate, larger gap than this fix), and Dynamic Links were shut down by
 * Google in 2025, so there is nothing real to configure for either.
 */
export function verifyEmailActionCodeSettings(
  redirectPath?: string | null,
): ActionCodeSettings {
  const url = new URL(`${SITE_URL}/verify-email`);
  if (redirectPath) url.searchParams.set("redirect", redirectPath);
  return {
    url: url.toString(),
    handleCodeInApp: true,
  };
}
