import Link from "next/link";
import {
  ArrowRight,
  House,
  LayoutGrid,
  LogIn,
  MessageSquareMore,
  Sparkles,
  UserRound,
} from "lucide-react";

import { FrameEchoIcon } from "@/components/brand/frame-echo-icon";
import { currentRelease, currentReleaseAvailability } from "@/content/current-release";
import { productUpdates } from "@/content/product-updates";

// The six areas of the current release, worded from the app's English
// release notes (yovoice docs/Sessions/2026-09-19-slim-redesign.md). The
// first tab is "Home", the English app label.
const releaseScope = [
  {
    icon: House,
    title: "Home",
    description: "The YO Voice logo in the greeting, your friends' Moments as a story rail, a Live now row showing channels that are live right now and since when, and your servers as a compact list.",
  },
  {
    icon: LayoutGrid,
    title: "Servers",
    description: "A compact server list, and a server rail beside the channels so you can switch servers without leaving the workspace; on phones it sits in the Channels sheet.",
  },
  {
    icon: MessageSquareMore,
    title: "Chats",
    description: "A slimmer conversation list that shows who is active, cleaner bubbles and date separators, and a lighter message bar.",
  },
  {
    icon: FrameEchoIcon,
    title: "YO Moments",
    description: "Voice and Yeels stay two separate formats, each with its own filters, and Yeels play full screen with the actions on the right.",
  },
  {
    icon: UserRound,
    title: "Profile",
    description: "A new header with stats and clear actions, on your own profile and your friends'.",
  },
  {
    icon: LogIn,
    title: "Sign-in",
    description: "A calmer sign-in, sign-up and password reset.",
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
      className="relative px-5 py-12 sm:px-8 sm:py-16 lg:px-12"
    >
      <div className="release-spotlight relative mx-auto grid max-w-6xl gap-8 p-5 sm:p-8 lg:grid-cols-[.82fr_1.18fr] lg:gap-10 lg:p-10">
        <div className="relative flex min-w-0 flex-col">
          <div data-status={update.status} className="release-status inline-flex min-h-8 w-fit items-center gap-2 rounded-full border px-3 text-[13px] font-semibold">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {update.release.stage}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className="release-build-orb inline-flex h-7 min-w-10 shrink-0 items-center justify-center px-2.5 text-[13px] font-extrabold tabular-nums text-white"
            >
              <span className="sr-only">Build </span>
              {update.release.buildNumber}
            </span>
            <p className="min-w-0 break-words text-sm font-semibold text-[var(--text-secondary)]">
              YO Voice <span className="text-[var(--foreground)]">{update.release.version}</span>
            </p>
          </div>

          <h2
            id="latest-release-heading"
            className="mt-5 max-w-xl font-[family-name:var(--font-display)] text-[1.875rem] font-extrabold leading-[1.1] tracking-[-.025em] text-[var(--foreground)] sm:text-[2.5rem]"
          >
            A new look for the whole app.
            <span className="block text-[var(--accent)]">
              One calmer design.
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-[1.6] text-[var(--text-secondary)]">
            YO Voice {currentRelease.version} brings one calmer design to Home,
            Servers, Chats, YO Moments, Profile and sign-in, in Dark and Pearl.{" "}
            {currentReleaseAvailability} Servers are open to every signed-in
            account and Podcast recording remains disabled. This is an internal
            tester release, not a public App Store or Google Play release.
          </p>

          <Link
            href={`/updates#mobile-build-${currentRelease.buildNumber}-internal-testing`}
            className="premium-button-secondary focus-ring mt-7 min-h-12 w-fit"
          >
            See Build {currentRelease.buildNumber} tester release
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="relative grid gap-3 sm:grid-cols-2" aria-label={`Build ${currentRelease.buildNumber} release scope`}>
          {releaseScope.map(({ icon: Icon, title, description }, index) => (
            <li
              key={title}
              className="release-scope-card group min-w-0 p-4 sm:p-5"
            >
              <div className="flex items-start gap-3.5">
                <span className="icon-tile">
                  <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-[var(--foreground)]">{title}</h3>
                    <span
                      className="text-[11px] font-bold tabular-nums tracking-[.12em] text-[var(--text-tertiary)]"
                      aria-hidden="true"
                    >
                      0{index + 1}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">
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
