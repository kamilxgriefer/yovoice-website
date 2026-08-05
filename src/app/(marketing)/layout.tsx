import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#060511]">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
