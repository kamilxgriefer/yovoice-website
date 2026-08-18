import assert from "node:assert/strict";
import test from "node:test";

import {
  countryCodeFromLocale,
  parseBillingUrl,
  parsePremiumBillingContext,
} from "../src/lib/premium/billing-contract.ts";

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

test("billing links accept only the exact HTTPS response", () => {
  assert.equal(
    parseBillingUrl({ url: "https://billing.stripe.com/session" }),
    "https://billing.stripe.com/session",
  );
  assert.throws(() => parseBillingUrl({ url: "http://billing.example/test" }));
  assert.throws(() =>
    parseBillingUrl({ url: "https://billing.stripe.com/test", priceId: "no" }),
  );
});
