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
        description="The web app is live. YO Voice 1.0.0 build 19 is available through Google Play Internal Testing and TestFlight for invited testers; it is not a public App Store or Google Play release, and desktop installers remain unavailable."
      />

      <section className="px-5 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <PlatformSelector />
        </div>
      </section>
    </>
  );
}
