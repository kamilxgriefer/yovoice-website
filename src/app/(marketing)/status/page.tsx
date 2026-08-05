import type { Metadata } from "next";

import { LiveStatus } from "@/components/marketing/live-status";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "System Status",
  description: "Live status for YO Voice's website, accounts and voice infrastructure.",
};

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
