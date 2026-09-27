"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Crown, Mic, Sparkles } from "lucide-react";

import { DUR, STAGGER, useCinema } from "@/components/animations/cinema";
import { Reveal } from "@/components/animations/reveal";
import { SceneOpener } from "@/components/animations/scene-opener";
import { PremiumBadge } from "@/components/premium/premium-badge";
import { PremiumRing } from "@/components/premium/premium-ring";
import { PremiumIdentity } from "@/components/sections/premium-identity";
import { MagneticCta } from "@/components/ui/magnetic-cta";
import { premiumShowcaseBenefits } from "@/config/premium";
import { cn } from "@/lib/utils/cn";

const benefitIcons = [Mic, Crown, Sparkles];

/**
 * Seconds every block under the opener waits once it is in view, so the
 * section always reads in order: the title, then the lead and the actions
 * together, then the benefits one after another. A quick flick brings the
 * opener, the actions and the benefits into view at once, and the lead
 * starts about 0.43s into the opener's cue; at an ordinary pace each block
 * comes into view after the one above it and the wait is barely felt.
 */
const FOLLOW = DUR.swap;

/**
 * The homepage Premium SHOWCASE — the website rendition of the app's
 * Premium presentation (board screen 3). Its one job is selling the
 * idea — identity, Creator, existing entitlements — and handing off to /premium, which
 * sells the plan. Deliberately contains no prices, no comparison table,
 * no billing detail.
 *
 * It sits on the homepage frame and opens the way every section does
 * (`SceneOpener`, the column size), with the Premium badge in the eyebrow's
 * place: in the scroll cinema the badge rises, "More room for your voice."
 * rises word by word out of its baseline, and the lead follows.
 *
 * The ring is the one ornament this section is allowed, and in the scroll
 * cinema it is the protagonist: `PremiumIdentity` grows and turns it into
 * place, spreads sound-like rings from the avatar as you scroll and buds the
 * crown and pills from its rim, over a magenta core that is the only colour
 * the section adds, and only around the ring. The actions and the three
 * benefits rise in with `Reveal`; "Check plans" answers the pointer the way
 * every primary action on the homepage does (`MagneticCta`). Without the
 * cinema (server render, reduced motion, large text, short viewports) every
 * part is drawn at rest in the same layout, with the same words.
 *
 * Seams: the static layout keeps the site's hairline and sunken ground; in
 * the cinema the section shares the page's one ground with its neighbours
 * and the hand-over is the opener's own entrance.
 */
export function PremiumSection() {
  const cinema = useCinema();
  return (
    <section
      id="premium"
      aria-labelledby="premium-heading"
      className={cn(
        "relative overflow-x-clip pb-[var(--section-bottom)] pt-[var(--opener-top)]",
        cinema
          ? "bg-[var(--background)]"
          : "border-t border-[var(--border)] bg-[var(--surface-sunken)]",
      )}
    >
      <div className="frame">
        <div className="grid min-w-0 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Above the identity's ripples, which spread behind it on a phone. */}
          <div className="relative z-[1] min-w-0">
            <SceneOpener
              size="column"
              eyebrowSlot={<PremiumBadge />}
              title="More room"
              accent="for your voice."
              accentClassName="block"
              headingId="premium-heading"
              lead={
                <>
                  <span className="block text-pretty font-semibold text-[var(--foreground)]">
                    Create. Lead. Build communities. Stand out.
                  </span>{" "}
                  <span className="mt-3 block text-pretty">
                    Premium adds Creator Studio and a distinctive Premium identity
                    across YO Voice. Public following also requires age
                    confirmation and explicit opt-in. Free can own 5 Servers and
                    Premium can own 30; joining stays unlimited.
                  </span>
                </>
              }
            />

            <Reveal
              delay={FOLLOW}
              className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:mt-10"
            >
              <MagneticCta href="/premium" wrapperClassName="flex sm:inline-flex" className="w-full sm:w-auto">
                Check plans
                <ArrowRight className="arrow-nudge size-4" aria-hidden="true" />
              </MagneticCta>
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
        <div className="mt-[var(--opener-gap)] grid gap-4 sm:grid-cols-3">
          {premiumShowcaseBenefits.map((benefit, index) => {
            const Icon = benefitIcons[index] ?? benefitIcons[0];
            return (
              <Reveal
                key={benefit.title}
                delay={FOLLOW + Math.min(index, 4) * STAGGER.item}
                className="panel p-5"
              >
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
