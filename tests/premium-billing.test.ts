import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  accountCapabilityAttemptIsCurrent,
  billingContextForAccount,
  billingContextResolvedForAccount,
  buildPremiumCheckoutRequest,
  countryCodeFromLocale,
  parseBillingUrl,
  parsePremiumBillingContext,
} from "../src/lib/premium/billing-contract.ts";
import { friendlyBillingError } from "../src/lib/premium/billing-errors.ts";
import {
  blikPrepaidOffers,
  paymentOptionsForPlan,
  premiumFallbackBillingPlans,
} from "../src/config/premium.ts";

const valid = {
  countryCode: "PL",
  currency: "PLN",
  taxDisplay: "included",
  taxNotice: "VAT is included where required.",
  priceDisplaySource: "base",
  localizedAtCheckout: true,
  billingManagedBy: "stripe",
  checkoutAvailable: false,
  portalAvailable: true,
  currentPlan: "monthly",
  renewalBehavior: "renews",
  currentPeriodEndMs: 1_800_000_000_000,
  plans: [
    {
      id: "monthly",
      interval: "month",
      currency: "PLN",
      unitAmount: 1999,
      formattedPrice: "19,99 zł",
      formattedEquivalent: null,
      savingsPercent: 0,
    },
    {
      id: "yearly",
      interval: "year",
      currency: "PLN",
      unitAmount: 19999,
      formattedPrice: "199,99 zł",
      formattedEquivalent: "16,67 zł",
      savingsPercent: 17,
    },
  ],
};

test("strictly accepts a complete localized billing context", () => {
  const parsed = parsePremiumBillingContext(valid);
  assert.equal(parsed.plans[0]?.formattedPrice, "19,99 zł");
  assert.equal(parsed.plans[1]?.savingsPercent, 17);
  assert.equal(parsed.renewalBehavior, "renews");
});

test("rejects extra keys and unsafe billing values", () => {
  assert.throws(() => parsePremiumBillingContext({ ...valid, priceId: "secret" }));
  assert.throws(() =>
    parsePremiumBillingContext({
      ...valid,
      currentPeriodEndMs: 1.5,
    }),
  );
  assert.throws(() =>
    parsePremiumBillingContext({
      ...valid,
      plans: [valid.plans[0], valid.plans[0]],
    }),
  );
  assert.throws(() =>
    parsePremiumBillingContext({
      ...valid,
      currentPlan: "unexpected-plan",
    }),
  );
  assert.throws(() =>
    parsePremiumBillingContext({
      ...valid,
      currentPlan: "none",
      renewalBehavior: "none",
    }),
  );
  assert.throws(() =>
    parsePremiumBillingContext({
      ...valid,
      countryCode: "pl",
    }),
  );
  assert.throws(() =>
    parsePremiumBillingContext({
      ...valid,
      plans: [
        { ...valid.plans[0], interval: "year" },
        valid.plans[1],
      ],
    }),
  );
  assert.throws(() =>
    parsePremiumBillingContext({
      ...valid,
      plans: [
        { ...valid.plans[0], currency: "EUR" },
        valid.plans[1],
      ],
    }),
  );
});

test("extracts only explicit two-letter region subtags", () => {
  assert.equal(countryCodeFromLocale("pl-PL"), "PL");
  assert.equal(countryCodeFromLocale("nl_NL"), "NL");
  assert.equal(countryCodeFromLocale("en"), undefined);
  assert.equal(countryCodeFromLocale("en-Latn-US"), "US");
});

test("billing links accept only exact Stripe Checkout and Billing origins", () => {
  assert.equal(
    parseBillingUrl({ url: "https://billing.stripe.com/session" }),
    "https://billing.stripe.com/session",
  );
  assert.equal(
    parseBillingUrl({ url: "https://checkout.stripe.com/c/pay/test" }),
    "https://checkout.stripe.com/c/pay/test",
  );
  assert.throws(() => parseBillingUrl({ url: "http://billing.example/test" }));
  assert.throws(() => parseBillingUrl({ url: "https://evil.example/checkout" }));
  assert.throws(() =>
    parseBillingUrl({ url: "https://billing.stripe.com.evil.example/test" }),
  );
  assert.throws(() =>
    parseBillingUrl({ url: "https://attacker@billing.stripe.com/test" }),
  );
  assert.throws(() =>
    parseBillingUrl({ url: "https://billing.stripe.com/test", priceId: "no" }),
  );
});

test("billing context is rendered only for the account that requested it", () => {
  const context = parsePremiumBillingContext(valid);
  const snapshot = { accountIdentity: "uid-a", context };

  assert.equal(billingContextForAccount(snapshot, "uid-a"), context);
  assert.equal(billingContextResolvedForAccount(snapshot, "uid-a"), true);
  assert.equal(billingContextForAccount(snapshot, "uid-b"), null);
  assert.equal(billingContextResolvedForAccount(snapshot, "uid-b"), false);
  assert.equal(billingContextForAccount(snapshot, null), null);
});

