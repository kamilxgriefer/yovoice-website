"use client";

import Link from "next/link";

import { MobileDownload } from "@/components/download/mobile-download";
import { PlatformSelector } from "@/components/download/platform-selector";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function DownloadPage() {
  const isMobile = useIsMobile();
  // Desktop installers are gated behind an account; mobile never is — a
  // phone visitor should see App Store / Google Play status immediately,
  // never a login wall for something they'd get from a store anyway.
  const { user, loading } = useRequireAuth({ skip: isMobile !== false });
  const { reloadUser } = useAuth();

  if (isMobile === null) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-5 pt-20">
        <p className="text-sm text-white/45">Loading…</p>
      </section>
    );
  }

  if (isMobile) {
    return <MobileDownload />;
  }

  if (loading || !user) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-5 pt-20">
        <p className="text-sm text-white/45">Loading…</p>
      </section>
    );
  }

  if (!user.emailVerified) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-5 pb-24 pt-36 text-center sm:px-8">
        <div className="max-w-md">
          <p className="eyebrow">One more step</p>
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-.05em] text-white sm:text-4xl">
            Verify your email to download
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/50">
            We sent a confirmation link to {user.email}. Verify your address
            to unlock installers and your account downloads.
          </p>
          <Link
            href="/verify-email?redirect=/download"
            className="premium-button focus-ring mt-8 inline-flex min-h-12 px-6 text-sm"
            onClick={() => void reloadUser()}
          >
            Go to verification
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-5 pb-24 pt-36 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl text-center">
        <p className="eyebrow">Signed in as {user.email}</p>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-.05em] text-white sm:text-6xl">
          Get YO Voice
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/50">
          The web app is live today. Desktop and mobile installers are on
          the way — track progress on GitHub.
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-5xl">
        <PlatformSelector />
      </div>
    </section>
  );
}
