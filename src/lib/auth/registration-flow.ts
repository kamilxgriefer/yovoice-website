/**
 * Website sign-up hand-off from /register to /verify-email.
 *
 * Firebase reports the new account as signed in while `signUp` is still
 * sending the verification email. The "already signed in" redirect on
 * /register must therefore stay off from the moment a sign-up starts, so the
 * form stays mounted and can report what actually happened to the email:
 * sent, or not sent (with a way to resend it).
 *
 * Kept free of Firebase and path-alias imports so `node --test` can load it.
 */

export type VerificationEmailDelivery = "sent" | "failed";

/** What `signUp` reports once the account exists. Errors that prevent the
 * account from being created (email in use, weak password, network) are
 * still thrown, because the form must stay on /register to show them. */
export type RegistrationResult = {
  verificationEmail: VerificationEmailDelivery;
};

/**
 * Runs the post-account steps and turns a failed verification email into an
 * explicit outcome instead of an exception, so the caller cannot mistake it
 * for "the account was not created". A synchronous throw counts as a failure.
 */
export async function verificationEmailDelivery(
  finishRegistration: () => Promise<void>,
  onFailure?: (error: unknown) => void,
): Promise<VerificationEmailDelivery> {
  try {
    await new Promise<void>((resolve) => resolve(finishRegistration()));
    return "sent";
  } catch (error) {
    onFailure?.(error);
    return "failed";
  }
}

/**
 * The /login, /register and /forgot-password guard sends a signed-in visitor
 * away, except while this page's own sign-up is in progress or handing off to
 * /verify-email (`suspended`).
 */
export function shouldRedirectSignedInVisitor(input: {
  loading: boolean;
  signedIn: boolean;
  suspended: boolean;
}): boolean {
  return !input.suspended && !input.loading && input.signedIn;
}

export const VERIFY_EMAIL_PATH = "/verify-email";
export const VERIFICATION_SEND_PARAM = "send";
export const VERIFICATION_SEND_FAILED = "failed";

/** Where the register form goes once the account exists. The original
 * ?redirect destination is carried forward unchanged (it is validated where
 * it is used, by resolveAuthRedirect). */
export function verifyEmailPathAfterRegistration(
  delivery: VerificationEmailDelivery,
  redirectParam: string | null,
): string {
  const params = new URLSearchParams();
  if (delivery === "failed") {
    params.set(VERIFICATION_SEND_PARAM, VERIFICATION_SEND_FAILED);
  }
  if (redirectParam) params.set("redirect", redirectParam);
  const query = params.toString();
  return query ? `${VERIFY_EMAIL_PATH}?${query}` : VERIFY_EMAIL_PATH;
}

type ReadonlySearchParams = {
  get(name: string): string | null;
  toString(): string;
};

/**
 * What /verify-email may say about the email:
 * - "failed": the sign-up just told us it was not sent.
 * - "resent": a resend from this page succeeded.
 * - "requested": arrived without a failure report (after a successful
 *   sign-up, or from the account banner).
 */
export type VerificationSendState = "failed" | "resent" | "requested";

export function verificationSendState(input: {
  searchParams: ReadonlySearchParams;
  resentFromThisPage: boolean;
}): VerificationSendState {
  if (input.resentFromThisPage) return "resent";
  return input.searchParams.get(VERIFICATION_SEND_PARAM) === VERIFICATION_SEND_FAILED
    ? "failed"
    : "requested";
}

/** The same /verify-email URL without the send-failure report, used once a
 * resend succeeds so a reload never repeats a stale "not sent" message. */
export function verifyEmailPathWithoutSendState(
  searchParams: ReadonlySearchParams,
): string {
  const params = new URLSearchParams(searchParams.toString());
  params.delete(VERIFICATION_SEND_PARAM);
  const query = params.toString();
  return query ? `${VERIFY_EMAIL_PATH}?${query}` : VERIFY_EMAIL_PATH;
}
