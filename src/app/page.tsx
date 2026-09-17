import { HeroSection } from "@/components/hero/hero-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { DownloadSection } from "@/components/sections/download-section";
import { PremiumSection } from "@/components/sections/premium-section";
import { WelcomeFeatures } from "@/components/sections/welcome-features";
import { WelcomeIntro } from "@/components/sections/welcome-intro";
import { ServersWelcome } from "@/components/servers/servers-welcome";

/**
 * The homepage welcomes; it does not report a build.
 *
 * The rotating hero returns to the top, and the page reads in the order a
 * newcomer needs: what YO Voice is, what it gives you, what a Server is, and
 * how to join. The tester-build walkthrough and the release spotlight moved
 * to /updates, where a release ledger belongs, and availability copy lives on
 * /download. Nothing that was corrected for truthfulness was softened in the
 * move — it was relocated, not rewritten.
 */
export default function HomePage() {
  return (
    <div>
      <SiteHeader />
      <main id="main-content">
        <HeroSection />
        <WelcomeIntro />
        <WelcomeFeatures />
        <ServersWelcome />
        <PremiumSection />
        <DownloadSection />
      </main>
      <SiteFooter />
    </div>
  );
}
