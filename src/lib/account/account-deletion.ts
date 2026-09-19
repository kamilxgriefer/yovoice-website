/**
 * The website half of the account-deletion contract.
 *
 * Parsing and error mapping live here rather than in the page so they can be
 * tested without a DOM, the same split the display-name change uses
 * (src/lib/profile/display-name-change.ts).
 *
 * Server contract (yovoice-evidence/2026-09-18/b32/deletion-design.md §2.3):
 *   request  deleteAccountSelfV1({})            — no input; the uid comes from Auth
 *   response { state, requestedAtMillis }       — state: pending | running | completed
 *
 * The callable requires a re-authentication no older than five minutes
 * (requireRecentPrivilegedAuthentication, functions/utils/auth.js:52), which is
 * why the page reauthenticates with the user's own password and forces a fresh
 * ID token before calling it.
 */
import { PRIVACY_MAILBOX } from "../../content/account-deletion.ts";
import { getAuthErrorMessage } from "../auth/auth-errors.ts";

export const ACCOUNT_DELETION_CALLABLE = "deleteAccountSelfV1";

/** Re-authentication is accepted for five minutes by the server. */
export const PRIVILEGED_AUTH_MAX_AGE_MS = 5 * 60 * 1000;

export type AccountDeletionState = "pending" | "running" | "completed";

export type AccountDeletionRequest = {
  state: AccountDeletionState;
  requestedAtMillis: number | null;
};

const STATES: readonly AccountDeletionState[] = ["pending", "running", "completed"];

function errorCode(error: unknown): string | null {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" ? code : null;
}

/**
 * Reads the callable's response.
 *
 * Returns null for a malformed body — which the caller must treat as "the
 * request was accepted anyway", never as a failure: a 2xx from the callable
 * means its transaction committed and the account is already marked for
 * deletion. Only the wording of the confirmation depends on this.
 */
export function parseAccountDeletionResult(
  data: unknown,
): AccountDeletionRequest | null {
  if (!data || typeof data !== "object") return null;
  const payload = data as { state?: unknown; requestedAtMillis?: unknown };
  const state = STATES.find((candidate) => candidate === payload.state);
  if (!state) return null;
  const requestedAtMillis =
    typeof payload.requestedAtMillis === "number" &&
    Number.isFinite(payload.requestedAtMillis)
      ? payload.requestedAtMillis
      : null;
  return { state, requestedAtMillis };
}

/**
 * True when the failure means "re-authenticate and try again" rather than
 * "this did not work". The server refuses a session whose sign-in is older
 * than five minutes, and Firebase refuses the re-authentication itself with
 * auth/requires-recent-login.
 */
export function isStaleAuthenticationError(error: unknown): boolean {
  const code = errorCode(error);
  return (
    code === "auth/requires-recent-login" ||
    code === "auth/user-token-expired" ||
    code === "functions/unauthenticated"
  );
}

const CALLABLE_MESSAGES: Record<string, string> = {
  "functions/unauthenticated":
    "Your sign-in is too old to delete an account. Enter your password again and retry.",
  "functions/permission-denied":
    "Your sign-in is too old to delete an account. Enter your password again and retry.",
  "functions/failed-precondition": `Self-service deletion is switched off right now. Email ${PRIVACY_MAILBOX} and we will delete your account by hand.`,
  "functions/unimplemented": `Self-service deletion is not available on this account yet. Email ${PRIVACY_MAILBOX} and we will delete your account by hand.`,
  "functions/not-found": `We could not find a YO Voice account record for this sign-in. Email ${PRIVACY_MAILBOX} and we will take it from there.`,
  "functions/resource-exhausted":
    "Too many deletion attempts. Wait a few minutes and try again.",
  "functions/deadline-exceeded":
    "The request timed out before we could confirm it. Reload this page: if your account is already being deleted, you will be signed out.",
  "functions/unavailable":
    "We could not reach YO Voice. Check your connection and try again.",
  "functions/internal": `Something went wrong on our side and your account was not deleted. Try again, or email ${PRIVACY_MAILBOX}.`,
};

/**
 * A specific, actionable message for every failure this flow can produce —
 * never a raw Firebase code, and never a bare "something went wrong" where a
 * real explanation exists. Auth codes fall through to the shared auth copy.
 */
export function getAccountDeletionErrorMessage(error: unknown): string {
  const code = errorCode(error);
  if (code && CALLABLE_MESSAGES[code]) return CALLABLE_MESSAGES[code];
  if (code === "auth/requires-recent-login") {
    return "Your sign-in is too old to delete an account. Enter your password again and retry.";
  }
  if (code?.startsWith("auth/")) return getAuthErrorMessage(error);
  if (code?.startsWith("functions/")) {
    return `We could not complete the deletion. Try again, or email ${PRIVACY_MAILBOX}.`;
  }
  return `Something went wrong and your account was not deleted. Try again, or email ${PRIVACY_MAILBOX}.`;
}

/**
 * The confirmation shown after the callable accepts the request. `completed`
 * is possible when the sweep finished before the response came back.
 *
 * Both sentences describe the sign-out in the PRESENT tense on purpose. This
 * string is rendered while `signOut()` is still in flight — the account page
 * sets it before awaiting, because awaiting first unmounts the panel (see the
 * ordering note in src/app/(account)/account/delete/page.tsx) — so a past
 * tense here would be the page asserting something that has not finished. The
 * completed-sign-out sentence belongs to the public page's banner, which only
 * renders after the sign-out has resolved and the navigation has happened.
 */
export function getAccountDeletionConfirmation(
  request: AccountDeletionRequest | null,
): string {
  if (request?.state === "completed") {
    return "Your account has been deleted. You are being signed out.";
  }
  return "Your account is being deleted. You are being signed out, and it usually finishes within a few minutes.";
}

/**
 * Does this sign-in have a password to re-authenticate with? An account
 * created with Google or Apple does not, and cannot be deleted from the
 * website — the site supports email and password only (src/providers/auth-provider.tsx).
 */
export function hasPasswordSignIn(
  providerData: readonly { providerId: string }[] | null | undefined,
): boolean {
  return (providerData ?? []).some(
    (provider) => provider.providerId === "password",
  );
}
