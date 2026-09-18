import Link from "next/link";
import {
  ArrowRight,
  Clapperboard,
  MessageSquareMore,
  PhoneCall,
  Sparkles,
  Users,
} from "lucide-react";

import { FrameEchoIcon } from "@/components/brand/frame-echo-icon";
import { currentRelease, nextReleaseCandidateStatus } from "@/content/current-release";
import { productUpdates } from "@/content/product-updates";

const releaseScope = [
  {
    icon: Sparkles,
    title: "Five Server types",
    description: "Friends, Community, Podcast, Family and Company, open to every signed-in account.",
  },
  {
    icon: FrameEchoIcon,
    title: "Hub preserved",
    description: "The established animated navigation remains the shared foundation.",
  },
  {
    icon: MessageSquareMore,
    title: "Chats & media",
    description: "Messages typed offline are kept and sent when you are back online; GIFs, Add Friend and full-screen media.",
  },
  {
    icon: Users,
    title: "Friends",
    description: "A clearer route to add, search and manage the people you know.",
  },
  {
    icon: Clapperboard,
    title: "Yeels media-first",
    description: "The publish button shows its stage, and a failed publish keeps your draft editable.",
  },
  {
    icon: PhoneCall,
    title: "Calls under test",
    description: "Call setup, teardown and retry corrections continue on tester devices.",
  },
] as const;

export function LatestReleaseSpotlight() {
  const update = productUpdates.find(
    (item) => item.slug === `mobile-build-${currentRelease.buildNumber}-internal-testing`,
  );

  if (!update?.release) return null;

  return (
    <section
      aria-labelledby="latest-release-heading"
      className="relative overflow-hidden border-y border-white/[.06] bg-[var(--surface-sunken)] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"
    >
      <div className="grid-background absolute inset-0 opacity-15" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[54rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(123,47,247,.2),transparent_68%)] blur-2xl" />

      <div className="release-spotlight relative mx-auto grid max-w-[1240px] gap-8 overflow-hidden rounded-[30px] p-5 sm:p-8 lg:grid-cols-[.82fr_1.18fr] lg:gap-10 lg:p-10">
        <div className="relative flex min-w-0 flex-col">
          <div className="inline-flex min-h-9 w-fit items-center gap-2 rounded-full border border-[color:var(--accent)]/25 bg-[color:var(--accent)]/[.08] px-3.5 text-[11px] font-black uppercase tracking-[.17em] text-[var(--accent)]">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {update.release.stage}
          </div>

          <div className="mt-8 flex items-end gap-4 sm:mt-10 sm:gap-5">
            <span
              className="release-build-orb flex size-[5.6rem] shrink-0 items-center justify-center rounded-[1.8rem] font-[family-name:var(--font-display)] text-4xl font-black tabular-nums text-white sm:size-28 sm:rounded-[2rem] sm:text-5xl"
            >
              <span className="sr-only">Build </span>
              {update.release.buildNumber}
            </span>
            <div className="min-w-0 pb-1">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-white/50">
                YO Voice
              </p>
              <p className="mt-1 break-words font-[family-name:var(--font-display)] text-lg font-black tracking-[-.025em] text-white sm:text-2xl">
                {update.release.version}
              </p>
            </div>
          </div>

          <h2
            id="latest-release-heading"
            className="mt-8 max-w-xl font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.04] tracking-[-.045em] text-white sm:text-5xl"
          >
            One release.
            <span className="text-gradient block pb-[.08em]">
              One connected experience.
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--text-secondary)] sm:text-[15px]">
            Build {currentRelease.buildNumber} is available through Google Play Internal
            Testing, both TestFlight groups and the web app at app.yovoice.app.
            Servers are open to every signed-in account, Chats keep the
            messages you type offline and send them when you are back online,
            and a failed Yeel publish keeps the draft editable. Podcast
            recording remains disabled. This is an internal tester release, not
            a public App Store or Google Play release.{" "}
            {nextReleaseCandidateStatus}
          </p>

          <Link
            href={`/updates#mobile-build-${currentRelease.buildNumber}-internal-testing`}
            className="premium-button-secondary focus-ring mt-7 min-h-12 w-fit px-5 text-sm"
          >
            See Build {currentRelease.buildNumber} tester release
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="relative grid gap-3 sm:grid-cols-2" aria-label={`Build ${currentRelease.buildNumber} release scope`}>
          {releaseScope.map(({ icon: Icon, title, description }, index) => (
            <li
              key={title}
              className="release-scope-card group min-w-0 rounded-[22px] p-4 sm:p-5"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[.045] text-[var(--accent)] transition group-hover:border-[color:var(--accent)]/25 group-hover:bg-[color:var(--accent)]/[.08]">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-white">{title}</h3>
                    <span
                      className="text-[10px] font-black tabular-nums tracking-[.16em] text-white/25"
                      aria-hidden="true"
                    >
                      0{index + 1}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">
                    {description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
