import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Crown, Mic, Sparkles, Users } from "lucide-react";

import { PremiumBadge } from "@/components/premium/premium-badge";
import { PremiumRing } from "@/components/premium/premium-ring";
import { premiumShowcaseBenefits } from "@/config/premium";

const benefitIcons = [
  { Icon: Mic, className: "text-[#d3a5ff]" },
  { Icon: Crown, className: "text-[#ffc24d]" },
  { Icon: Sparkles, className: "text-[#e879f9]" },
];

/**
 * The homepage Premium SHOWCASE — the website rendition of the app's
 * Premium presentation (board screen 3). Its one job is selling the
 * idea — identity, Creator, Clubs — and handing off to /premium, which
 * sells the plan. Deliberately contains no prices, no comparison table,
 * no billing detail.
 */
export function PremiumSection() {
  return (
    <section
      id="premium"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#0b0712] py-16 sm:py-32"
    >
      {/* Elevated lighting: a touch more deliberate than the standard
          sections, still restrained. */}
      <div className="absolute left-1/2 top-[-30%] size-[640px] -translate-x-1/2 rounded-full bg-violet-700/20 blur-[170px]" />
      <div className="absolute bottom-[-40%] right-[-10%] size-[480px] rounded-full bg-fuchsia-700/10 blur-[160px]" />

      <div className="relative mx-auto w-full max-w-[1100px] px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <PremiumBadge />
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.05em] text-white sm:mt-6 sm:text-6xl">
              More room <span className="text-gradient">for your voice.</span>
            </h2>
            <p className="mt-4 text-base font-semibold text-white/70 sm:mt-5 sm:text-lg">
              Create. Lead. Build communities. Stand out.
            </p>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-white/50 sm:text-base sm:leading-8">
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

          {/* Identity hero: the actual premium ring — the same treatment a
              member's avatar gets in the app — with the capability pills
              from the presentation design. */}
          <div className="flex justify-center">
            <div className="relative h-[300px] w-[340px]">
              {/* Presentation-strength bloom behind the ring. */}
              <div className="absolute left-1/2 top-1/2 size-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-600/30 blur-[70px]" />
              <div className="absolute left-1/2 top-1/2 size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/25 blur-[100px]" />

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <PremiumRing size={190}>
                  <Image
                    src="/logos/yovoice-logo.png"
                    alt=""
                    width={184}
                    height={184}
                    className="size-full object-cover"
                  />
                </PremiumRing>
              </div>

              {/* Crown chip on the ring's top-right diagonal. */}
              <span className="absolute right-[62px] top-[52px] flex size-11 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-[#7b2ff7] to-[#c026ff] shadow-[0_0_16px_rgba(192,38,255,0.5)]">
                <Crown className="size-5 text-white" aria-hidden />
              </span>

              <HeroPill
                icon={<Users className="size-3.5 text-[#d3a5ff]" aria-hidden />}
                label="Club Owner"
                className="left-0 top-[178px]"
              />
              <HeroPill
                icon={<Mic className="size-3.5 text-[#d3a5ff]" aria-hidden />}
                label="Creator"
                className="right-0 top-[84px]"
              />
              <HeroPill
                icon={
                  <Sparkles className="size-3.5 text-[#d3a5ff]" aria-hidden />
                }
                label="Premium Identity"
                className="bottom-0 right-[36px]"
              />
            </div>
          </div>
        </div>

        {/* The three benefit cards from the presentation design. */}
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {premiumShowcaseBenefits.map((benefit, index) => {
            const { Icon, className } = benefitIcons[index] ?? benefitIcons[0];
            return (
              <div
                key={benefit.title}
                className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 text-center"
              >
                <Icon className={`mx-auto size-6 ${className}`} aria-hidden />
                <p className="mt-4 text-[15px] font-bold text-white">
                  {benefit.title}
                </p>
                <p className="mt-2 text-[13px] leading-6 text-white/45">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HeroPill({
  icon,
  label,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  className: string;
}) {
  return (
    <span
      className={`absolute inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-[#191329]/90 px-3.5 py-2 text-xs font-bold text-[#f3effa] shadow-[0_3px_12px_rgba(0,0,0,0.45)] ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}
