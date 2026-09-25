import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Crown, Mic, Sparkles, Users } from "lucide-react";

import { PremiumBadge } from "@/components/premium/premium-badge";
import { PremiumRing } from "@/components/premium/premium-ring";
import { premiumShowcaseBenefits } from "@/config/premium";

const benefitIcons = [Mic, Crown, Sparkles];

/**
 * The homepage Premium SHOWCASE — the website rendition of the app's
 * Premium presentation (board screen 3). Its one job is selling the
 * idea — identity, Creator, existing entitlements — and handing off to /premium, which
 * sells the plan. Deliberately contains no prices, no comparison table,
 * no billing detail.
 *
 * The ring is the one ornament this section is allowed. The two section-wide
 * blooms and the two blurred discs behind the ring are gone, the crown chip
 * is a bordered surface rather than a glowing gradient, and the benefits sit
 * on the shared panel surface.
 */
export function PremiumSection() {
  return (
    <section
      id="premium"
      className="relative border-t border-[var(--border)] bg-[var(--surface-sunken)] py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1100px] px-5 sm:px-8">
        <div className="grid min-w-0 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <PremiumBadge />
            <h2 className="section-title">
              More room <span className="text-[var(--accent)]">for your voice.</span>
            </h2>
            <p className="mt-4 text-base font-semibold text-[var(--foreground)]">
              Create. Lead. Build communities. Stand out.
            </p>
            <p className="mt-3 max-w-xl text-base leading-[1.6] text-[var(--text-secondary)]">
              Premium adds Creator Studio and a distinctive Premium identity
              across YO Voice. Public following also requires age
              confirmation and explicit opt-in. Free can own 5 Servers and
              Premium can own 30; joining stays unlimited.
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link href="/premium" className="premium-button focus-ring">
                Check plans
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/premium#included" className="premium-button-ghost focus-ring">
                Learn more
              </Link>
            </div>
          </div>

          {/* Identity hero: the actual premium ring — the same treatment a
              member's avatar gets in the app — with the capability pills
              from the presentation design. */}
          {/* w-full + max-w so a 320px viewport can't be forced wider than
              itself — a fixed 340px hero made the grid column overflow and
              the section's overflow-hidden clipped the headline. */}
          <div className="flex w-full justify-center">
            <div className="relative h-[300px] w-full max-w-[340px]">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <PremiumRing size={190}>
                  {/* object-contain, not cover: the old asset was a black
                      square that filled the ring edge to edge, so cropping
                      it was harmless. The supplied symbol is transparent and
                      slightly taller than wide — cover would crop the mark. */}
                  <Image
                    src="/logos/yo-voice-symbol.png"
                    alt=""
                    width={184}
                    height={190}
                    className="size-full scale-[0.8] object-contain"
                  />
                </PremiumRing>
              </div>

              {/* Crown chip on the ring's top-right diagonal. */}
              <span className="absolute right-[62px] top-[52px] flex size-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--accent)]">
                <Crown className="size-5" strokeWidth={1.8} aria-hidden />
              </span>

              <HeroPill
                icon={<Users className="size-3.5 text-[var(--accent)]" aria-hidden />}
                label="Your identity"
                className="left-0 top-[178px]"
              />
              <HeroPill
                icon={<Mic className="size-3.5 text-[var(--accent)]" aria-hidden />}
                label="Creator"
                className="right-0 top-[84px]"
              />
              <HeroPill
                icon={<Sparkles className="size-3.5 text-[var(--accent)]" aria-hidden />}
                label="Premium Identity"
                className="bottom-0 right-[36px]"
              />
            </div>
          </div>
        </div>

        {/* The three benefits from the presentation design. */}
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {premiumShowcaseBenefits.map((benefit, index) => {
            const Icon = benefitIcons[index] ?? benefitIcons[0];
            return (
              <div key={benefit.title} className="panel p-5">
                <span className="icon-tile">
                  <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden />
                </span>
                <p className="mt-4 text-[15px] font-bold text-[var(--foreground)]">
                  {benefit.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
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
      className={`absolute inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[13px] font-semibold text-[var(--text-secondary)] ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}
