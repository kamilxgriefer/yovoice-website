/**
 * The single source of Premium product/pricing copy on the website.
 * Mirrors the app's central config (lib/features/premium/data/
 * premium_plans.dart) — if a price changes, it changes there and here,
 * nowhere else. Once a live billing provider exists, its localized
 * prices become authoritative for display.
 */

export type PremiumPlanId = "monthly" | "yearly";

export type PremiumPlan = {
  id: PremiumPlanId;
  name: string;
  price: string;
  period: string;
  equivalent?: string;
  savings?: string;
  highlight: boolean;
  cta: string;
};

export const premiumPlans: PremiumPlan[] = [
  {
    id: "yearly",
    name: "Yearly",
    price: "€89.99",
    period: "/ year",
    equivalent: "≈ €7.50 / month",
    savings: "Save about 25%",
    highlight: true,
    cta: "Choose yearly",
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "€9.99",
    period: "/ month",
    highlight: false,
    cta: "Choose monthly",
  },
];

export function isPremiumPlanId(value: string | null): value is PremiumPlanId {
  return value === "monthly" || value === "yearly";
}

/** The three showcase benefits — real product capabilities, no vapor. */
export const premiumShowcaseBenefits = [
  {
    kicker: "Creator",
    title: "Become a Creator",
    description:
      "Build a public Creator identity people can follow, and unlock Creator tools.",
  },
  {
    kicker: "Clubs",
    title: "Build your own Clubs",
    description: "Create spaces for your community. Joining stays free for everyone.",
  },
  {
    kicker: "Premium identity",
    title: "Stand out",
    description:
      "A distinctive premium ring on your profile and avatar across YO Voice.",
  },
];

/** Everything both plans include — plans differ by billing period only. */
export const premiumIncludedFeatures = [
  "Creator profile and Creator tools",
  "Create and own your own Clubs",
  "Premium profile and avatar styling",
  "Premium identity inside rooms",
  "Future Premium capabilities as they launch",
];
