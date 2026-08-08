import Link from "next/link";
import { ArrowRight, Crown, Palette, Sparkles, Users } from "lucide-react";

/**
 * YO Voice Premium — pricing/benefits section for the landing page.
 *
 * Pricing mirrors the app's central product config
 * (lib/features/premium/data/premium_plans.dart). Purchases are not yet
 * enabled on web, so the CTA routes to account creation instead of a
 * fake checkout — Premium activates in the product once subscriptions
 * launch, and this section says so plainly.
 */

const benefits = [
  {
    icon: Sparkles,
    title: "Creator profile",
    description: "Build a public Creator identity and unlock Creator tools.",
  },
  {
    icon: Crown,
    title: "Create Clubs",
    description: "Build and own your own communities — joining stays free.",
  },
  {
    icon: Palette,
    title: "Stand out",
    description: "Premium identity styling across profiles and rooms.",
  },
  {
    icon: Users,
    title: "More to come",
    description: "New Premium capabilities plug straight into your plan.",
  },
];

export function PremiumSection() {
  return (
    <section
      id="premium"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#0b0712] py-16 sm:py-32"
    >
      <div className="absolute left-1/2 top-[-20%] size-[560px] -translate-x-1/2 rounded-full bg-violet-700/15 blur-[160px]" />

      <div className="relative mx-auto w-full max-w-[1100px] px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-fuchsia-400">
            YO Voice Premium
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.05em] text-white sm:mt-6 sm:text-6xl">
            Unlock more <span className="text-gradient">of your voice</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-white/50 sm:mt-6 sm:text-base sm:leading-8">
            Everything essential stays free — conversations, rooms, friends
            and clubs you&apos;re invited to. Premium adds identity and
            creation on top.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="glass-panel rounded-[24px] p-6 sm:rounded-[28px]"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-500/20 text-fuchsia-200">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/45">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:mt-14 sm:grid-cols-2">
          {/* Yearly — highlighted */}
          <div className="glass-panel relative rounded-[28px] border border-fuchsia-400/40 p-7">
            <span className="absolute right-5 top-5 rounded-full bg-fuchsia-500/20 px-3 py-1 text-[11px] font-bold text-fuchsia-200">
              Best value
            </span>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/40">
              Yearly
            </p>
            <p className="mt-3 text-4xl font-bold text-white">
              €89.99
              <span className="text-base font-semibold text-white/40">
                {" "}
                / year
              </span>
            </p>
            <p className="mt-2 text-sm text-white/50">
              ≈ €7.50 / month · Save about 25%
            </p>
          </div>

          <div className="glass-panel rounded-[28px] p-7">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/40">
              Monthly
            </p>
            <p className="mt-3 text-4xl font-bold text-white">
              €9.99
              <span className="text-base font-semibold text-white/40">
                {" "}
                / month
              </span>
            </p>
            <p className="mt-2 text-sm text-white/50">
              Full flexibility, cancel any time.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/register"
            className="premium-button min-h-13 inline-flex items-center justify-center gap-2 px-8"
          >
            Get Premium
            <ArrowRight className="size-4" />
          </Link>
          <p className="mt-4 text-xs text-white/35">
            Premium subscriptions activate inside YO Voice. Store pricing may
            vary by region.
          </p>
        </div>
      </div>
    </section>
  );
}
