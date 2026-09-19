"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { applyActionCode, checkActionCode } from "firebase/auth";

import {
  ErrorGlyph,
  LoadingSpinner,
  SuccessCheckmark,
} from "@/components/auth/action-glyphs";
import { getFirebaseAuth } from "@/lib/firebase/config";

/**
 * Handles the two email-change action modes the /auth/action dispatcher
 * routes here:
 *
 * - `recoverEmail` — sent to the OLD address after an account email
 *   change, so the original owner can revert it. This is a security
 *   escape hatch: if someone hijacked the account and changed its email,
 *   this link is the real owner's way back, which is why the success copy
 *   pushes a password reset next.
 * - `verifyAndChangeEmail` — sent to the NEW address to confirm the
 *   change.
 *
 * Both are applyActionCode flows; checkActionCode first lets us show which
 * address is involved (from Firebase, never from the URL).
 */
export default function RecoverEmailPage() {
  return (
    <Suspense
      fallback={<p className="mt-8 text-center text-sm text-text-tertiary">Loading…</p>}
    >
      <RecoverEmailContent />
    </Suspense>
  );
}

type Phase =
  | { name: "working" }
  | { name: "recovered"; email: string | null }
  | { name: "changed"; email: string | null }
  | { name: "failed"; expired: boolean };

function RecoverEmailContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  const [phase, setPhase] = useState<Phase>({ name: "working" });

  useEffect(() => {
    if (!oobCode) return;
    let cancelled = false;
    (async () => {
      const auth = getFirebaseAuth();
      try {
        const info = await checkActionCode(auth, oobCode);
        const email = info.data.email ?? null;
        await applyActionCode(auth, oobCode);
        if (cancelled) return;
        setPhase(
          mode === "verifyAndChangeEmail"
            ? { name: "changed", email }
            : { name: "recovered", email },
        );
      } catch (error) {
        if (cancelled) return;
        const code = (error as { code?: string } | null)?.code;
        setPhase({ name: "failed", expired: code === "auth/expired-action-code" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [oobCode, mode]);

  if (!oobCode) {
    return (
      <>
        <ErrorGlyph />
        <h1 className="mt-6 text-center text-[28px] font-extrabold leading-tight tracking-[-.02em]">
          That link is incomplete
        </h1>
        <p className="mt-2 text-center text-sm text-text-tertiary">
          Open the link from your email again, or contact support if this
          keeps happening.
        </p>
        <Link
          href="/login"
          className="premium-button mt-8 w-full"
        >
          Back to log in
        </Link>
      </>
    );
  }

  switch (phase.name) {
    case "working":
      return (
        <>
          <LoadingSpinner />
          <p className="mt-6 text-center text-sm text-text-tertiary">
            Confirming your request…
          </p>
        </>
      );

    case "failed":
      return (
        <>
          <ErrorGlyph />
          <h1 className="mt-6 text-center text-[28px] font-extrabold leading-tight tracking-[-.02em]">
            {phase.expired ? "This link has expired" : "This link is no longer valid"}
          </h1>
          <p className="mt-2 text-center text-sm text-text-tertiary">
            {phase.expired
              ? "For your security these links only work for a limited time. If you still need to undo an email change, contact support."
              : "It may have already been used. If you still need help with your account email, contact support."}
          </p>
          <Link
            href="/contact"
            className="premium-button mt-8 w-full"
          >
            Contact support
          </Link>
          <Link
            href="/login"
            className="mt-6 block text-center text-sm link-accent"
          >
            Back to log in
          </Link>
        </>
      );

    case "changed":
      return (
        <>
          <SuccessCheckmark label="Email updated" />
          <h1 className="mt-6 text-center text-[28px] font-extrabold leading-tight tracking-[-.02em]">Email updated</h1>
          <p className="mt-2 text-center text-sm text-text-tertiary">
            {phase.email
              ? `${phase.email} is now the email for your YO Voice account.`
              : "Your YO Voice account email has been updated."}
          </p>
          <Link
            href="/login"
            className="premium-button mt-8 w-full"
          >
            Continue to YO Voice
          </Link>
        </>
      );

    case "recovered":
      return (
        <>
          <SuccessCheckmark label="Email restored" />
          <h1 className="mt-6 text-center text-[28px] font-extrabold leading-tight tracking-[-.02em]">Email restored</h1>
          <p className="mt-2 text-center text-sm text-text-tertiary">
            {phase.email
              ? `Your account email is back to ${phase.email}.`
              : "Your original account email has been restored."}{" "}
            If you didn&apos;t make the original change, someone else may have
            access to your account — set a new password now.
          </p>
          <Link
            href="/forgot-password"
            className="premium-button mt-8 w-full"
          >
            Reset my password
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
}
