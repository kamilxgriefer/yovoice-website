import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PremiumRing } from "@/components/premium/premium-ring";
import { premiumShowcaseBenefits } from "@/config/premium";

/**
 * The homepage Premium SHOWCASE. Its one job is selling the idea —
 * identity, Creator, Clubs — and handing off to /premium, which sells
 * the plan. Deliberately contains no prices, no comparison table, no
 * billing detail (that was the first version of this section, and it
 * read like a SaaS pricing block dropped mid-page).
 */
export function PremiumSection() {
  return (
    <section
      id="premium"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#0b0712] py-16 sm:py-32"
    >
      {/* Elevated lighting: a touch more deliberate than the standard
          sections, still restrained — no gold, no crowns. */}
      <div className="absolute left-1/2 top-[-30%] size-[640px] -translate-x-1/2 rounded-full bg-violet-700/20 blur-[170px]" />
      <div className="absolute bottom-[-40%] right-[-10%] size-[480px] rounded-full bg-fuchsia-700/10 blur-[160px]" />

      <div className="relative mx-auto w-full max-w-[1100px] px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-fuchsia-400">
              YO Voice Premium
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.05em] text-white sm:mt-6 sm:text-6xl">
              More room <span className="text-gradient">for your voice.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/50 sm:mt-6 sm:text-base sm:leading-8">
              Everything essential stays free. Premium adds the ways you
              create and stand out — become a Creator, build your own Clubs,
              and carry a premium identity across YO Voice.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link
                href="/premium"
                className="premium-button focus-ring min-h-13 inline-flex w-full items-center justify-center gap-2 px-8 sm:w-auto"
              >
                Check plans
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/premium#included"
                className="focus-ring inline-flex min-h-13 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white/60 transition hover:text-white"
              >
                Learn more
              </Link>
            </div>
          </div>

          {/* Identity preview: the actual premium ring around the brand
              mark — the same treatment a member's avatar gets in the app. */}
          <div className="flex justify-center lg:justify-end">
            <div className="glass-panel w-full max-w-[380px] rounded-[32px] p-8">
              <div className="flex items-center gap-5">
                <PremiumRing size={84}>
                  <Image
                    src="/logos/yovoice-logo.png"
                    alt=""
                    width={52}
                    height={52}
                    className="object-contain"
                  />
                </PremiumRing>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
                    Your name here
                  </p>
                  <p className="text-sm text-fuchsia-300">Creator</p>
                  <p className="mt-0.5 text-xs text-white/40">
                    Premium identity, everywhere you speak
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-4 border-t border-white/[0.07] pt-6">
                {premiumShowcaseBenefits.map((benefit) => (
                  <div key={benefit.title}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-400/80">
                      {benefit.kicker}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      {benefit.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-white/45">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
