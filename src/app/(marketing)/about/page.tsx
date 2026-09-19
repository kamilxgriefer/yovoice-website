import Link from "next/link";
import { ArrowRight, Heart, Mic2, ShieldCheck, Sparkles } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { currentRelease, currentReleaseAvailability } from "@/content/current-release";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "About",
  description: "Why we're building YO Voice, and what we believe about voice-first community.",
  path: "/about",
});

const principles = [
  {
    icon: Mic2,
    title: "Voice first",
    description:
      "Text is easy to fake and easy to skim. Voice carries tone, hesitation and warmth — it's harder to be someone you're not, and easier to actually connect.",
  },
  {
    icon: Sparkles,
    title: "Built for people and creators",
    description:
      "Friends, Chats and Servers are designed around the people who return — clear structure when it helps, direct conversation when it matters.",
  },
  {
    icon: ShieldCheck,
    title: "Safety isn't an afterthought",
    description:
      "Email verification, blocking, reporting and server-side eligibility checks ship as core features, not add-ons bolted on after launch.",
  },
  {
    icon: Heart,
    title: "Be you",
    description:
      "YO Voice exists so people can show up as themselves — with close friends, around a shared interest, through a Voice Moment or inside a story told as a Yeel.",
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
            <span className="block text-[var(--accent)]">become communities.</span>
          </>
        }
        description="YO Voice brings private conversation, voice and everyday moments together. The current tester build carries a server-first interface for friends, communities, podcasts, families and teams."
      />

      <section className="px-5 pb-8 sm:px-8">
        <div className="mx-auto max-w-3xl text-base leading-[1.6] text-[var(--text-secondary)]">
          <p>
            Most social platforms optimize for content you consume alone.
            We&apos;re building the opposite: a place where you show up, speak,
            and leave with people you actually know. Home begins with friends.
            Chats lead directly into private conversation. Voice Moments and
            Yeels give everyday stories two related forms. Servers give each
            circle a clear place to begin.
          </p>
          <p className="mt-5">
            YO Voice is developed by a small, focused team shipping in the
            open — the web app is live today, and YO Voice {currentRelease.version} is in {currentRelease.stage.toLowerCase()}. {currentReleaseAvailability} Public store and desktop releases remain separate milestones.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="eyebrow">What we believe</p>
            <h2 className="section-title">
              The principles behind the product
            </h2>
          </div>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-9">
            {principles.map(({ icon: Icon, title, description }) => (
              <li key={title} className="feature-row">
                <span className="icon-tile">
                  <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[var(--foreground)]">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pb-28 sm:px-8">
        <div className="panel mx-auto flex max-w-4xl flex-col items-center gap-4 p-8 text-center sm:p-10">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Curious where we&apos;re headed?</h2>
          <p className="max-w-xl text-base leading-[1.6] text-[var(--text-secondary)]">
            See what&apos;s shipped, what&apos;s in progress and what&apos;s
            next on our roadmap.
          </p>
          <Link href="/roadmap" className="premium-button focus-ring mt-2">
            View the roadmap <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
