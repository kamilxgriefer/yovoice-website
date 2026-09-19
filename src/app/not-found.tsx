import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SiteHeader />
      {/* pt matches --header-height: the header is fixed, so every page pays
          for it in padding. */}
      <main id="main-content" className="flex min-h-[80vh] flex-col items-center justify-center px-5 pt-14 text-center">
        <div className="flex size-16 items-center justify-center rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
          <Compass className="size-8" aria-hidden="true" />
        </div>
        <p className="eyebrow mt-8">404</p>
        <h1 className="section-title">
          This place doesn&apos;t exist.
        </h1>
        <p className="section-copy mx-auto max-w-md">
          The page you&apos;re looking for isn&apos;t here — it may have moved,
          or the link might be wrong.
        </p>
        <Link href="/" className="premium-button focus-ring mt-8">
          Back to homepage <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
