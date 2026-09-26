import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Crown, Mic, Sparkles } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";
import { PremiumBadge } from "@/components/premium/premium-badge";
import { PremiumRing } from "@/components/premium/premium-ring";
import { PremiumIdentity } from "@/components/sections/premium-identity";
import { premiumShowcaseBenefits } from "@/config/premium";

const benefitIcons = [Mic, Crown, Sparkles];

/**
 * The homepage Premium SHOWCASE — the website rendition of the app's
 * Premium presentation (board screen 3). Its one job is selling the
 * idea — identity, Creator, existing entitlements — and handing off to /premium, which
 * sells the plan. Deliberately contains no prices, no comparison table,
 * no billing detail.
 *
 * The ring is the one ornament this section is allowed, and in the scroll
 * cinema it is the protagonist: `PremiumIdentity` grows and turns it into
 * place, spreads sound-like rings from the avatar as you scroll and flies the
 * crown and pills out from behind it. The copy and the three benefits rise in
 * with `Reveal`. Without the cinema (server render, reduced motion, large
 * text, short viewports) every part is drawn at rest in the same layout, with
 * the same words.
 */
export function PremiumSection() {
  return (
    <section
      id="premium"
      aria-labelledby="premium-heading"
      className="relative overflow-x-clip border-t border-[var(--border)] bg-[var(--surface-sunken)] py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1100px] px-5 sm:px-8">
        <div className="grid min-w-0 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Above the identity's ripples, which spread behind it on a phone. */}
          <div className="relative z-[1] min-w-0">
            <Reveal>
              <PremiumBadge />
            </Reveal>
            <Reveal delay={0.08}>
              <h2 id="premium-heading" className="section-title">
                More room <span className="text-[var(--accent)]">for your voice.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-4 text-base font-semibold text-[var(--foreground)]">
                Create. Lead. Build communities. Stand out.
              </p>
              <p className="mt-3 max-w-xl text-base leading-[1.6] text-[var(--text-secondary)]">
                Premium adds Creator Studio and a distinctive Premium identity
                across YO Voice. Public following also requires age
                confirmation and explicit opt-in. Free can own 5 Servers and
                Premium can own 30; joining stays unlimited.
              </p>
            </Reveal>

            <Reveal
              delay={0.24}
              className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            >
              <Link href="/premium" className="premium-button focus-ring">
                Check plans
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/premium#included" className="premium-button-ghost focus-ring">
                Learn more
              </Link>
            </Reveal>
          </div>

          {/* Identity hero: the actual premium ring — the same treatment a
              member's avatar gets in the app — with the capability pills
              from the presentation design. */}
          <PremiumIdentity
            ring={
              <PremiumRing size={190}>
                {/* object-contain, not cover: the old asset was a black
                    square that filled the ring edge to edge, so cropping
                    it was harmless. The supplied symbol is transparent and
                    slightly taller than wide — cover would crop the mark.
                    The box is the ring's 184px square inner disc, so the
                    attributes say so too; object-contain keeps the mark's
                    own proportions inside it. */}
                <Image
                  src="/logos/yo-voice-symbol.png"
                  alt=""
                  width={184}
                  height={184}
                  className="size-full scale-[0.8] object-contain"
                />
              </PremiumRing>
            }
          />
        </div>

        {/* The three benefits from the presentation design. */}
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {premiumShowcaseBenefits.map((benefit, index) => {
            const Icon = benefitIcons[index] ?? benefitIcons[0];
            return (
              <Reveal key={benefit.title} delay={index * 0.1} className="panel p-5">
                <span className="icon-tile">
                  <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden />
                </span>
                <h3 className="mt-4 text-[15px] font-bold text-[var(--foreground)]">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {benefit.description}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
