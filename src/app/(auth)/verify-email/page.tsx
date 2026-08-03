"use client";

import { useState } from "react";
import Link from "next/link";

import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuth } from "@/hooks/use-auth";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

export default function VerifyEmailPage() {
  const { user, loading } = useRequireAuth();
  const { resendVerificationEmail } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleResend() {
    setError(null);
    setSending(true);
    try {
      await resendVerificationEmail();
      setSent(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (loading || !user) {
    return (
      <p className="mt-8 text-center text-sm text-white/45">Loading…</p>
    );
  }

  if (user.emailVerified) {
    return (
      <>
        <h1 className="mt-8 text-center text-3xl font-bold">You&apos;re verified</h1>
        <p className="mt-2 text-center text-sm text-white/45">
          {user.email} is confirmed.
        </p>
        <Link href="/" className="premium-button min-h-13 mt-8 flex w-full items-center justify-center">
          Continue
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="mt-8 text-center text-3xl font-bold">Verify your email</h1>
      <p className="mt-2 text-center text-sm text-white/45">
        We sent a confirmation link to {user.email}. Open it to verify your account.
      </p>

      {error ? (
        <p role="alert" className="mt-6 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}
      {sent ? (
        <p className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-200">
          Verification email sent.
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleResend}
        disabled={sending}
        className="premium-button min-h-13 mt-8 w-full disabled:opacity-60"
      >
        {sending ? "Sending…" : "Resend email"}
      </button>

      <Link href="/" className="mt-6 block text-center text-sm text-fuchsia-300 hover:text-white">
        Return to homepage
      </Link>
    </>
  );
}
