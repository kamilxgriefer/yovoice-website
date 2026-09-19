import { PremiumPlansView } from "@/components/premium/premium-plans-view";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "YO Voice Premium — Creator and Premium identity",
  description:
    "Explore Creator Studio, a Premium badge and profile ring, and up to 30 owned Servers once Servers launch.",
  path: "/premium",
});

export default function PremiumPage() {
  return (
    <PremiumPlansView />
  );
}
