"use client";

import { Suspense, useEffect, useEffectEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode } from "firebase/auth";

import {
  ErrorGlyph,
  LoadingSpinner,
  SuccessCheckmark,
} from "@/components/auth/action-glyphs";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuth } from "@/hooks/use-auth";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { getFirebaseAuth } from "@/lib/firebase/config";
import { resolveAuthRedirect } from "@/lib/auth/auth-redirect";
import {
  verificationSendState,
  verifyEmailPathWithoutSendState,
} from "@/lib/auth/registration-flow";
import {
  startVerificationAutoCheck,
  type VerificationAutoCheckEnvironment,
} from "@/lib/auth/verification-auto-check";

const RESEND_COOLDOWN_SECONDS = 60;
// A courtesy auto-continue for anyone who doesn't click — the "Open App"
// button is the real affordance (immediately visible, immediately
// clickable), this is just a fallback for people who walk away from the
// screen assuming it "just works."
const AUTO_OPEN_APP_DELAY_MS = 6000;

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={<p className="mt-8 text-center text-sm text-text-tertiary">Loading…</p>}
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
        <p className="mt-6 text-center text-sm text-text-tertiary">
          Confirming your email…
        </p>
      </>
    );
  }

  if (state === "error") {
    return (
      <>
        <ErrorGlyph />
        <h1 className="mt-6 text-center text-[28px] font-extrabold leading-tight tracking-[-.02em]">
          Link no longer valid
        </h1>
        <p className="mt-2 text-center text-sm text-text-tertiary">{error}</p>
        <Link
          href="/verify-email"
          className="premium-button mt-8 w-full"
        >
          Request a new link
        </Link>
      </>
    );
  }

  return <VerifiedSuccess email={getFirebaseAuth().currentUser?.email ?? null} />;
}

function browserAutoCheckEnvironment(): VerificationAutoCheckEnvironment<number> {
  return {
    isVisible: () => document.visibilityState === "visible",
    onVisibilityChange: (listener) => {
      document.addEventListener("visibilitychange", listener);
      return () => document.removeEventListener("visibilitychange", listener);
    },
    setTimer: (callback, delayMs) => window.setTimeout(callback, delayMs),
    clearTimer: (handle) => window.clearTimeout(handle),
    now: () => Date.now(),
  };
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
  const resendButtonRef = useRef<HTMLButtonElement>(null);
  const failedSendFocusedRef = useRef(false);

  // "failed" only when the sign-up just reported that the email was not
  // sent; this page never claims a send it has no evidence for.
  const sendState = verificationSendState({
    searchParams,
    resentFromThisPage: sent,
  });
  const showsPrompt = !loading && Boolean(user) && !verified;

  // Checks whether the account has been verified (in another tab, or on
  // another device): once on arrival, then on a bounded backoff while this
  // tab is visible. reloadUser() replaces the context `user` object on every
  // call, so the schedule is keyed on the account id, not on `user`;
  // depending on `user` re-ran the check after every reload in a tight loop.
  const uid = user?.uid ?? null;
  const checkVerified = useEffectEvent(() => reloadUser());
  useEffect(() => {
    if (!uid || verified) return;
    return startVerificationAutoCheck({
      check: () => checkVerified(),
      onVerified: () => setVerified(true),
      environment: browserAutoCheckEnvironment(),
    });
  }, [uid, verified]);

  // After a failed send, put keyboard focus on the way to fix it.
  useEffect(() => {
    if (sendState !== "failed" || !showsPrompt || failedSendFocusedRef.current) return;
    failedSendFocusedRef.current = true;
    resendButtonRef.current?.focus();
  }, [sendState, showsPrompt]);

  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
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
      if (sendState === "failed") {
        // The failure report is no longer true; keep a reload from showing it.
        router.replace(verifyEmailPathWithoutSendState(searchParams), {
          scroll: false,
        });
      }
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
        <p className="mt-6 text-center text-sm text-text-tertiary">Loading…</p>
      </>
    );
  }

  if (verified) {
    return <VerifiedSuccess email={user.email} />;
  }

  return (
    <>
      <h1 className="mt-8 text-center text-[28px] font-extrabold leading-tight tracking-[-.02em]">Verify your email</h1>
      {sendState === "failed" ? (
        <div
          role="alert"
          data-tone="error"
          className="status-alert mt-6"
        >
          <p className="font-semibold">The confirmation email was not sent.</p>
          <p className="mt-1">
            Your account for {user.email} was created, but we couldn&apos;t
            send its confirmation link. Use Resend email below to try again.
          </p>
        </div>
      ) : (
        <p className="mt-2 text-center text-sm text-text-tertiary">
          We sent a confirmation link to {user.email}. Open it to verify your
          account.
        </p>
      )}

      {sendError ? (
        <p
          role="alert"
          data-tone="error"
          className="status-alert mt-6"
        >
          {sendError}
        </p>
      ) : null}
      {sent && !sendError ? (
        <p data-tone="success" className="status-alert mt-6">
          Verification email sent.
        </p>
      ) : null}

      <button
        ref={resendButtonRef}
        type="button"
        onClick={handleResend}
        disabled={sending || cooldown > 0}
        className="premium-button mt-8 w-full disabled:opacity-60"
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
        className="premium-button-secondary focus-ring mt-3 w-full disabled:opacity-60"
      >
        {checking ? "Checking…" : "I have verified my email"}
      </button>

      <Link href="/" className="mt-6 block text-center text-sm link-accent">
        Return to homepage
      </Link>
    </>
  );
}

/**
 * Shared by both the direct-link (ActionCodeHandler) and prompt-page
 * (VerifyEmailPrompt) success paths, so a verified account looks the same
 * regardless of how it got there. With no ?redirect, this lands on the /app
 * launch route, which plays the entry transition and then hands off to
 * the canonical Flutter web origin at https://app.yovoice.app. The launch
 * route also normalizes legacy Firebase Hosting origins to that domain.
 */
function VerifiedSuccess({ email }: { email: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [autoOpened, setAutoOpened] = useState(false);

  function openApp() {
    if (autoOpened) return;
    setAutoOpened(true);
    // replace: the verification link has been consumed, so Back should skip
    // this screen rather than re-running a code that no longer works.
    router.replace(resolveAuthRedirect(searchParams.get("redirect")));
  }

  useEffect(() => {
    const timer = setTimeout(openApp, AUTO_OPEN_APP_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SuccessCheckmark label="Verified" />
      <h1 className="mt-6 text-center text-[28px] font-extrabold leading-tight tracking-[-.02em]">You&apos;re verified</h1>
      <p className="mt-2 text-center text-sm text-text-tertiary">
        {email ? `${email} is confirmed.` : "Your email is confirmed."}{" "}
        You&apos;re all set.
      </p>

      <button
        type="button"
        onClick={openApp}
        className="premium-button mt-8 w-full"
      >
        Open YO Voice
      </button>

      <Link
        href="/account/profile"
        className="mt-6 block text-center text-sm link-accent"
      >
        Go to your account instead
      </Link>
    </>
  );
}

// SuccessCheckmark / LoadingSpinner / ErrorGlyph moved to
// components/auth/action-glyphs.tsx, shared with reset-password and
// recover-email so every action flow has identical status visuals.
