import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { DownloadSection } from "@/components/sections/download-section";
import { LatestReleaseSpotlight } from "@/components/sections/latest-release-spotlight";
import { PremiumSection } from "@/components/sections/premium-section";
import { TesterBuildExperience } from "@/components/sections/tester-build-experience";
import { ServersLanding } from "@/components/servers/servers-landing";

export default function HomePage() {
  return (
    <div>
      <SiteHeader />
      <main id="main-content">
        <ServersLanding />
        <TesterBuildExperience />
        <LatestReleaseSpotlight />
        <PremiumSection />
        <DownloadSection />
      </main>
      <SiteFooter />
    </div>
  );
}
