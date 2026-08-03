"use client";

import { PlatformSelector } from "@/components/download/platform-selector";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function DownloadPage() {
  const { user, loading } = useRequireAuth();

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060511]">
        <p className="text-sm text-white/45">Loading…</p>
      </main>
    );
  }

  return (
    <main>
      <SiteHeader />
      <section className="min-h-screen bg-[#060511] px-5 pb-24 pt-36 sm:px-8 lg:px-12">
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
      <SiteFooter />
    </main>
  );
}
