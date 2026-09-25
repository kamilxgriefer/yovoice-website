"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RESEND_COOLDOWN_SECONDS = 60;

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    cooldownRef.current = setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }

  async function send() {
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
      startCooldown();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    await send();
  }

  if (sent) {
    return (
      <div className="mt-8 space-y-4 text-center">
        <div
          aria-hidden="true"
          className="icon-tile mx-auto size-14"
        >
          <Mail className="size-6" strokeWidth={1.8} />
        </div>
        <h2 className="text-xl font-bold">Check your inbox</h2>
        <p className="text-sm text-text-tertiary">
          If an account exists for {email}, we&apos;ve sent instructions to
          reset your password.
        </p>
        {error ? (
          <p
            role="alert"
            data-tone="error"
            className="status-alert"
          >
            {error}
          </p>
        ) : null}
        <p className="pt-2 text-sm text-text-tertiary">Didn&apos;t receive it?</p>
        <button
          type="button"
          onClick={send}
          disabled={submitting || cooldown > 0}
          className="premium-button-secondary focus-ring w-full disabled:opacity-60"
        >
          {submitting
            ? "Sending…"
            : cooldown > 0
              ? `Resend email (${cooldown}s)`
              : "Resend email"}
        </button>
        <Link
          href="/login"
          className="premium-button focus-ring w-full"
        >
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
      {error ? (
        <p
          role="alert"
          data-tone="error"
          className="status-alert"
        >
          {error}
        </p>
      ) : null}

      <Input
        id="forgot-email"
        label="Email address"
        type="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        icon={<Mail className="size-[18px]" />}
      />

      <Button type="submit" isLoading={submitting} className="w-full">
        {submitting ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-text-tertiary">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold link-accent">
          Log in
        </Link>
      </p>
    </form>
  );
}
