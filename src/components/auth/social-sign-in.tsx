"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { AppleMark, GoogleMark } from "@/components/auth/provider-marks";
import { getSocialAuthErrorMessage } from "@/lib/auth/auth-errors";
import {
  getAppleSignInAvailability,
  peekAppleSignInAvailability,
} from "@/lib/auth/apple-availability";
import { holdSignedInRedirect } from "@/lib/auth/signed-in-redirect-hold";
import {
  SOCIAL_BUTTON_LABEL,
  SOCIAL_PROVIDER_NAME,
  SocialProviderUnavailableError,
  appleButtonState,
  type AppleSignInAvailability,
  type SocialProvider,
} from "@/lib/auth/social-sign-in";
import type { TotpSignInChallenge } from "@/lib/auth/totp-sign-in";
import { cn } from "@/lib/utils/cn";

type SocialSignInProps = {
  /** The email form is submitting, so neither provider may start. */
  locked: boolean;
  /** True while a provider window is open or its account is being finished;
   * the form keeps its own submit button off meanwhile. */
  onBusyChange: (busy: boolean) => void;
  /** A message for the form's alert, or `null` to clear it. */
  onError: (message: string | null) => void;
  /** The account has an authenticator: the form shows the TOTP step. */
  onTotpRequired: (challenge: TotpSignInChallenge) => void;
  onSignedIn: () => void;
};

/**
 * "Continue with Google" and "Continue with Apple", then "or with email".
 *
 * Log in and Create account render this block identically at the very top of
 * their forms, so the mode switch never moves it and the rows below it keep
 * the choreography they had without it. A first Google or Apple sign-in
 * creates the account, so both pages offer the same two actions, as the app
 * does.
 */
export function SocialSignIn({
  locked,
  onBusyChange,
  onError,
  onTotpRequired,
  onSignedIn,
}: SocialSignInProps) {
  const { signInWithProvider } = useAuth();
  const [pending, setPending] = useState<SocialProvider | null>(null);
  const [apple, setApple] = useState<AppleSignInAvailability | null>(
    peekAppleSignInAvailability,
  );
  const inFlight = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (apple !== null) return;
    let active = true;
    void getAppleSignInAvailability().then((availability) => {
      if (active) setApple(availability);
    });
    return () => {
      active = false;
    };
  }, [apple]);

  async function continueWith(provider: SocialProvider) {
    if (inFlight.current || locked) return;
    inFlight.current = true;
    onError(null);
    setPending(provider);
    onBusyChange(true);
    // Keeps the page's "already signed in" redirect off until a new account's
    // profile is written, even if the visitor switches mode meanwhile.
    const release = holdSignedInRedirect();
    let signedIn = false;
    try {
      if (provider === "apple" && apple !== "available") {
        // "Try again": ask Firebase once more before opening Apple's window.
        const availability = await getAppleSignInAvailability();
        if (mounted.current) setApple(availability);
        if (availability !== "available") {
          throw new SocialProviderUnavailableError(provider);
        }
      }
      // Nothing is awaited before this on the usual path, so the provider's
      // window opens inside the click and pop-up blockers let it through.
      const result = await signInWithProvider(provider);
      if (result.status === "totp-required") {
        onTotpRequired(result.challenge);
      } else {
        signedIn = true;
        onSignedIn();
      }
    } catch (error) {
      onError(getSocialAuthErrorMessage(error, SOCIAL_PROVIDER_NAME[provider]));
    } finally {
      release();
      inFlight.current = false;
      // A completed sign-in keeps its spinner while the page navigates away,
      // like the password form's "Signing in…".
      if (!signedIn) {
        if (mounted.current) setPending(null);
        onBusyChange(false);
      }
    }
  }

  const busy = pending !== null;
  const appleButton = appleButtonState(apple);

  return (
    <div>
      <div className="grid gap-3">
        <SocialButton
          provider="google"
          mark={<GoogleMark className="size-5 shrink-0" />}
          loading={pending === "google"}
          disabled={locked || busy}
          onPress={continueWith}
        />
        <SocialButton
          provider="apple"
          mark={<AppleMark className="size-5 shrink-0" />}
          loading={pending === "apple" || appleButton.pending}
          disabled={locked || busy || appleButton.disabled}
          status={appleButton.status}
          onPress={continueWith}
        />
      </div>
      <p className="auth-divider">or with email</p>
    </div>
  );
}

function SocialButton({
  provider,
  mark,
  loading,
  disabled,
  status = null,
  onPress,
}: {
  provider: SocialProvider;
  mark: ReactNode;
  loading: boolean;
  disabled: boolean;
  status?: string | null;
  onPress: (provider: SocialProvider) => void;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      icon={mark}
      isLoading={loading}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-provider={provider}
      onClick={() => onPress(provider)}
      // A loading button keeps the primitive's own dimming; any other
      // unavailable one reads as off and ignores the pointer.
      className={cn("w-full", !loading && "disabled:pointer-events-none disabled:opacity-60")}
    >
      {SOCIAL_BUTTON_LABEL[provider]}
      {status ? (
        <>
          <span className="sr-only">, </span>
          <span className="social-status">{status}</span>
        </>
      ) : null}
    </Button>
  );
}
