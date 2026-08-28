export type BillingAction = "pricing" | "checkout" | "portal";

function billingReason(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;
  const details = "details" in error ? error.details : null;
  if (typeof details !== "object" || details === null || !("reason" in details)) {
    return null;
  }
  return typeof details.reason === "string" ? details.reason : null;
}

function billingCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }
  return typeof error.code === "string" ? error.code : null;
}

export function friendlyBillingError(
  error: unknown,
  action: BillingAction,
): string {
  const reason = billingReason(error);
  const code = billingCode(error);

  if (reason === "billing-managed-elsewhere") {
    return "This Premium membership is managed by your app store. Use its subscription settings to make changes.";
  }
  if (reason === "stripe-customer-missing") {
    return "We couldn’t find a billing profile for this membership. Contact support if this keeps happening.";
  }
  if (reason === "billing-not-configured") {
    return "Secure billing is temporarily unavailable. No payment has been started.";
  }
  if (reason === "stripe-subscription-exists") {
    return "You already have a web subscription. Open subscription management to change it.";
  }
  if (reason === "checkout-in-progress") {
    return "A checkout is already being prepared. Try again in a moment.";
  }
  if (reason === "email-verification-required") {
    return "Verify your email address before starting a Premium purchase.";
  }
  if (
    reason === "payment-method-unavailable" ||
    reason === "unsupported-payment-method" ||
    reason === "paypal-not-enabled"
  ) {
    return "That payment method isn’t available right now. Choose another method or try again later.";
  }
  if (reason === "blik-yearly-only") {
    return "BLIK is available as a prepaid Premium purchase without automatic renewal.";
  }
  if (code === "functions/unauthenticated" || code === "unauthenticated") {
    return "Sign in before starting a Premium purchase.";
  }
  if (
    code === "functions/resource-exhausted" ||
    code === "resource-exhausted"
  ) {
    return "Too many billing attempts. Wait a moment and try again.";
  }
  if (code === "functions/not-found" || code === "not-found") {
    return action === "pricing"
      ? "Secure checkout isn’t connected right now. The standard prices below are still available to review."
      : "Secure checkout isn’t connected right now. No payment has been started.";
  }

  if (action === "pricing") {
    return "We couldn’t confirm secure checkout availability. The standard prices below are still available to review.";
  }
  if (action === "portal") {
    return "We couldn’t open subscription management. Please try again.";
  }
  return "We couldn’t open secure checkout. No payment has been started; please try again.";
}
