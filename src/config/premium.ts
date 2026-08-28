/**
 * The single source of Premium product/pricing copy on the website.
 * Mirrors the app's central config (lib/features/premium/data/
 * premium_plans.dart) — if a price changes, it changes there and here,
 * nowhere else. Once a live billing provider exists, its localized
 * prices become authoritative for display.
 */

import type {
  LocalizedBillingPlan,
  PremiumPaymentMethod,
} from "@/lib/premium/billing-contract";

export type PremiumPlanId = "monthly" | "yearly";

export type PremiumPlan = {
  id: PremiumPlanId;
  name: string;
  highlight: boolean;
  cta: string;
};

export const premiumPlans: PremiumPlan[] = [
  {
    id: "monthly",
    name: "Monthly",
    highlight: false,
    cta: "Choose monthly",
  },
  {
    id: "yearly",
    name: "Yearly",
    highlight: true,
    cta: "Choose yearly",
  },
];

/**
 * Public, provider-independent prices. These keep the sales page useful when
 * the billing callable is cold, unavailable or not deployed yet. They never
 * enable checkout: only a successfully parsed server context can do that.
 */
export const premiumFallbackBillingPlans: LocalizedBillingPlan[] = [
  {
    id: "monthly",
    interval: "month",
    currency: "EUR",
    unitAmount: 600,
    formattedPrice: "€6",
    formattedEquivalent: null,
    savingsPercent: 0,
  },
  {
    id: "yearly",
    interval: "year",
    currency: "EUR",
    unitAmount: 6000,
    formattedPrice: "€60",
    formattedEquivalent: "€5",
    savingsPercent: 17,
  },
];

export const blikPrepaidOffers = {
  monthly: {
    currency: "PLN",
    unitAmount: 2_600,
    formattedPrice: "26 zł",
    accessDays: 30,
    renews: false,
  },
  yearly: {
    currency: "PLN",
    unitAmount: 26_000,
    formattedPrice: "260 zł",
    accessDays: 365,
    renews: false,
  },
} as const;

export type PremiumPaymentOption = {
  id: PremiumPaymentMethod;
  label: string;
  description: string;
};

const subscriptionPaymentOptions: PremiumPaymentOption[] = [
  {
    id: "recurring",
    label: "Card or PayPal",
    description: "Recurring · choose securely in checkout",
  },
];

export function paymentOptionsForPlan(
  plan: PremiumPlanId,
): PremiumPaymentOption[] {
  const prepaid = blikPrepaidOffers[plan];
  return [
    ...subscriptionPaymentOptions,
    {
      id: "blik",
      label: "BLIK",
      description: `${prepaid.formattedPrice} · ${prepaid.accessDays} days prepaid · no renewal`,
    },
  ];
}

/**
 * The short per-plan checklist on the plan cards. Identical for both
 * plans on purpose — the plans differ in billing, not capabilities.
 * Mirrors the app's PremiumPlans.planChecklist.
 */
export const premiumPlanChecklist = [
  "Creator access",
  "Create Clubs",
  "Premium identity",
  "Exclusive features",
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
    title: "Create your own Clubs",
    description: "Build spaces for your people. Joining stays free for everyone.",
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