test("in-flight billing capabilities expire on account, generation, Auth, or mount changes", () => {
  const attempt = { accountIdentity: "uid-a", generation: 3 };

  assert.equal(
    accountCapabilityAttemptIsCurrent(attempt, "uid-a", 3, "uid-a", true),
    true,
  );
  assert.equal(
    accountCapabilityAttemptIsCurrent(attempt, "uid-b", 3, "uid-b", true),
    false,
  );
  assert.equal(
    accountCapabilityAttemptIsCurrent(attempt, "uid-a", 4, "uid-a", true),
    false,
  );
  assert.equal(
    accountCapabilityAttemptIsCurrent(attempt, "uid-a", 3, "uid-b", true),
    false,
  );
  assert.equal(
    accountCapabilityAttemptIsCurrent(attempt, "uid-a", 3, "uid-a", false),
    false,
  );
});

test("an expired server lifecycle stays free and can be purchased again", () => {
  const expired = parsePremiumBillingContext({
    ...valid,
    billingManagedBy: "none",
    checkoutAvailable: true,
    portalAvailable: false,
    currentPlan: "none",
    renewalBehavior: "none",
    currentPeriodEndMs: null,
  });

  assert.equal(expired.currentPlan, "none");
  assert.equal(expired.checkoutAvailable, true);
});

test("keeps honest standard prices available without a billing response", () => {
  assert.deepEqual(premiumFallbackBillingPlans, [
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
  ]);
});

test("offers Stripe card or PayPal plus non-renewing BLIK on both plans", () => {
  assert.deepEqual(
    paymentOptionsForPlan("monthly").map((option) => option.id),
    ["recurring", "blik"],
  );
  assert.deepEqual(
    paymentOptionsForPlan("yearly").map((option) => option.id),
    ["recurring", "blik"],
  );
  assert.deepEqual(blikPrepaidOffers.monthly, {
    currency: "PLN",
    unitAmount: 2600,
    formattedPrice: "26 zł",
    accessDays: 30,
    renews: false,
  });
  assert.deepEqual(blikPrepaidOffers.yearly, {
    currency: "PLN",
    unitAmount: 26000,
    formattedPrice: "260 zł",
    accessDays: 365,
    renews: false,
  });
  assert.match(
    paymentOptionsForPlan("monthly").at(-1)?.description ?? "",
    /no renewal/,
  );
});

test("checkout requests match the recurring or BLIK backend contract", () => {
  assert.deepEqual(buildPremiumCheckoutRequest("monthly"), {
    plan: "monthly",
    paymentMethod: "recurring",
  });
  assert.deepEqual(buildPremiumCheckoutRequest("yearly", "recurring"), {
    plan: "yearly",
    paymentMethod: "recurring",
  });
  assert.deepEqual(buildPremiumCheckoutRequest("monthly", "blik"), {
    plan: "monthly",
    paymentMethod: "blik",
  });
});

test("billing errors distinguish disabled checkout from account actions", () => {
  assert.match(
    friendlyBillingError({ code: "functions/not-found" }, "pricing"),
    /standard prices below/,
  );
  assert.match(
    friendlyBillingError(
      { details: { reason: "email-verification-required" } },
      "checkout",
    ),
    /Verify your email/,
  );
  assert.match(
    friendlyBillingError(
      { details: { reason: "unsupported-payment-method" } },
      "checkout",
    ),
    /payment method/,
  );
  assert.match(
    friendlyBillingError(new Error("offline"), "checkout"),
    /No payment has been started/,
  );
});

test("premium page uses fallback plans and bounds checkout confirmation", async () => {
  const source = await readFile(
    new URL(
      "../src/components/premium/premium-plans-view.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    source,
    /billing\?\.plans \?\? premiumFallbackBillingPlans/,
  );
  assert.match(source, /CHECKOUT_CONFIRMATION_TIMEOUT_MS = 15_000/);
  assert.match(source, /billing !== null && billing\.checkoutAvailable/);
  assert.match(source, /No additional payment will be started/);
  assert.match(source, /access through/);
  assert.doesNotMatch(source, /renews or ends/);
  assert.match(source, /scrollIntoView/);
  assert.match(source, /tabIndex=\{-1\}/);
  assert.match(source, /billingContextForAccount/);
  assert.match(source, /user\?\.uid/);
  assert.match(source, /role="status"/);
  assert.match(source, /checkoutInFlightRef\.current/);
  assert.match(source, /capabilityGuard\.isCurrent\(attempt\)/);
});

test("Premium management trusts the server lifecycle and reuses the full payment selector", async () => {
  const source = await readFile(
    new URL(
      "../src/components/premium/premium-manage-view.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /const currentPlan = billing\.currentPlan/);
  assert.doesNotMatch(source, /entitlements\.plan/);
  assert.match(source, /billingContextForAccount/);
  assert.match(source, /\[authLoading, reloadKey, user\?\.uid\]/);
  assert.match(source, /href=\{`\/premium\?plan=\$\{plan\.id\}`\}/);
  assert.match(source, /Choose plan and payment method/);
  assert.match(source, /role="status"/);
  assert.match(source, /portalInFlightRef\.current/);
  assert.match(source, /capabilityGuard\.isCurrent\(attempt\)/);
  assert.match(
    source,
    /billing\.billingManagedBy === "admin" && currentPlan !== "none"/,
  );
});
