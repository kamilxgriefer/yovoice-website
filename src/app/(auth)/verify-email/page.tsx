"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode } from "firebase/auth";

import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuth } from "@/hooks/use-auth";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { getFirebaseAuth } from "@/lib/firebase/config";
import { getAppUrl } from "@/lib/auth/auth-redirect";

const RESEND_COOLDOWN_SECONDS = 60;
const AUTO_CHECK_INTERVAL_MS = 5000;

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={<p className="mt-8 text-center text-sm text-white/45">Loading…</p>}
    >
      <VerifyEmailPageContent />
    </Suspense>
  );
}

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  // A verification link lands here with mode=verifyEmail&oobCode=... — that
  // has to work even in a browser where nobody is currently signed in (the
  // link may be opened on a different device than the one that registered),
  // so this branch runs independently of useRequireAuth().
  if (oobCode && mode === "verifyEmail") {
    return <ActionCodeHandler oobCode={oobCode} />;
  }

  return <VerifyEmailPrompt />;
}

function ActionCodeHandler({ oobCode }: { oobCode: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"applying" | "success" | "error">(
    "applying",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const auth = getFirebaseAuth();
      try {
        await applyActionCode(auth, oobCode);
        // applyActionCode already updated the account server-side; reload
        // only matters if this same browser also happens to be signed in
        // as that account, so the rest of the app picks up emailVerified
        // without a hard refresh.
        if (auth.currentUser) {
          await auth.currentUser.reload();
        }
        if (!cancelled) setState("success");
      } catch (err) {
        if (!cancelled) {
          setError(getAuthErrorMessage(err));
          setState("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [oobCode]);

  useEffect(() => {
    if (state !== "success") return;
    const redirectParam = searchParams.get("redirect");
    const destination =
      redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
        ? redirectParam
        : getFirebaseAuth().currentUser
          ? "/account/profile"
          : "/login";
    const timer = setTimeout(() => {
      if (destination.startsWith("http")) {
        window.location.href = destination;
      } else {
        router.push(destination);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [state, router, searchParams]);

  if (state === "applying") {
    return (
      <p className="mt-8 text-center text-sm text-white/45">
        Confirming your email…
      </p>
    );
  }

  if (state === "error") {
    return (
      <>
        <h1 className="mt-8 text-center text-3xl font-bold">
          Link no longer valid
        </h1>
        <p className="mt-2 text-center text-sm text-white/45">{error}</p>
        <Link
          href="/verify-email"
          className="premium-button min-h-13 mt-8 flex w-full items-center justify-center"
        >
          Request a new link
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="mt-8 text-center text-3xl font-bold">Email verified</h1>
      <p className="mt-2 text-center text-sm text-white/45">
        Taking you back now…
      </p>
    </>
  );
}

function VerifyEmailPrompt() {
  const { user, loading } = useRequireAuth();
  const { resendVerificationEmail, reloadUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reload once on arrival — `user` from context can be stale if the
  // account was verified in another tab (or on another device) before
  // landing back here.
  useEffect(() => {
    if (!user) return;
    reloadUser().then(setVerified);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user || verified) return;
    autoCheckIntervalRef.current = setInterval(async () => {
      const isVerified = await reloadUser();
      if (isVerified) setVerified(true);
    }, AUTO_CHECK_INTERVAL_MS);
    return () => {
      if (autoCheckIntervalRef.current) clearInterval(autoCheckIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, verified]);

  useEffect(() => {
    if (!verified) return;
    const redirectParam = searchParams.get("redirect");
    const destination =
      redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
        ? redirectParam
        : getAppUrl();
    const timer = setTimeout(() => {
      if (destination.startsWith("http")) {
        window.location.href = destination;
      } else {
        router.push(destination);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [verified, router, searchParams]);

  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
      if (autoCheckIntervalRef.current) clearInterval(autoCheckIntervalRef.current);
    };
  }, []);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    cooldownIntervalRef.current = setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }

  async function handleResend() {
    if (sending || cooldown > 0) return;
    setSendError(null);
    setSending(true);
    try {
      await resendVerificationEmail();
      setSent(true);
      startCooldown();
    } catch (err) {
      setSendError(getAuthErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  async function handleCheckNow() {
    if (checking) return;
    setChecking(true);
    try {
      const isVerified = await reloadUser();
      setVerified(isVerified);
    } finally {
      setChecking(false);
    }
  }

  if (loading || !user) {
    return <p className="mt-8 text-center text-sm text-white/45">Loading…</p>;
  }

  if (verified) {
    return (
      <>
        <h1 className="mt-8 text-center text-3xl font-bold">You&apos;re verified</h1>
        <p className="mt-2 text-center text-sm text-white/45">
          {user.email} is confirmed. Taking you onward…
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="mt-8 text-center text-3xl font-bold">Verify your email</h1>
      <p className="mt-2 text-center text-sm text-white/45">
        We sent a confirmation link to {user.email}. Open it to verify your
        account.
      </p>

      {sendError ? (
        <p
          role="alert"
          className="mt-6 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          {sendError}
        </p>
      ) : null}
      {sent && !sendError ? (
        <p className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-200">
          Verification email sent.
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleResend}
        disabled={sending || cooldown > 0}
        className="premium-button min-h-13 mt-8 w-full disabled:opacity-60"
      >
        {sending
          ? "Sending…"
          : cooldown > 0
            ? `Resend email (${cooldown}s)`
            : "Resend email"}
      </button>

      <button
        type="button"
        onClick={handleCheckNow}
        disabled={checking}
        className="mt-3 min-h-13 w-full rounded-2xl border border-white/10 bg-white/[.04] text-sm font-semibold text-white/80 transition hover:bg-white/[.08] disabled:opacity-60"
      >
        {checking ? "Checking…" : "I have verified my email"}
      </button>

      <Link href="/" className="mt-6 block text-center text-sm text-fuchsia-300 hover:text-white">
        Return to homepage
      </Link>
    </>
  );
}
