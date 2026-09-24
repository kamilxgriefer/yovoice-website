/**
 * One "Continue with Google / Apple" attempt at a time per tab, owned by the
 * tab rather than by the form that started it.
 *
 * Log in and Create account are two routes. A visitor can switch between
 * them (or go Back) while Google's or Apple's window is still open, which
 * unmounts the form that started the attempt. So the attempt lives here:
 *
 * - Whichever `SocialSignIn` is on screen draws it (busy button, the other
 *   one and the email submit held off), including one that mounted after the
 *   attempt started, so a switch never re-enables everything mid-attempt.
 * - Its outcome goes to the form on screen when it settles
 *   (`claimSocialSignInOutcomes`): a second factor owed or an error appears
 *   there, with that page's own `?redirect=`. With no form on screen (the
 *   visitor left the auth pages) the outcome is dropped; a completed sign-in
 *   is still a sign-in, and that page's own guard, if any, deals with it.
 * - It holds the "already signed in" redirect (`signed-in-redirect-hold`)
 *   from start to settle, so a new account's `users/{uid}` write is never cut
 *   off. Releasing that hold is also what navigates after a completed sign-in:
 *   the page's `RedirectIfAuthenticated` sends the visitor on exactly once,
 *   with the redirect of the page they are on at that moment. The form never
 *   navigates for a Google or Apple sign-in itself.
 *
 * Kept free of React, Firebase and path-alias imports so `node --test` can
 * load it.
 */
import { holdSignedInRedirect } from "./signed-in-redirect-hold.ts";
import type { SocialProvider } from "./social-sign-in.ts";
import type { SignInResult, TotpSignInChallenge } from "./totp-sign-in.ts";

/**
 * - `checking`: Apple's availability is being asked again ("try again").
 * - `waiting`: the provider's window is open, or the account is being
 *   finished after it closed.
 * - `signed-in`: done; the page is on its way out. Cleared when the form that
 *   received it leaves the screen.
 */
export type SocialSignInStep = "checking" | "waiting" | "signed-in";

export type SocialSignInFlow = {
  readonly provider: SocialProvider;
  readonly step: SocialSignInStep;
} | null;

export type SocialSignInOutcome =
  | { readonly kind: "signed-in" }
  | { readonly kind: "totp-required"; readonly challenge: TotpSignInChallenge }
  | { readonly kind: "failed"; readonly error: unknown };

export type SocialSignInOutcomeHandler = (
  provider: SocialProvider,
  outcome: SocialSignInOutcome,
) => void;

let flow: SocialSignInFlow = null;
let consumer: SocialSignInOutcomeHandler | null = null;
const listeners = new Set<() => void>();

function setFlow(next: SocialSignInFlow) {
  if (next === flow) return;
  flow = next;
  for (const listener of listeners) listener();
}

export function getSocialSignInFlow(): SocialSignInFlow {
  return flow;
}

/** The server never runs an attempt. */
export function getSocialSignInFlowOnServer(): SocialSignInFlow {
  return null;
}

/** `useSyncExternalStore` subscription. */
export function subscribeSocialSignInFlow(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * The form now on screen hears how attempts end, replacing any earlier one.
 * The returned function gives that up; when it is called after a completed
 * sign-in (the page navigated away), the attempt is over for good.
 */
export function claimSocialSignInOutcomes(
  handler: SocialSignInOutcomeHandler,
): () => void {
  consumer = handler;
  return () => {
    if (consumer !== handler) return;
    consumer = null;
    if (flow?.step === "signed-in") setFlow(null);
  };
}

/**
 * Starts an attempt, or returns `null` without doing anything when one is
 * already running. `attempt` is called synchronously, so a provider window it
 * opens first still opens inside the visitor's click. It reports its own
 * `checking` -> `waiting` step, and resolves to the sign-in result or
 * rejects with the provider's error. The returned promise never rejects.
 */
export function startSocialSignIn(
  provider: SocialProvider,
  firstStep: Exclude<SocialSignInStep, "signed-in">,
  attempt: (setStep: (step: Exclude<SocialSignInStep, "signed-in">) => void) => Promise<SignInResult>,
): Promise<SocialSignInOutcome> | null {
  if (flow !== null) return null;
  const release = holdSignedInRedirect();
  setFlow({ provider, step: firstStep });
  let settledOutcome = false;
  const setStep = (step: Exclude<SocialSignInStep, "signed-in">) => {
    if (settledOutcome || flow?.provider !== provider || flow.step === step) return;
    setFlow({ provider, step });
  };

  let running: Promise<SignInResult>;
  try {
    running = attempt(setStep);
  } catch (error) {
    running = Promise.reject(error);
  }

  return running
    .then(
      (result): SocialSignInOutcome =>
        result.status === "totp-required"
          ? { kind: "totp-required", challenge: result.challenge }
          : { kind: "signed-in" },
      (error: unknown): SocialSignInOutcome => ({ kind: "failed", error }),
    )
    .then((outcome) => {
      settledOutcome = true;
      const handler = consumer;
      // A completed sign-in keeps the buttons busy while its page leaves;
      // anything else hands them back.
      setFlow(outcome.kind === "signed-in" && handler ? { provider, step: "signed-in" } : null);
      if (handler) {
        try {
          handler(provider, outcome);
        } catch (error) {
          console.error("YO Voice sign-in: the form could not show the outcome.", error);
        }
      }
      // Last: for a completed sign-in this is what lets the page's guard
      // navigate, once, after the form has had its say.
      release();
      return outcome;
    });
}
