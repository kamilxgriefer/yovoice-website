export type BillingPlanId = "monthly" | "yearly";
export type BillingManager = "stripe" | "apple" | "google" | "admin" | "none";

export type LocalizedBillingPlan = {
  id: BillingPlanId;
  interval: "month" | "year";
  currency: string;
  unitAmount: number;
  formattedPrice: string;
  formattedEquivalent: string | null;
  savingsPercent: number;
};

export type PremiumBillingContext = {
  countryCode: string | null;
  currency: string;
  taxDisplay: "included" | "calculated_at_checkout";
  taxNotice: string;
  priceDisplaySource: "base";
  localizedAtCheckout: boolean;
  billingManagedBy: BillingManager;
  checkoutAvailable: boolean;
  portalAvailable: boolean;
  currentPlan: BillingPlanId | "none";
  renewalBehavior: "renews" | "ends" | "none";
  currentPeriodEndMs: number | null;
  plans: LocalizedBillingPlan[];
};

const contextKeys = ["billingManagedBy", "checkoutAvailable", "countryCode", "currency", "currentPeriodEndMs", "currentPlan", "localizedAtCheckout", "plans", "portalAvailable", "priceDisplaySource", "renewalBehavior", "taxDisplay", "taxNotice"].sort();
const planKeys = ["currency", "formattedEquivalent", "formattedPrice", "id", "interval", "savingsPercent", "unitAmount"].sort();

function hasExactKeys(value: Record<string, unknown>, expected: string[]) {
  return JSON.stringify(Object.keys(value).sort()) === JSON.stringify(expected);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parsePremiumBillingContext(value: unknown): PremiumBillingContext {
  if (!isRecord(value) || !hasExactKeys(value, contextKeys)) throw new Error("Invalid billing context contract.");
  const plans = value.plans;
  if (
    (value.countryCode !== null && (typeof value.countryCode !== "string" || !/^[A-Z]{2}$/.test(value.countryCode))) ||
    typeof value.currency !== "string" || !/^[A-Z]{3}$/.test(value.currency) ||
    !["included", "calculated_at_checkout"].includes(String(value.taxDisplay)) ||
    typeof value.taxNotice !== "string" || value.taxNotice.trim().length === 0 ||
    value.priceDisplaySource !== "base" || typeof value.localizedAtCheckout !== "boolean" ||
    !["stripe", "apple", "google", "admin", "none"].includes(String(value.billingManagedBy)) ||
    typeof value.checkoutAvailable !== "boolean" || typeof value.portalAvailable !== "boolean" ||
    !["monthly", "yearly", "none"].includes(String(value.currentPlan)) ||
    !["renews", "ends", "none"].includes(String(value.renewalBehavior)) ||
    (value.currentPeriodEndMs !== null && (!Number.isSafeInteger(value.currentPeriodEndMs) || Number(value.currentPeriodEndMs) < 0)) ||
    !Array.isArray(plans) || plans.length !== 2
  ) throw new Error("Invalid billing context values.");

  const parsedPlans = plans.map((plan): LocalizedBillingPlan => {
    if (!isRecord(plan) || !hasExactKeys(plan, planKeys)) throw new Error("Invalid billing plan contract.");
    if (
      !["monthly", "yearly"].includes(String(plan.id)) || !["month", "year"].includes(String(plan.interval)) ||
      typeof plan.currency !== "string" || !/^[A-Z]{3}$/.test(plan.currency) ||
      !Number.isSafeInteger(plan.unitAmount) || Number(plan.unitAmount) < 0 ||
      typeof plan.formattedPrice !== "string" || plan.formattedPrice.trim().length === 0 ||
      (plan.formattedEquivalent !== null && typeof plan.formattedEquivalent !== "string") ||
      !Number.isSafeInteger(plan.savingsPercent) || Number(plan.savingsPercent) < 0
    ) throw new Error("Invalid billing plan values.");
    const id = plan.id as BillingPlanId;
    const interval = plan.interval as "month" | "year";
    if ((id === "monthly" && interval !== "month") || (id === "yearly" && interval !== "year")) {
      throw new Error("Billing plan interval does not match its id.");
    }
    return {
      id,
      interval,
      currency: plan.currency,
      unitAmount: plan.unitAmount as number,
      formattedPrice: plan.formattedPrice,
      formattedEquivalent: plan.formattedEquivalent as string | null,
      savingsPercent: plan.savingsPercent as number,
    };
  });
  if (
    new Set(parsedPlans.map((plan) => plan.id)).size !== 2 ||
    parsedPlans.some((plan) => plan.currency !== value.currency) ||
    (value.currentPlan === "none" && (value.renewalBehavior !== "none" || value.currentPeriodEndMs !== null)) ||
    (value.currentPlan !== "none" && value.currentPeriodEndMs === null)
  ) throw new Error("Billing plans or lifecycle state are inconsistent.");
  return {
    countryCode: value.countryCode as string | null,
    currency: value.currency,
    taxDisplay: value.taxDisplay as PremiumBillingContext["taxDisplay"],
    taxNotice: value.taxNotice,
    priceDisplaySource: "base",
    localizedAtCheckout: value.localizedAtCheckout,
    billingManagedBy: value.billingManagedBy as BillingManager,
    checkoutAvailable: value.checkoutAvailable,
    portalAvailable: value.portalAvailable,
    currentPlan: value.currentPlan as PremiumBillingContext["currentPlan"],
    renewalBehavior: value.renewalBehavior as PremiumBillingContext["renewalBehavior"],
    currentPeriodEndMs: value.currentPeriodEndMs as number | null,
    plans: parsedPlans,
  };
}

export function parseBillingUrl(value: unknown): string {
  if (!isRecord(value) || !hasExactKeys(value, ["url"]) || typeof value.url !== "string") throw new Error("Invalid billing link contract.");
  const url = new URL(value.url);
  if (url.protocol !== "https:") throw new Error("Invalid billing link.");
  return url.toString();
}

export function countryCodeFromLocale(locale: string): string | undefined {
  const match = locale.replace("_", "-").match(/-([A-Za-z]{2})(?:-|$)/);
  return match?.[1]?.toUpperCase();
}
