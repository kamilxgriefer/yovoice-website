"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { verifyEmailPathAfterRegistration } from "@/lib/auth/registration-flow";
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
      <RedirectIfAuthenticated suspended={registrationStarted} />
      {error ? (
        <p
          role="alert"
          data-tone="error"
          className="status-alert"
        >
          {error}
        </p>
      ) : null}

      <div>
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
      </div>

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

      <div>
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
      </div>

      <Button type="submit" isLoading={submitting} className="w-full">
        {submitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href={
            searchParams.get("redirect")
              ? `/login?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
              : "/login"
          }
          className="font-semibold link-accent"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
