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
    accent: "text-emerald-300",
    items: [
      "Web app at app.yovoice.app",
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
    accent: "text-fuchsia-300",
    items: [
      `YO Voice ${currentRelease.version} on the existing Google Play Internal Testing list and TestFlight internal group`,
      `YO Voice ${nextReleaseCandidate.version} prepared as the next internal tester candidate; availability not yet confirmed`,
      "Five-type Servers interface: Friends, Community, Podcast, Family and Company",
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
    accent: "text-white/50",
    items: [
      "Server backend activation for creation, membership and channel activity",
      "Podcast recording and published episodes",
      "GIF search and sending backend rollout for the 16 original YO Voice animations prepared in the Build 27 candidate",
      "Video stages, family tools and company screen-sharing or whiteboard modules",
      "Owned Server limits after activation: 5 on Free and 30 on Premium, with unlimited joins for everyone",
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
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {columns.map(({ key, title, icon: Icon, accent, items }) => (
            <div key={key} className="glass-panel rounded-[28px] p-7">
              <div className="flex items-center gap-3">
                <Icon className={`size-5 ${accent}`} />
                <h2 className="text-lg font-bold">{title}</h2>
              </div>
              <ul className="mt-6 space-y-4">
                {items.map((item) => (
                  <li key={item} className="text-sm leading-6 text-white/55">
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
