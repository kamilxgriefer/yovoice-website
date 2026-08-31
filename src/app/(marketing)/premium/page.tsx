import { PremiumPlansView } from "@/components/premium/premium-plans-view";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "YO Voice Premium — Creator, Clubs and more",
  description:
    "Go Premium on YO Voice: become a Creator, build your own Clubs and see your final local currency securely at checkout.",
  path: "/premium",
});

export default function PremiumPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-[-10%] size-[560px] -translate-x-1/2 rounded-full bg-violet-700/15 blur-[160px]" />
      <PremiumPlansView />
    </div>
  );
}
