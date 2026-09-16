import { PlatformSelector } from "@/components/download/platform-selector";
import { PageHero } from "@/components/marketing/page-hero";
import { currentRelease, currentReleaseAvailability } from "@/content/current-release";
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
        description={`The web app is live. YO Voice ${currentRelease.version} is in ${currentRelease.stage.toLowerCase()}. ${currentReleaseAvailability} This is not a public App Store or Google Play release. Desktop installers remain unavailable.`}
      />

      <section className="px-5 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <PlatformSelector />
        </div>
      </section>
    </>
  );
}
