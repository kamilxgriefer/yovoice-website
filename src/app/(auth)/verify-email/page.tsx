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
// A courtesy auto-continue for anyone who doesn't click — the "Open App"
// button is the real affordance (immediately visible, immediately
// clickable), this is just a fallback for people who walk away from the
// screen assuming it "just works."
const AUTO_OPEN_APP_DELAY_MS = 6000;

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

  if (state === "applying") {
    return (
      <>
        <LoadingSpinner />
        <p className="mt-6 text-center text-sm text-white/45">
          Confirming your email…
        </p>
      </>
    );
  }

  if (state === "error") {
    return (
      <>
        <ErrorGlyph />
        <h1 className="mt-6 text-center text-3xl font-bold">
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

  return <VerifiedSuccess email={getFirebaseAuth().currentUser?.email ?? null} />;
}

function VerifyEmailPrompt() {
  const { user, loading } = useRequireAuth();
  const { resendVerificationEmail, reloadUser } = useAuth();

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
  // landing back here. This is also what makes "already verified? skip
  // straight to the success screen" work.
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
    return (
      <>
        <LoadingSpinner />
        <p className="mt-6 text-center text-sm text-white/45">Loading…</p>
      </>
    );
  }

  if (verified) {
    return <VerifiedSuccess email={user.email} />;
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

/**
 * Shared by both the direct-link (ActionCodeHandler) and prompt-page
 * (VerifyEmailPrompt) success paths, so a verified account looks the same
 * regardless of how it got there. `getAppUrl()` reads NEXT_PUBLIC_APP_URL,
 * currently the production Flutter web build
 * (https://yovoice-ec54a.web.app) — switching to https://app.yovoice.app
 * once its DNS is live is a Vercel env var change, not a code change.
 */
function VerifiedSuccess({ email }: { email: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [autoOpened, setAutoOpened] = useState(false);

  function openApp() {
    if (autoOpened) return;
    setAutoOpened(true);
    const redirectParam = searchParams.get("redirect");
    const destination =
      redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
        ? redirectParam
        : getAppUrl();
    if (destination.startsWith("http")) {
      window.location.href = destination;
    } else {
      router.push(destination);
    }
  }

  useEffect(() => {
    const timer = setTimeout(openApp, AUTO_OPEN_APP_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SuccessCheckmark />
      <h1 className="mt-6 text-center text-3xl font-bold">You&apos;re verified</h1>
      <p className="mt-2 text-center text-sm text-white/45">
        {email ? `${email} is confirmed.` : "Your email is confirmed."}{" "}
        You&apos;re all set.
      </p>

      <button
        type="button"
        onClick={openApp}
        className="premium-button min-h-13 mt-8 w-full"
      >
        Open YO Voice
      </button>

      <Link
        href="/account/profile"
        className="mt-6 block text-center text-sm text-fuchsia-300 hover:text-white"
      >
        Go to your account instead
      </Link>
    </>
  );
}

function SuccessCheckmark() {
  return (
    <div className="mx-auto flex size-20 items-center justify-center">
      <svg
        viewBox="0 0 80 80"
        fill="none"
        className="size-20"
        role="img"
        aria-label="Verified"
      >
        <circle
          cx="40"
          cy="40"
          r="36"
          className="origin-center animate-[verify-pop_0.4s_ease-out]"
          stroke="url(#verify-ring)"
          strokeWidth="3"
        />
        <path
          d="M24 41 L35 52 L57 29"
          fill="none"
          stroke="url(#verify-ring)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className="animate-[verify-draw_0.5s_0.25s_ease-out_both]"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1,
          }}
        />
        <defs>
          <linearGradient id="verify-ring" x1="0" y1="0" x2="80" y2="80">
            <stop offset="0%" stopColor="#e879f9" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <style>{`
        @keyframes verify-pop {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes verify-draw {
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          svg circle, svg path { animation: none !important; stroke-dashoffset: 0 !important; }
        }
      `}</style>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="mx-auto mt-4 size-10 animate-spin rounded-full border-2 border-white/10 border-t-fuchsia-400" />
  );
}

function ErrorGlyph() {
  return (
    <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-rose-500/10">
      <svg viewBox="0 0 24 24" fill="none" className="size-9" aria-hidden="true">
        <path
          d="M12 8v5m0 3.5h.01M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.29 2.25h17.78A1.5 1.5 0 0 0 22.18 18L13.71 3.86a1.5 1.5 0 0 0-2.6 0Z"
          stroke="#fb7185"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
