"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, CreditCard, RefreshCw, ShieldCheck } from "lucide-react";

import { PremiumBadge } from "@/components/premium/premium-badge";
import { useEntitlements } from "@/hooks/use-entitlements";
import { useAuth } from "@/hooks/use-auth";
import {
  countryCodeFromLocale,
  createPremiumCheckoutSession,
  createPremiumPortalSession,
  getPremiumBillingContext,
  type BillingPlanId,
  type PremiumBillingContext,
} from "@/lib/premium/billing";

function friendlyBillingError(error: unknown, action: "checkout" | "portal") {
  const reason =
    typeof error === "object" && error !== null && "details" in error
      ? (error as { details?: { reason?: unknown } }).details?.reason
      : null;
  if (reason === "billing-managed-elsewhere") {
    return "This subscription is managed by your app store. Open its subscription settings to make changes.";
  }
  if (reason === "stripe-customer-missing") {
    return "We couldn’t find a billing profile for this subscription. Contact support if this keeps happening.";
  }
  if (reason === "billing-not-configured") {
    return "Billing is temporarily unavailable. Please try again later.";
  }
  if (reason === "stripe-subscription-exists") {
    return "You already have a web subscription. Open subscription management to change it.";
  }
  if (reason === "checkout-in-progress") {
    return "A checkout is already in progress. Finish it or try again in a moment.";
  }
  return action === "portal"
    ? "We couldn’t open subscription management. Please try again."
    : "We couldn’t open checkout. Please try again.";
}

