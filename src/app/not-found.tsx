import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060511]">
      <SiteHeader />
      <main className="flex min-h-[80vh] flex-col items-center justify-center px-5 pt-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-[0_0_40px_rgba(192,38,255,.35)]">
          <Compass className="size-8" />
        </div>
        <p className="eyebrow mt-8">404</p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-.05em] text-white sm:text-5xl">
          This room doesn&apos;t exist.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/50">
          The page you&apos;re looking for isn&apos;t here — it may have moved,
          or the link might be wrong.
        </p>
        <Link href="/" className="premium-button focus-ring mt-8 inline-flex min-h-12 px-6 text-sm">
          Back to homepage <ArrowRight className="size-4" />
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
