import { Mail } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Careers",
  description: "There are no open roles at YO Voice right now — but we'd still like to hear from you.",
  path: "/careers",
});

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="No open roles right now"
        description="YO Voice is a small team shipping fast. We're not actively hiring today, but that changes as the product grows — and we'd rather hear from good people early than post a job listing late."
      />
      <section className="px-5 pb-28 sm:px-8">
        <div className="panel mx-auto flex max-w-3xl flex-col items-center gap-5 p-8 text-center sm:p-10">
          <div className="icon-tile">
            <Mail className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Want to be first in line?</h2>
          <p className="max-w-xl text-base leading-[1.6] text-[var(--text-secondary)]">
            Send us a note at{" "}
            <strong className="text-[var(--foreground)]">careers@yovoice.app</strong> with
            what you do and why YO Voice interests you. We keep every message
            and reach out when a role fits.
          </p>
          <a
            href="mailto:careers@yovoice.app?subject=Interested in YO Voice"
            className="premium-button focus-ring mt-2"
          >
            Email careers@yovoice.app
          </a>
        </div>
      </section>
    </>
  );
}
