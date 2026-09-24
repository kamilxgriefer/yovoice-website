"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { resolveAuthRedirect } from "@/lib/auth/auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TotpChallengeForm } from "@/components/auth/totp-challenge-form";
import { SocialSignIn } from "@/components/auth/social-sign-in";
import { AuthFold, AuthFoldAway } from "@/components/auth/auth-fold";
import {
  markAuthModeSwitch,
  shouldPlayAuthModeSwitch,
} from "@/components/auth/auth-mode-motion";
import { authModeHref } from "@/lib/auth/auth-mode";
import type { TotpSignInChallenge } from "@/lib/auth/totp-sign-in";

export function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [totpChallenge, setTotpChallenge] =
    useState<TotpSignInChallenge | null>(null);
  // Which first factor the second-factor step follows: a Google or Apple
  // sign-in has no password to go back to.
  const [challengeAfterSocial, setChallengeAfterSocial] = useState(false);
  // A Google or Apple window is open: the password submit waits.
  const [socialBusy, setSocialBusy] = useState(false);
  // Arrived from Create account: fold its extra rows away and unfold ours.
  // Once only — returning from the second-factor step shows the plain form.
  const [switched, setSwitched] = useState(shouldPlayAuthModeSwitch);

  function finishSignIn() {
    router.replace(resolveAuthRedirect(searchParams.get("redirect")));
  }

  function openSocialChallenge(challenge: TotpSignInChallenge) {
    setSwitched(false);
    setChallengeAfterSocial(true);
    setTotpChallenge(challenge);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (socialBusy) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await signIn(email, password);
      if (result.status === "totp-required") {
        setSwitched(false);
        setChallengeAfterSocial(false);
        setTotpChallenge(result.challenge);
        setPassword("");
        setSubmitting(false);
        return;
      }
      // replace, not push: a completed login shouldn't sit in history behind
      // the destination, or Back lands on this form and RedirectIfAuthenticated
      // immediately throws the user forward again.
      finishSignIn();
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setSubmitting(false);
    }
  }

  if (totpChallenge) {
    // `data-auth-challenge` hides the layout's mode switch: leaving mid-way
    // would silently drop the pending second factor. "Back to password" (or
    // "Back", after Google or Apple) is the way out.
    return (
      <div data-auth-challenge>
        <TotpChallengeForm
          challenge={totpChallenge}
          cancelLabel={challengeAfterSocial ? "Back" : undefined}
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
      {/* Identical at the top of the register form, so switching modes never
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

      {switched ? <AuthFoldAway size="field" /> : null}

      <div>
        <label htmlFor="login-email" className="sr-only">
          Email address
        </label>
        <Input
          id="login-email"
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
        <label htmlFor="login-password" className="sr-only">
          Password
        </label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          icon={<Lock className="size-[18px]" />}
        />
      </div>

      {switched ? <AuthFoldAway size="field" /> : null}

      <AuthFold enter={switched}>
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold link-accent"
          >
            Forgot password?
          </Link>
        </div>
      </AuthFold>

      <Button
        type="submit"
        isLoading={submitting}
        disabled={submitting || socialBusy}
        className={socialBusy ? "w-full opacity-60" : "w-full"}
      >
        <span className="auth-label" data-entering={switched ? "" : undefined}>
          {submitting ? "Signing in…" : "Log in"}
        </span>
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href={authModeHref("register", searchParams.get("redirect"))}
          className="font-semibold link-accent"
          onNavigate={markAuthModeSwitch}
        >
          Create account
        </Link>
      </p>
    </form>
  );
}
