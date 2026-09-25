import { LiveStatus } from "@/components/marketing/live-status";
import { PageHero } from "@/components/marketing/page-hero";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "System Status",
  description:
    "A live check of the YO Voice website, with links to the Firebase, LiveKit and Vercel status pages.",
  path: "/status",
});

export default function StatusPage() {
  return (
    <>
      <PageHero
        eyebrow="Status"
        title="All systems status"
        description="A quick, honest look at what's running right now."
      />
      <section className="px-5 pb-28 sm:px-8">
        <LiveStatus />
      </section>
    </>
  );
}
