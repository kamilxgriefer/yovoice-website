"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ActionCodeOperation,
  applyActionCode,
  checkActionCode,
} from "firebase/auth";

import {
  ErrorGlyph,
  LoadingSpinner,
  SuccessCheckmark,
} from "@/components/auth/action-glyphs";
import { Button } from "@/components/ui/button";
import { getFirebaseAuth } from "@/lib/firebase/config";

type Phase =
  | { name: "checking" }
  | { name: "ready" }
  | { name: "applying" }
  | { name: "success" }
  | { name: "failed"; expired: boolean };

/**
 * Security recovery for Firebase's revertSecondFactorAddition email action.
 *
 * Checking a code is deliberately separate from applying it. Mail scanners
 * and link-preview bots frequently open links, and must not be able to remove
 * a legitimate authenticator merely by fetching this page.
 */
export default function RevertSecondFactorPage() {
  return (
    <Suspense
      fallback={<p className="mt-8 text-center text-sm text-white/45">Loading…</p>}
    >
      <RevertSecondFactorContent />
    </Suspense>
  );
}

function RevertSecondFactorContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  if (!oobCode) {
    return <InvalidLink expired={false} incomplete />;
  }

  return <RevertSecondFactorFlow oobCode={oobCode} />;
}

function RevertSecondFactorFlow({ oobCode }: { oobCode: string }) {
  const [phase, setPhase] = useState<Phase>({ name: "checking" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const info = await checkActionCode(getFirebaseAuth(), oobCode);
        if (
          info.operation !==
          ActionCodeOperation.REVERT_SECOND_FACTOR_ADDITION
        ) {
          throw new Error("Unexpected action-code operation.");
        }
        if (!cancelled) setPhase({ name: "ready" });
      } catch (error) {
        if (cancelled) return;
        const code = (error as { code?: string } | null)?.code;
        setPhase({
          name: "failed",
          expired: code === "auth/expired-action-code",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [oobCode]);

  async function removeAuthenticator() {
    if (phase.name !== "ready") return;
    setPhase({ name: "applying" });
    try {
      await applyActionCode(getFirebaseAuth(), oobCode);
      setPhase({ name: "success" });
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      setPhase({
        name: "failed",
        expired: code === "auth/expired-action-code",
      });
    }
  }

  switch (phase.name) {
    case "checking":
      return (
        <>
          <LoadingSpinner />
          <p className="mt-6 text-center text-sm text-white/45">
            Checking your security link…
          </p>
        </>
      );

    case "ready":
    case "applying":
      return (
        <>
          <ErrorGlyph />
          <h1 className="mt-6 text-center text-3xl font-bold">
            Wasn&apos;t this you?
          </h1>
          <p className="mt-2 text-center text-sm text-white/45">
            A new authenticator was added to your YO Voice account. If you
            don&apos;t recognize it, remove it now. If you added it yourself,
            you can safely close this page.
          </p>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            isLoading={phase.name === "applying"}
            disabled={phase.name === "applying"}
            onClick={removeAuthenticator}
            className="mt-8 w-full border-rose-400/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
          >
            {phase.name === "applying"
              ? "Removing…"
              : "Remove this authenticator"}
          </Button>
          <Link
            href="/login"
            className="mt-6 block text-center text-sm text-fuchsia-300 hover:text-white"
          >
            Keep it and go to log in
          </Link>
        </>
      );

    case "success":
      return (
        <>
          <SuccessCheckmark label="Authenticator removed" />
          <h1 className="mt-6 text-center text-3xl font-bold">
            Authenticator removed
          </h1>
          <p className="mt-2 text-center text-sm text-white/45">
            The recently added authenticator can no longer access your
            account. If this wasn&apos;t you, reset your password as well.
          </p>
          <Link
            href="/forgot-password"
            className="premium-button min-h-13 mt-8 flex w-full items-center justify-center"
          >
            Reset my password
          </Link>
          <Link
            href="/login"
            className="mt-6 block text-center text-sm text-fuchsia-300 hover:text-white"
          >
            Back to log in
          </Link>
        </>
      );

    case "failed":
      return <InvalidLink expired={phase.expired} />;
  }
}

function InvalidLink({
  expired,
  incomplete = false,
}: {
  expired: boolean;
  incomplete?: boolean;
}) {
  const title = incomplete
    ? "That link is incomplete"
    : expired
      ? "This link has expired"
      : "This link is no longer valid";

  return (
    <>
      <ErrorGlyph />
      <h1 className="mt-6 text-center text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-center text-sm text-white/45">
        Review your account security, or contact support if an authenticator
        you don&apos;t recognize is still attached to your account.
      </p>
      <Link
        href="/contact"
        className="premium-button min-h-13 mt-8 flex w-full items-center justify-center"
      >
        Contact support
      </Link>
      <Link
        href="/login"
        className="mt-6 block text-center text-sm text-fuchsia-300 hover:text-white"
      >
        Back to log in
      </Link>
    </>
  );
}
