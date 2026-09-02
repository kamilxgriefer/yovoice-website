import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
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
      "Community, broadcast and podcast voice rooms",
      "Clubs with chat, roles and member management",
      "Friends, following and creator profiles",
      "Achievements across messages, followers and more",
      "Push and in-app notifications",
      "Email verification and secure password reset",
      "In-app reporting, blocking and room moderation flows",
      "Web app at yovoice.app",
    ],
  },
  {
    key: "in-progress",
    title: "In progress",
    icon: Loader2,
    accent: "text-fuchsia-300",
    items: [
      "Native desktop apps for Windows and macOS",
      "Public iOS App Store and Google Play release",
      "Build 18 tester feedback from Google Play Internal Testing and TestFlight",
      "Expanded club discovery",
    ],
  },
  {
    key: "planned",
    title: "Planned",
    icon: CircleDashed,
    accent: "text-white/50",
    items: [
      "Public API for club and room integrations",
      "Scheduled and recurring rooms",
      "Deeper creator analytics",
      "More granular notification controls",
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
