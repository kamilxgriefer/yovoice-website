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
  "auth/session-expired": "This sign-in attempt expired. Return to password and sign in again.",
  "auth/multi-factor-info-not-found": "That authenticator is no longer enrolled. Sign in again.",
  "auth/unsupported-second-factor": "This account uses a second-factor method that is not supported on the website.",
  "auth/invalid-totp-challenge": "Enter a valid 6-digit code for an authenticator enrolled on this account.",
};

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  if (code && MESSAGES[code]) return MESSAGES[code];
  return "Something went wrong. Please try again.";
}
