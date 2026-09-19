import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { currentRelease, nextReleaseCandidate } from "@/content/current-release";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Roadmap",
  description: "What's live on YO Voice today, what's in progress, and what's next.",
  path: "/roadmap",
});

const columns = [
  {
    key: "shipped",
    title: "Live now",
    icon: CheckCircle2,
    accent: "text-[var(--success)]",
    items: [
      "Web app at app.yovoice.app",
      "Servers for every signed-in account: Friends, Community, Podcast, Family and Company",
      "GIFs in private chats",
      "Web push notifications in the web app",
      "Account registration, email verification and secure password recovery",
      "Server-enforced Premium entitlements",
      "Private-media access with short-lived, account-bound capabilities",
      "Friend requests, private messaging, blocking and reporting foundations",
      "Push and in-app notification preferences",
    ],
  },
  {
    key: "in-progress",
    title: "Internal testing",
    icon: Loader2,
    accent: "text-[var(--accent)]",
    items: [
      `YO Voice ${currentRelease.version} on Google Play Internal Testing, both TestFlight groups and the web app`,
      `YO Voice ${nextReleaseCandidate.version} in progress, no date: ${nextReleaseCandidate.scope.join("; ")}`,
      "Chats keep messages typed offline and send them once you are back online",
      "Yeels publishing shows its stage, a failed publish keeps the draft editable, and web-recorder videos are no longer refused outright",
      "The Voice Moments feed tells a loading failure apart from an empty feed",
      "Server-first Home with the established animated Hub preserved",
      "Chats with Add Friend and responsive full-screen private media",
      "Redesigned Friends search, filters and request routes",
      "Unified Voice and media-first Yeels visual language",
      "Voice and video call setup, teardown and retry corrections",
      "Creator following gated by Premium, age verification and explicit opt-in",
    ],
  },
  {
    key: "planned",
    title: "Gated or planned",
    icon: CircleDashed,
    accent: "text-[var(--text-tertiary)]",
    items: [
      "Podcast recording and published episodes",
      "Video stages, family tools and company screen-sharing or whiteboard modules",
      "Public iOS App Store and Google Play release",
      "Native desktop apps for Windows and macOS",
      "Deeper creator analytics",
    ],
  },
] as const;

export default function RoadmapPage() {
  return (
    <>
      <PageHero
        eyebrow="Roadmap"
        title="What we're building next"
        description="An honest snapshot of where YO Voice stands — updated as things ship."
      />
      <section className="px-5 pb-28 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3">
          {columns.map(({ key, title, icon: Icon, accent, items }) => (
            <div key={key} className="panel p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <Icon className={`size-5 ${accent}`} strokeWidth={1.8} aria-hidden="true" />
                <h2 className="text-lg font-bold text-[var(--foreground)]">{title}</h2>
              </div>
              <ul className="mt-6 space-y-4">
                {items.map((item) => (
                  <li key={item} className="text-sm leading-6 text-[var(--text-secondary)]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
