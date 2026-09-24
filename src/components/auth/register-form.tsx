"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { resolveAuthRedirect } from "@/lib/auth/auth-redirect";
import { verifyEmailPathAfterRegistration } from "@/lib/auth/registration-flow";
import type { TotpSignInChallenge } from "@/lib/auth/totp-sign-in";
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";
import { SocialSignIn } from "@/components/auth/social-sign-in";
import { TotpChallengeForm } from "@/components/auth/totp-challenge-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFold, AuthFoldAway } from "@/components/auth/auth-fold";
import {
  markAuthModeSwitch,
  shouldPlayAuthModeSwitch,
} from "@/components/auth/auth-mode-motion";
import { authModeHref } from "@/lib/auth/auth-mode";

export function RegisterForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // True from submit until this page navigates away. Firebase signs the new
  // account in before signUp resolves; without this the signed-in redirect
  // would unmount the form and lose the verification-email outcome.
  const [registrationStarted, setRegistrationStarted] = useState(false);
  // Arrived from Log in: fold its Forgot password row away and unfold ours.
  // Once only — returning from the second-factor step shows the plain form.
  const [switched, setSwitched] = useState(shouldPlayAuthModeSwitch);
  // A Google or Apple window is open: the email sign-up waits.
  const [socialBusy, setSocialBusy] = useState(false);
  // "Continue with Google / Apple" reached an existing account that has an
  // authenticator: its second factor is owed here, as on Log in.
  const [totpChallenge, setTotpChallenge] =
    useState<TotpSignInChallenge | null>(null);

  // Google and Apple accounts arrive verified by their provider, so they skip
  // /verify-email and go where a login would.
  function finishSignIn() {
    router.replace(resolveAuthRedirect(searchParams.get("redirect")));
  }

  function openSocialChallenge(challenge: TotpSignInChallenge) {
    setSwitched(false);
    setTotpChallenge(challenge);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (socialBusy) return;
    setError(null);

    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    setRegistrationStarted(true);
    try {
      const { verificationEmail } = await signUp(email, password, displayName);
      // Straight to the app would skip past email verification entirely —
      // land on the verify-email prompt instead, carrying the original
      // destination forward so it can pick up where this would have gone
      // once the account is actually verified. A failed send is reported
      // there (the account exists, so this form can no longer help).
      router.push(
        verifyEmailPathAfterRegistration(
          verificationEmail,
          searchParams.get("redirect"),
        ),
      );
    } catch (err) {
      // The account was not created: stay here and show why.
      setError(getAuthErrorMessage(err));
      setSubmitting(false);
      setRegistrationStarted(false);
    }
  }

  if (totpChallenge) {
    // As on Log in: `data-auth-challenge` hides the layout's mode switch,
    // which would silently drop the pending second factor; "Back" is the way
    // out.
    return (
      <div data-auth-challenge>
        <TotpChallengeForm
          challenge={totpChallenge}
          cancelLabel="Back"
          onCancel={() => {
            setTotpChallenge(null);
            setError(null);
          }}
          onComplete={finishSignIn}
        />
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
      <RedirectIfAuthenticated suspended={registrationStarted} />
      {/* Identical at the top of the login form, so switching modes never
          moves it (see SocialSignIn). */}
      <SocialSignIn
        locked={submitting}
        onBusyChange={setSocialBusy}
        onError={setError}
        onTotpRequired={openSocialChallenge}
        onSignedIn={finishSignIn}
      />

      {error ? (
        <p
          role="alert"
          data-tone="error"
          className="status-alert"
        >
          {error}
        </p>
      ) : null}

      <AuthFold enter={switched}>
        <label htmlFor="register-name" className="sr-only">
          Display name
        </label>
        <Input
          id="register-name"
          type="text"
          autoComplete="name"
          required
          placeholder="Display name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          icon={<User className="size-[18px]" />}
        />
      </AuthFold>

      <div>
        <label htmlFor="register-email" className="sr-only">
          Email address
        </label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          icon={<Mail className="size-[18px]" />}
        />
      </div>

      <div>
        <label htmlFor="register-password" className="sr-only">
          Password
        </label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          icon={<Lock className="size-[18px]" />}
        />
      </div>

      {switched ? <AuthFoldAway size="link" /> : null}

      <AuthFold enter={switched}>
        <label htmlFor="register-confirm-password" className="sr-only">
          Confirm password
        </label>
        <Input
          id="register-confirm-password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          icon={<Lock className="size-[18px]" />}
          state={confirmPassword && password !== confirmPassword ? "error" : "default"}
        />
      </AuthFold>

      <Button
        type="submit"
        isLoading={submitting}
        disabled={submitting || socialBusy}
        className={socialBusy ? "w-full opacity-60" : "w-full"}
      >
        <span className="auth-label" data-entering={switched ? "" : undefined}>
          {submitting ? "Creating account…" : "Create account"}
        </span>
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href={authModeHref("login", searchParams.get("redirect"))}
          className="font-semibold link-accent"
          onNavigate={markAuthModeSwitch}
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
