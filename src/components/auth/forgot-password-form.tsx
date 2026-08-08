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
          className="mx-auto flex size-16 items-center justify-center rounded-full border border-fuchsia-300/25 bg-fuchsia-500/10 text-2xl"
        >
          ✉
        </div>
        <h2 className="text-xl font-bold">Check your inbox</h2>
        <p className="text-sm text-white/45">
          If an account exists for {email}, we&apos;ve sent instructions to
          reset your password.
        </p>
        {error ? (
          <p
            role="alert"
            className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          >
            {error}
          </p>
        ) : null}
        <p className="pt-2 text-sm text-white/45">Didn&apos;t receive it?</p>
        <button
          type="button"
          onClick={send}
          disabled={submitting || cooldown > 0}
          className="min-h-13 w-full rounded-2xl border border-white/10 bg-white/[.04] text-sm font-semibold text-white/80 transition hover:bg-white/[.08] disabled:opacity-60"
        >
          {submitting
            ? "Sending…"
            : cooldown > 0
              ? `Resend email (${cooldown}s)`
              : "Resend email"}
        </button>
        <Link
          href="/login"
          className="premium-button min-h-13 inline-flex w-full items-center justify-center"
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
          className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          {error}
        </p>
      ) : null}

      <div>
        <label htmlFor="forgot-email" className="sr-only">
          Email address
        </label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          icon={<Mail className="size-[18px]" />}
        />
      </div>

      <Button type="submit" size="lg" isLoading={submitting} className="w-full">
        {submitting ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-white/45">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-fuchsia-300 hover:text-white">
          Log in
        </Link>
      </p>
    </form>
  );
}
