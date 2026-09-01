import { PlatformSelector } from "@/components/download/platform-selector";
import { PageHero } from "@/components/marketing/page-hero";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Download",
  description:
    "See where YO Voice is available today across web, invited mobile testing and future desktop releases.",
  path: "/download",
});

export default function DownloadPage() {
  return (
    <>
      <PageHero
        compact
        eyebrow="Download"
        title="YO Voice wherever you are"
        description="The web app is live. YO Voice 1.0.0 build 17 is ready and awaiting invited-tester distribution through Google Play Internal Testing and TestFlight; public store and desktop releases remain unavailable."
      />

      <section className="px-5 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <PlatformSelector />
        </div>
      </section>
    </>
  );
}
