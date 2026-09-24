const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "That email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-not-found": "That email or password is incorrect.",
  "auth/wrong-password": "That email or password is incorrect.",
  "auth/email-already-in-use": "An account with that email already exists.",
  "auth/weak-password": "Choose a password with at least 8 characters.",
  "auth/too-many-requests": "Too many attempts. Try again in a few minutes.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/invalid-action-code": "This link has already been used or is invalid. Request a new one.",
  "auth/expired-action-code": "This link has expired. Request a new one.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/invalid-verification-code": "That authenticator code is not valid. Try the current code.",
  "auth/code-expired": "That authenticator code expired. Enter the new code from your app.",
  "auth/session-expired": "This sign-in attempt expired. Go back and sign in again.",
  "auth/multi-factor-info-not-found": "That authenticator is no longer enrolled. Sign in again.",
  "auth/unsupported-second-factor": "This account uses a second-factor method that is not supported on the website.",
  "auth/invalid-totp-challenge": "Enter a valid 6-digit code for an authenticator enrolled on this account.",
};

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  if (code && MESSAGES[code]) return MESSAGES[code];
  return "Something went wrong. Please try again.";
}

/** Closing the provider's window, or opening a second one, is a choice rather
 * than a failure: the form says nothing and the buttons come back. */
const SOCIAL_CANCELLATION_CODES = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled",
]);

/** The provider is switched off, this origin is not an authorised domain, or
 * the availability probe could not confirm it. The owner fixes these in the
 * Firebase console; the visitor can only use another way in. */
const SOCIAL_UNAVAILABLE_CODES = new Set([
  "auth/operation-not-allowed",
  "auth/unauthorized-domain",
  "auth/operation-not-supported-in-this-environment",
  "auth/provider-unavailable",
]);

/**
 * Wording for a failed "Continue with Google / Apple". Returns `null` when
 * nothing should be shown (the visitor closed the window). Kept free of
 * imports so `node --test` can load it; `providerName` is "Google" or "Apple".
 */
export function getSocialAuthErrorMessage(
  error: unknown,
  providerName: string,
): string | null {
  const code = (error as { code?: string } | null)?.code;
  if (code && SOCIAL_CANCELLATION_CODES.has(code)) return null;
  if (code === "auth/popup-blocked") {
    return `Your browser blocked the ${providerName} sign-in window. Allow pop-ups for yovoice.app and try again.`;
  }
  if (code === "auth/web-storage-unsupported") {
    return `Your browser settings block what ${providerName} sign-in needs. Sign in with email, or allow cookies and site data for yovoice.app and try again.`;
  }
  if (code === "auth/account-exists-with-different-credential") {
    return "This email already has a YO Voice account. Log in with its password, or with the option you used to create it.";
  }
  if (code && SOCIAL_UNAVAILABLE_CODES.has(code)) {
    return `Sign-in with ${providerName} is not available right now.`;
  }
  // A provider credential Firebase refused is not "wrong email or password".
  if (code === "auth/invalid-credential") {
    return `Sign-in with ${providerName} could not be completed. Please try again.`;
  }
  return getAuthErrorMessage(error);
}
