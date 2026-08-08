import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Mic2, ShieldCheck, Sparkles } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "About",
  description: "Why we're building YO Voice, and what we believe about voice-first community.",
};

const principles = [
  {
    icon: Mic2,
    title: "Voice first",
    description:
      "Text is easy to fake and easy to skim. Voice carries tone, hesitation and warmth — it's harder to be someone you're not, and easier to actually connect.",
  },
  {
    icon: Sparkles,
    title: "Built for creators and hosts",
    description:
      "Rooms and clubs are designed around the people who show up to run them — clear moderation tools, structure when you need it, and freedom when you don't.",
  },
  {
    icon: ShieldCheck,
    title: "Safety isn't an afterthought",
    description:
      "Email verification, blocking and room moderation ship as core features, not add-ons bolted on after launch.",
  },
  {
    icon: Heart,
    title: "Be you",
    description:
      "YO Voice exists so people can show up as themselves — in a club about a niche interest, a late-night conversation, or a stage in front of strangers who become friends.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About YO Voice"
        title={
          <>
            Where conversations
            <span className="text-gradient block">become communities.</span>
          </>
        }
        description="YO Voice is a voice-first social platform — rooms, clubs, friends and achievements built around real, live conversation instead of another feed to scroll."
      />

      <section className="px-5 pb-8 sm:px-8">
        <div className="mx-auto max-w-3xl text-sm leading-8 text-white/55">
          <p>
            Most social platforms optimize for content you consume alone.
            We&apos;re building the opposite: a place where you show up, speak,
            and leave with people you actually know. A community room where
            everyone can jump in. A podcast room when someone needs the
            stage. A club that keeps your people together between
            conversations.
          </p>
          <p className="mt-5">
            YO Voice is developed by a small, focused team shipping in the
            open — the web app is live today, with native apps for iOS,
            Android, Windows and macOS actively in development.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="eyebrow">What we believe</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-.04em] text-white sm:text-4xl">
              The principles behind the product
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {principles.map(({ icon: Icon, title, description }) => (
              <article key={title} className="glass-panel rounded-[28px] p-7">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-500/20 text-fuchsia-200">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-28 sm:px-8">
        <div className="glass-panel mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-[32px] p-10 text-center">
          <h2 className="text-2xl font-bold">Curious where we&apos;re headed?</h2>
          <p className="max-w-xl text-sm leading-7 text-white/50">
            See what&apos;s shipped, what&apos;s in progress and what&apos;s
            next on our roadmap.
          </p>
          <Link href="/roadmap" className="premium-button focus-ring mt-2 min-h-12 px-6 text-sm">
            View the roadmap <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
