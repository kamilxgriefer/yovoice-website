import { HeroSection } from "@/components/hero/hero-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { DownloadSection } from "@/components/sections/download-section";
import { FeatureGridSection } from "@/components/sections/feature-grid-section";
import { ProductDetailsSection } from "@/components/sections/product-details-section";
import { StatsSection } from "@/components/sections/stats-section";

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <HeroSection />
      <StatsSection />
      <FeatureGridSection />
      <ProductDetailsSection />
      <DownloadSection />
      <SiteFooter />
    </main>
  );
}
