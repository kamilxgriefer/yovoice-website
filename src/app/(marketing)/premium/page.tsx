import type { Metadata } from "next";

import { PremiumPlansView } from "@/components/premium/premium-plans-view";

export const metadata: Metadata = {
  title: "YO Voice Premium — Creator, Clubs and more",
  description:
    "Go Premium on YO Voice: become a Creator, build your own Clubs and stand out with a premium identity. €9.99 monthly or €89.99 yearly.",
};

export default function PremiumPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-[-10%] size-[560px] -translate-x-1/2 rounded-full bg-violet-700/15 blur-[160px]" />
      <PremiumPlansView />
    </div>
  );
}