export function PremiumManageView() {
  const { user, loading: authLoading } = useAuth();
  const { entitlements, loading: entitlementsLoading } = useEntitlements();
  const [billing, setBilling] = useState<PremiumBillingContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<BillingPlanId | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const countryCode = countryCodeFromLocale(navigator.language);
      setBilling(await getPremiumBillingContext(countryCode));
    } catch {
      setBilling(null);
      setError("We couldn’t load plan pricing. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getPremiumBillingContext(countryCodeFromLocale(navigator.language)).then(
      (context) => {
        if (active) {
          setBilling(context);
          setLoading(false);
        }
      },
      () => {
        if (active) {
          setError("We couldn’t load plan pricing. Check your connection and try again.");
          setLoading(false);
        }
      },
    );
    return () => {
      active = false;
    };
  }, []);

  async function openPortal() {
    if (busy) return;
    setBusy("portal");
    setError(null);
    try {
      window.location.assign(await createPremiumPortalSession());
    } catch (caught) {
      setError(friendlyBillingError(caught, "portal"));
      setBusy(null);
    }
  }

  async function choosePlan(plan: BillingPlanId) {
    if (busy) return;
    setBusy(plan);
    setError(null);
    try {
      window.location.assign(await createPremiumCheckoutSession(plan));
    } catch (caught) {
      setError(friendlyBillingError(caught, "checkout"));
      setBusy(null);
    }
  }

  if (loading || entitlementsLoading || authLoading) {
    return (
      <main className="mx-auto flex min-h-[62vh] max-w-[800px] items-center justify-center px-5">
        <div className="size-9 animate-spin rounded-full border-2 border-white/15 border-t-fuchsia-400" aria-label="Loading subscription" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[62vh] max-w-[520px] flex-col items-center justify-center px-5 text-center">
        <CreditCard className="size-10 text-[#d3a5ff]" aria-hidden />
        <h1 className="mt-5 text-2xl font-bold text-white">Sign in to manage Premium</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">Your subscription and billing portal are private to your account.</p>
        <Link href={`/login?redirect=${encodeURIComponent("/premium/manage")}`} className="premium-button focus-ring mt-6 inline-flex min-h-12 items-center justify-center px-6">Sign in</Link>
      </main>
    );
  }

  if (!billing) {
    return (
      <main className="mx-auto flex min-h-[62vh] max-w-[520px] flex-col items-center justify-center px-5 text-center">
        <CreditCard className="size-10 text-[#d3a5ff]" aria-hidden />
        <h1 className="mt-5 text-2xl font-bold text-white">Plans are temporarily unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">{error}</p>
        <button type="button" onClick={() => void load()} className="premium-button focus-ring mt-6 inline-flex min-h-12 items-center gap-2 px-6">
          <RefreshCw className="size-4" aria-hidden /> Try again
        </button>
      </main>
    );
  }

  const currentPlan = billing.currentPlan !== "none" ? billing.currentPlan : entitlements.plan;
  const managerLabel = {
    stripe: "Managed securely by Stripe",
    apple: "Managed in the App Store",
    google: "Managed in Google Play",
    admin: "Complimentary access",
    none: "Billing details unavailable",
  }[billing.billingManagedBy];
  const storeManagementUrl =
    billing.billingManagedBy === "apple"
      ? "https://apps.apple.com/account/subscriptions"
      : billing.billingManagedBy === "google"
        ? "https://play.google.com/store/account/subscriptions"
        : null;
  const checkoutAvailable =
    billing.checkoutAvailable && billing.billingManagedBy !== "admin";
  const billingPeriodEnd = billing.currentPeriodEndMs
    ? new Date(billing.currentPeriodEndMs)
    : null;

  return (
    <main className="mx-auto w-full max-w-[800px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <header className="text-center">
        <PremiumBadge />
        <h1 className="mt-5 text-4xl font-bold tracking-[-0.045em] text-white sm:text-5xl">Manage Premium</h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-white/65">
          See your current plan, compare plans, or open secure billing to change or cancel.
        </p>
      </header>

      <section aria-labelledby="current-plan" className="glass-panel mt-10 rounded-[26px] border border-fuchsia-400/30 p-5 sm:p-7">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d3a5ff]">Current plan</p>
            <h2 id="current-plan" className="mt-2 text-xl font-bold text-white">
              {currentPlan === "yearly" ? "YO Voice Premium · Yearly" : currentPlan === "monthly" ? "YO Voice Premium · Monthly" : "YO Voice Free"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              {billing.billingManagedBy === "admin"
                ? "Complimentary Premium access"
                : billing.renewalBehavior === "ends" && billingPeriodEnd
                  ? `Ends ${billingPeriodEnd.toLocaleDateString()}`
                  : billing.renewalBehavior === "renews" && billingPeriodEnd
                    ? `Renews ${billingPeriodEnd.toLocaleDateString()}`
                : currentPlan === "none" ? "No active paid subscription" : "Premium active"}
              {currentPlan !== "none" ? ` · ${managerLabel}` : ""}
            </p>
          </div>
          {billing.portalAvailable ? (
            <button type="button" disabled={busy !== null} onClick={() => void openPortal()} className="premium-button focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 disabled:opacity-60 sm:w-auto">
              <ShieldCheck className="size-4" aria-hidden />
              {busy === "portal" ? "Opening…" : "Change or cancel"}
            </button>
          ) : storeManagementUrl ? (
            <a href={storeManagementUrl} className="premium-button focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 sm:w-auto">
              <ShieldCheck className="size-4" aria-hidden />
              Open store subscriptions
            </a>
          ) : null}
        </div>
      </section>

      {error ? <p role="alert" className="mt-5 rounded-2xl border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-100">{error}</p> : null}

      <section aria-labelledby="available-plans" className="mt-10">
        <h2 id="available-plans" className="text-xl font-bold text-white">Available plans</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {billing.plans.map((plan) => {
            const active = plan.id === currentPlan;
            return (
              <article key={plan.id} className={`glass-panel rounded-[24px] p-5 sm:p-6 ${active ? "border-fuchsia-400/50" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.id === "yearly" ? "Yearly" : "Monthly"}</h3>
                    <p className="mt-2 text-3xl font-bold text-white">{plan.formattedPrice}<span className="text-sm font-semibold text-white/50"> / {plan.interval}</span></p>
                    {billing.localizedAtCheckout ? <p className="mt-2 text-xs leading-5 text-white/55">Base price · final local currency at checkout</p> : null}
                  </div>
                  {active ? <span className="rounded-full bg-fuchsia-400/15 px-3 py-1 text-xs font-bold text-fuchsia-200">Current</span> : null}
                </div>
                {plan.formattedEquivalent ? <p className="mt-2 text-sm text-white/60">{plan.formattedEquivalent} / month</p> : null}
                {plan.savingsPercent > 0 ? <p className="mt-2 text-sm font-semibold text-emerald-300">Save {plan.savingsPercent}%</p> : null}
                <p className="mt-5 flex items-center gap-2 text-sm text-white/65"><Check className="size-4 text-fuchsia-300" aria-hidden />All Premium features</p>
                <button type="button" disabled={active || !checkoutAvailable || busy !== null} onClick={() => void choosePlan(plan.id)} className="focus-ring mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 text-sm font-bold text-white transition hover:border-fuchsia-400/50 disabled:cursor-not-allowed disabled:opacity-50">
                  {active ? "Your current plan" : busy === plan.id ? "Opening…" : "Choose plan"}
                  {!active ? <ArrowRight className="size-4" aria-hidden /> : null}
                </button>
              </article>
            );
          })}
        </div>
        <p className="mt-5 text-center text-xs leading-5 text-white/55">{billing.taxNotice}</p>
      </section>
    </main>
  );
}
