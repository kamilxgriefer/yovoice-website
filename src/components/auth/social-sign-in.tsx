"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { AppleMark, GoogleMark } from "@/components/auth/provider-marks";
import { getSocialAuthErrorMessage } from "@/lib/auth/auth-errors";
import {
  getAppleSignInAvailability,
  peekAppleSignInAvailability,
  subscribeAppleSignInAvailability,
} from "@/lib/auth/apple-availability";
import {
  claimSocialSignInOutcomes,
  getSocialSignInFlow,
  getSocialSignInFlowOnServer,
  startSocialSignIn,
  subscribeSocialSignInFlow,
} from "@/lib/auth/social-sign-in-flow";
import {
  SOCIAL_ANNOUNCEMENT,
  SOCIAL_BUTTON_LABEL,
  SOCIAL_PROVIDER_NAME,
  SocialProviderReadyError,
  SocialProviderUnavailableError,
  appleButtonState,
  socialProgressLabel,
  type SocialProvider,
} from "@/lib/auth/social-sign-in";
import type { TotpSignInChallenge } from "@/lib/auth/totp-sign-in";

type SocialSignInProps = {
  /** The email form is submitting, so neither provider may start. */
  locked: boolean;
  /** A message for the form's alert, or `null` to clear it. */
  onError: (message: string | null) => void;
  /** The account has an authenticator: the form shows the TOTP step. */
  onTotpRequired: (challenge: TotpSignInChallenge, provider: SocialProvider) => void;
};

const noAppleAnswerOnServer = () => null;

/** The tab's running Google / Apple attempt (social-sign-in-flow.ts). */
function useSocialSignInFlow() {
  return useSyncExternalStore(
    subscribeSocialSignInFlow,
    getSocialSignInFlow,
    getSocialSignInFlowOnServer,
  );
}

/** True while a Google or Apple attempt runs anywhere in this tab, including
 * one started on the other auth form: the email form waits meanwhile. */
export function useSocialSignInBusy(): boolean {
  return useSocialSignInFlow() !== null;
}

/**
 * "Continue with Google" and "Continue with Apple", then "or with email".
 *
 * Log in and Create account render this block identically at the very top of
 * their forms, so the mode switch never moves it and the rows below it keep
 * the choreography they had without it. A first Google or Apple sign-in
 * creates the account, so both pages offer the same two actions, as the app
 * does.
 *
 * The buttons are never `disabled`: an unavailable one is `aria-disabled`, so
 * a keyboard visitor's focus stays on the button they pressed while the
 * provider's window is open and after it closes, and "Coming soon" stays
 * reachable with Tab. Progress ("Waiting for Google…", "cancelled") is spoken
 * through a polite status region; errors go to the form's alert, like every
 * other form error.
 *
 * The attempt itself belongs to the tab (social-sign-in-flow.ts), so switching
 * mode while a window is open keeps the new form's block busy, and the
 * outcome lands on whichever form is on screen when it arrives. A completed
 * sign-in navigates through the page's RedirectIfAuthenticated, once.
 */
