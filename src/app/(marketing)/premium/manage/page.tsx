import type { Metadata } from "next";

import { PremiumManageView } from "@/components/premium/premium-manage-view";

export const metadata: Metadata = {
  title: "Manage Premium",
  description: "View, change or cancel your YO Voice Premium subscription.",
};

export default function ManagePremiumPage() {
  return <PremiumManageView />;
}
