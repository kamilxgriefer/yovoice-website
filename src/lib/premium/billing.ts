import { httpsCallable } from "firebase/functions";

import { getFirebaseFunctions } from "@/lib/firebase/functions";
import {
  buildPremiumCheckoutRequest,
  parseBillingUrl,
  parsePremiumBillingContext,
  type BillingPlanId,
  type PremiumPaymentMethod,
  type PremiumBillingContext,
} from "@/lib/premium/billing-contract";

export * from "@/lib/premium/billing-contract";

export async function getPremiumBillingContext(countryCode?: string): Promise<PremiumBillingContext> {
  const callable = httpsCallable(getFirebaseFunctions(), "getPremiumBillingContext");
  return parsePremiumBillingContext((await callable(countryCode ? { countryCode } : {})).data);
}

export async function createPremiumCheckoutSession(
  plan: BillingPlanId,
  paymentMethod?: PremiumPaymentMethod,
) {
  const callable = httpsCallable(getFirebaseFunctions(), "createPremiumCheckoutSession");
  return parseBillingUrl(
    (await callable(buildPremiumCheckoutRequest(plan, paymentMethod))).data,
  );
}

export async function createPremiumPortalSession() {
  const callable = httpsCallable(getFirebaseFunctions(), "createPremiumPortalSession");
  return parseBillingUrl((await callable({})).data);
}
