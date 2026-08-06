import { HeroSection } from "@/components/hero/hero-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { DownloadSection } from "@/components/sections/download-section";
import { ProductExperienceSection } from "@/components/sections/product-experience-section";
import { StatsSection } from "@/components/sections/stats-section";

export default function HomePage() {
  return (
    <div>
      <SiteHeader />
      <main>
        <HeroSection />
        <StatsSection />
        <ProductExperienceSection />
        <DownloadSection />
      </main>
      <SiteFooter />
    </div>
  );
}