export function SocialSignIn({ locked, onError, onTotpRequired }: SocialSignInProps) {
  const { signInWithProvider } = useAuth();
  const flow = useSocialSignInFlow();
  const apple = useSyncExternalStore(
    subscribeAppleSignInAvailability,
    peekAppleSignInAvailability,
    noAppleAnswerOnServer,
  );
  const [announcement, setAnnouncement] = useState("");

  // The outcome handler is registered once per mount; it reads the form's
  // current callbacks through this ref.
  const callbacks = useRef({ onError, onTotpRequired });
  useEffect(() => {
    callbacks.current = { onError, onTotpRequired };
  });

  useEffect(() => {
    // First mount in the tab: ask Firebase whether Apple can start. Later
    // mounts draw the kept answer at once (apple-availability-cache.ts).
    if (peekAppleSignInAvailability() === null) void getAppleSignInAvailability();
  }, []);

  useEffect(
    () =>
      claimSocialSignInOutcomes((provider, outcome) => {
        switch (outcome.kind) {
          case "signed-in":
            // RedirectIfAuthenticated navigates as soon as the flow lets go
            // of the redirect hold, right after this.
            setAnnouncement(SOCIAL_ANNOUNCEMENT.signedIn(provider));
            return;
          case "totp-required":
            // The code field takes focus and names itself.
            setAnnouncement("");
            callbacks.current.onTotpRequired(outcome.challenge, provider);
            return;
          case "failed": {
            if (outcome.error instanceof SocialProviderReadyError) {
              setAnnouncement(SOCIAL_ANNOUNCEMENT.ready(provider));
              return;
            }
            const message = getSocialAuthErrorMessage(
              outcome.error,
              SOCIAL_PROVIDER_NAME[provider],
            );
            if (message === null) {
              // The visitor closed the window: nothing went wrong.
              setAnnouncement(SOCIAL_ANNOUNCEMENT.cancelled(provider));
            } else {
              setAnnouncement("");
              callbacks.current.onError(message);
            }
          }
        }
      }),
    [],
  );

  const appleButton = appleButtonState(apple);

  function continueWith(provider: SocialProvider) {
    if (locked || flow !== null) return;
    if (provider === "apple" && appleButton.unavailable) return;
    const reprobe = provider === "apple" && appleButton.reprobes;
    const started = startSocialSignIn(
      provider,
      reprobe ? "checking" : "waiting",
      async () => {
        if (reprobe) {
          // "Couldn't check — try again": ask Firebase once more before
          // opening Apple's window.
          const availability = await getAppleSignInAvailability();
          if (availability !== "available") {
            throw new SocialProviderUnavailableError(provider);
          }
          // Available now, but this click has waited on the network, so a
          // window opened from here would be blocked. The button redraws as
          // available; the next press opens Apple straight away.
          throw new SocialProviderReadyError(provider);
        }
        // Nothing is awaited before this on the usual path, so the provider's
        // window opens inside the click and pop-up blockers let it through.
        return signInWithProvider(provider);
      },
    );
    if (!started) return;
    onError(null);
    setAnnouncement(
      reprobe ? SOCIAL_ANNOUNCEMENT.checking(provider) : SOCIAL_ANNOUNCEMENT.waiting(provider),
    );
  }

  function buttonFor(provider: SocialProvider, mark: ReactNode) {
    const running = flow?.provider === provider ? flow : null;
    const probing = provider === "apple" && appleButton.pending;
    const unavailable =
      locked || flow !== null || (provider === "apple" && appleButton.unavailable);
    return (
      <SocialButton
        provider={provider}
        mark={mark}
        spinning={running !== null || probing}
        unavailable={unavailable}
        // The button whose window is open keeps full colour.
        dimmed={unavailable && running === null}
        // While its attempt runs the button says what it is waiting for; the
        // status region speaks that, so it stays out of the button's name.
        detail={
          running
            ? socialProgressLabel(provider, running.step)
            : provider === "apple"
              ? appleButton.status
              : null
        }
        detailInName={running === null}
        onPress={continueWith}
      />
    );
  }

  return (
    <div>
      <div className="grid gap-3">
        {buttonFor("google", <GoogleMark className="size-5 shrink-0" />)}
        {buttonFor("apple", <AppleMark className="size-5 shrink-0" />)}
      </div>
      <p className="auth-divider">or with email</p>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

function SocialButton({
  provider,
  mark,
  spinning,
  unavailable,
  dimmed,
  detail,
  detailInName,
  onPress,
}: {
  provider: SocialProvider;
  mark: ReactNode;
  /** Its own attempt runs, or (Apple) its availability is being checked. */
  spinning: boolean;
  /** Pressing it does nothing right now. */
  unavailable: boolean;
  dimmed: boolean;
  /** The second line: a status or what it is waiting for. */
  detail: string | null;
  detailInName: boolean;
  onPress: (provider: SocialProvider) => void;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      icon={spinning ? <SocialSpinner /> : mark}
      aria-disabled={unavailable || undefined}
      aria-busy={spinning || undefined}
      data-provider={provider}
      data-dimmed={dimmed ? "" : undefined}
      onClick={() => {
        if (!unavailable) onPress(provider);
      }}
      className="social-button w-full"
    >
      <span className="social-button__text">
        <span>{SOCIAL_BUTTON_LABEL[provider]}</span>
        {detail ? (
          <>
            {detailInName ? <span className="sr-only">, </span> : null}
            <span
              className="social-button__detail"
              aria-hidden={detailInName ? undefined : true}
            >
              {detail}
            </span>
          </>
        ) : null}
      </span>
    </Button>
  );
}

/** An open arc rather than a ring with one coloured side: it keeps its shape
 * in forced colours (where every border takes the same system colour), and it
 * simply stops turning under reduced motion (globals.css). The button's second
 * line says in words what it is waiting for. */
function SocialSpinner() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 20 20"
      className="social-spinner size-5 shrink-0"
    >
      <circle
        cx="10"
        cy="10"
        r="7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeDasharray="33 14.2"
      />
    </svg>
  );
}
