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
        description="The web app is live. YO Voice 1.0.0 build 20 is available to invited testers through Google Play Internal Testing and TestFlight. This is not a public App Store or Google Play release. Desktop installers remain unavailable."
      />

      <section className="px-5 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <PlatformSelector />
        </div>
      </section>
    </>
  );
}
