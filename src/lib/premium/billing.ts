import { httpsCallable } from "firebase/functions";

import { getFirebaseFunctions } from "@/lib/firebase/functions";
import {
  parseBillingUrl,
  parsePremiumBillingContext,
  type BillingPlanId,
  type PremiumBillingContext,
} from "@/lib/premium/billing-contract";

export * from "@/lib/premium/billing-contract";

export async function getPremiumBillingContext(countryCode?: string): Promise<PremiumBillingContext> {
  const callable = httpsCallable(getFirebaseFunctions(), "getPremiumBillingContext");
  return parsePremiumBillingContext((await callable(countryCode ? { countryCode } : {})).data);
}

export async function createPremiumCheckoutSession(plan: BillingPlanId) {
  const callable = httpsCallable(getFirebaseFunctions(), "createPremiumCheckoutSession");
  return parseBillingUrl((await callable({ plan })).data);
}

export async function createPremiumPortalSession() {
  const callable = httpsCallable(getFirebaseFunctions(), "createPremiumPortalSession");
  return parseBillingUrl((await callable({})).data);
}
