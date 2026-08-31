import { LiveStatus } from "@/components/marketing/live-status";
import { PageHero } from "@/components/marketing/page-hero";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "System Status",
  description: "Live status for YO Voice's website, accounts and voice infrastructure.",
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
