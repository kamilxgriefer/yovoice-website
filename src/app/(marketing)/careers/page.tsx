import type { Metadata } from "next";
import { Mail } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Careers",
  description: "There are no open roles at YO Voice right now — but we'd still like to hear from you.",
};

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="No open roles right now"
        description="YO Voice is a small team shipping fast. We're not actively hiring today, but that changes as the product grows — and we'd rather hear from good people early than post a job listing late."
      />
      <section className="px-5 pb-28 sm:px-8">
        <div className="glass-panel mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-[32px] p-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
            <Mail className="size-6" />
          </div>
          <h2 className="text-2xl font-bold">Want to be first in line?</h2>
          <p className="max-w-xl text-sm leading-7 text-white/50">
            Send us a note at{" "}
            <strong className="text-white">careers@yovoice.app</strong> with
            what you do and why YO Voice interests you. We keep every message
            and reach out when a role fits.
          </p>
          <a
            href="mailto:careers@yovoice.app?subject=Interested in YO Voice"
            className="premium-button focus-ring mt-2 min-h-12 px-6 text-sm"
          >
            Email careers@yovoice.app
          </a>
        </div>
      </section>
    </>
  );
}
