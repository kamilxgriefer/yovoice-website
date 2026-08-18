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

  function finishSignIn() {
    router.replace(resolveAuthRedirect(searchParams.get("redirect")));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await signIn(email, password);
      if (result.status === "totp-required") {
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
    return (
      <TotpChallengeForm
        challenge={totpChallenge}
        onCancel={() => {
          setTotpChallenge(null);
          setError(null);
        }}
        onComplete={finishSignIn}
      />
    );
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
      {error ? (
        <p
          role="alert"
          className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          {error}
        </p>
      ) : null}

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

      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-xs font-semibold text-fuchsia-300 hover:text-white"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" size="lg" isLoading={submitting} className="w-full">
        {submitting ? "Signing in…" : "Log in"}
      </Button>

      <p className="text-center text-sm text-white/45">
        Don&apos;t have an account?{" "}
        <Link
          href={
            searchParams.get("redirect")
              ? `/register?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
              : "/register"
          }
          className="font-semibold text-fuchsia-300 hover:text-white"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
