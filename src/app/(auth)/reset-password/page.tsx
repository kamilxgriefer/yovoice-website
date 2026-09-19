"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";

import {
  ErrorGlyph,
  LoadingSpinner,
  SuccessCheckmark,
} from "@/components/auth/action-glyphs";
import {
  MIN_PASSWORD_LENGTH,
  PasswordField,
  PasswordStrengthMeter,
} from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import {
  passwordResetPhaseForError,
  type PasswordResetPhase,
} from "@/lib/auth/password-reset-flow";
import { safeContinueUrl } from "@/lib/auth/safe-continue-url";
import { getFirebaseAuth } from "@/lib/firebase/config";

/**
 * The branded password-reset action page.
 *
 * Reached from the reset email via /auth/action (mode=resetPassword).
 * The oobCode is validated with Firebase before any form is shown —
 * verifyPasswordResetCode both checks the code and returns the account
 * email, which is the only way the email is ever displayed here (never
 * from a query parameter, which anyone could forge). Firebase remains the
 * source of truth for whether the reset actually happened.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<p className="mt-8 text-center text-sm text-text-tertiary">Loading…</p>}
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const continueUrl = safeContinueUrl(searchParams.get("continueUrl"));

  if (!oobCode) {
    // Direct navigation (or a mangled link) — nothing to act on.
    return (
      <>
        <ErrorGlyph />
        <h1 className="mt-6 text-center text-[28px] font-extrabold leading-tight tracking-[-.02em]">
          That link is incomplete
        </h1>
        <p className="mt-2 text-center text-sm text-text-tertiary">
          Open the reset link from your email, or request a new one and
          we&apos;ll send it right over.
        </p>
        <Link
          href="/forgot-password"
          className="premium-button min-h-13 mt-8 flex w-full items-center justify-center"
        >
          Send a new reset link
        </Link>
        <Link
          href="/login"
          className="mt-6 block text-center text-sm link-accent"
        >
          Back to log in
        </Link>
      </>
    );
  }

  return <ResetPasswordFlow oobCode={oobCode} continueUrl={continueUrl} />;
}

function ResetPasswordFlow({
  oobCode,
  continueUrl,
}: {
  oobCode: string;
  continueUrl: string | null;
}) {
  const [phase, setPhase] = useState<PasswordResetPhase>({
    name: "verifying",
  });
  const [verifyAttempt, setVerifyAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const email = await verifyPasswordResetCode(getFirebaseAuth(), oobCode);
        if (!cancelled) setPhase({ name: "ready", email });
      } catch (error) {
        if (cancelled) return;
        setPhase(passwordResetPhaseForError(error));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [oobCode, verifyAttempt]);

  switch (phase.name) {
    case "verifying":
      return (
        <>
          <LoadingSpinner />
          <p className="mt-6 text-center text-sm text-text-tertiary">
            Checking your reset link…
          </p>
        </>
      );

    case "network-error":
      return (
        <>
          <ErrorGlyph />
          <h1 className="mt-6 text-center text-[28px] font-extrabold leading-tight tracking-[-.02em]">
            Connection trouble
          </h1>
          <p className="mt-2 text-center text-sm text-text-tertiary">
            We couldn&apos;t reach YO Voice to check your link. Make sure
            you&apos;re online, then try again.
          </p>
          <button
            type="button"
            onClick={() => {
              // Re-enter the verifying state here (not inside the effect)
              // so the effect body stays free of synchronous setState.
              setPhase({ name: "verifying" });
              setVerifyAttempt((current) => current + 1);
            }}
            className="premium-button min-h-13 mt-8 w-full"
          >
            Try again
          </button>
        </>
      );

    case "link-invalid":
      return (
        <>
          <ErrorGlyph />
          <h1 className="mt-6 text-center text-[28px] font-extrabold leading-tight tracking-[-.02em]">{phase.title}</h1>
          <p className="mt-2 text-center text-sm text-text-tertiary">{phase.body}</p>
          <Link
            href="/forgot-password"
            className="premium-button min-h-13 mt-8 flex w-full items-center justify-center"
          >
            Send a new reset link
          </Link>
          <Link
            href="/login"
            className="mt-6 block text-center text-sm link-accent"
          >
            Back to log in
          </Link>
        </>
      );

    case "success":
      return <ResetSuccess continueUrl={continueUrl} />;

    case "ready":
      return (
        <NewPasswordForm
          oobCode={oobCode}
          email={phase.email}
          onSuccess={() => setPhase({ name: "success" })}
          onLinkInvalid={(next) => setPhase(next)}
        />
      );
  }
}

function NewPasswordForm({
  oobCode,
  email,
  onSuccess,
  onLinkInvalid,
}: {
  oobCode: string;
  email: string;
  onSuccess: () => void;
  onLinkInvalid: (phase: PasswordResetPhase) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const tooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit =
    password.length >= MIN_PASSWORD_LENGTH && password === confirm && !submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      await confirmPasswordReset(getFirebaseAuth(), oobCode, password);
      onSuccess();
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      // The code can die between page load and submit (used in another
      // tab, expired while the form sat open) — those failures belong on
      // the link-level error screen, not squeezed above the form.
      if (
        code === "auth/expired-action-code" ||
        code === "auth/invalid-action-code" ||
        code === "auth/user-disabled" ||
        code === "auth/user-not-found"
      ) {
        onLinkInvalid(passwordResetPhaseForError(error));
        return;
      }
      setSubmitError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="mt-8 text-center text-[28px] font-extrabold leading-tight tracking-[-.02em]">
        Create a new password
      </h1>
      <p className="mt-2 text-center text-sm text-text-tertiary">
        Choose a strong password for{" "}
        <span className="font-semibold text-text-secondary">{email}</span>.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
        {submitError ? (
          <p
            role="alert"
            data-tone="error"
            className="status-alert"
          >
            {submitError}
          </p>
        ) : null}

        <div>
          <PasswordField
            id="new-password"
            label="New password"
            placeholder="New password"
            value={password}
            onChange={setPassword}
            autoFocus
            invalid={tooShort}
            errorMessage={`Use at least ${MIN_PASSWORD_LENGTH} characters.`}
            disabled={submitting}
          />
          <PasswordStrengthMeter password={password} />
          <p className="mt-2 text-xs text-text-tertiary">
            At least {MIN_PASSWORD_LENGTH} characters. Longer passphrases with a
            mix of characters are stronger.
          </p>
        </div>

        <PasswordField
          id="confirm-new-password"
          label="Confirm new password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          invalid={mismatch}
          errorMessage="Passwords don't match yet."
          disabled={submitting}
        />

        <Button
          type="submit"
          size="lg"
          isLoading={submitting}
          disabled={!canSubmit}
          className="w-full disabled:opacity-60"
        >
          {submitting ? "Updating…" : "Update password"}
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-6 block text-center text-sm link-accent"
      >
        Back to log in
      </Link>
    </>
  );
}

/**
 * Firebase revokes the account's sessions when a password is reset, so the
 * honest next step is logging in with the new password — "Continue to
 * YO Voice" routes through /login. A validated continueUrl (if the email
 * flow carried one) is offered as the secondary destination afterward.
 */
function ResetSuccess({ continueUrl }: { continueUrl: string | null }) {
  return (
    <>
      <SuccessCheckmark label="Password updated" />
      <h1 className="mt-6 text-center text-[28px] font-extrabold leading-tight tracking-[-.02em]">Password updated</h1>
      <p className="mt-2 text-center text-sm text-text-tertiary">
        Your YO Voice password has been changed successfully. Log in with
        your new password to continue.
      </p>

      <Link
        href="/login"
        className="premium-button min-h-13 mt-8 flex w-full items-center justify-center"
      >
        Continue to YO Voice
      </Link>

      {continueUrl ? (
        <a
          href={continueUrl}
          className="mt-6 block text-center text-sm link-accent"
        >
          Take me back to where I was
        </a>
      ) : null}
    </>
  );
}
