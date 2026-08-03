import { HeroSection } from "@/components/hero/hero-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { DownloadSection } from "@/components/sections/download-section";
import { ProductExperienceSection } from "@/components/sections/product-experience-section";

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <HeroSection />
      <ProductExperienceSection />
      <DownloadSection />
      <SiteFooter />
    </main>
  );
}
