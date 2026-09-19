"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, CreditCard, RefreshCw, ShieldCheck } from "lucide-react";

import { PremiumBadge } from "@/components/premium/premium-badge";
import { useAccountCapabilityGuard } from "@/hooks/use-account-capability-guard";
import { useAuth } from "@/hooks/use-auth";
import { friendlyBillingError } from "@/lib/premium/billing-errors";
import {
  countryCodeFromLocale,
  createPremiumPortalSession,
  getPremiumBillingContext,
} from "@/lib/premium/billing";
import {
  billingContextForAccount,
  billingContextResolvedForAccount,
  type AccountScopedBillingContext,
} from "@/lib/premium/billing-contract";

export function PremiumManageView() {
  const { user, loading: authLoading } = useAuth();
  const [billingSnapshot, setBillingSnapshot] =
    useState<AccountScopedBillingContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"portal" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const accountIdentity = authLoading ? undefined : (user?.uid ?? null);
  const billing =
    accountIdentity === undefined
      ? null
      : billingContextForAccount(billingSnapshot, accountIdentity);
  const billingResolved =
    accountIdentity !== undefined &&
    billingContextResolvedForAccount(billingSnapshot, accountIdentity);
  const capabilityGuard = useAccountCapabilityGuard(accountIdentity);
  const portalInFlightRef = useRef(false);

  const load = useCallback(() => {
    setLoading(true);
    setBillingSnapshot(null);
    setError(null);
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    const requestedIdentity = user?.uid ?? null;
    getPremiumBillingContext(countryCodeFromLocale(navigator.language)).then(
      (context) => {
        if (active) {
          setBillingSnapshot({
            accountIdentity: requestedIdentity,
            context,
          });
          setError(null);
          setLoading(false);
        }
      },
      (caught) => {
        if (active) {
          setBillingSnapshot({
            accountIdentity: requestedIdentity,
            context: null,
          });
          setError(friendlyBillingError(caught, "pricing"));
          setLoading(false);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [authLoading, reloadKey, user?.uid]);

  async function openPortal() {
    if (portalInFlightRef.current) return;
    const attempt = capabilityGuard.begin();
    if (!attempt) return;
    portalInFlightRef.current = true;
    setBusy("portal");
    setError(null);
    try {
      const url = await createPremiumPortalSession();
      if (!capabilityGuard.isCurrent(attempt)) {
        if (capabilityGuard.isMounted()) {
          setBusy(null);
          setError("Your account changed. Open billing again for the current account.");
        }
        return;
      }
      window.location.assign(url);
    } catch (caught) {
      if (capabilityGuard.isMounted()) {
        setError(friendlyBillingError(caught, "portal"));
        setBusy(null);
      }
    } finally {
      portalInFlightRef.current = false;
    }
  }

  if (loading || !billingResolved || authLoading) {
    return (
      <div className="mx-auto flex min-h-[62vh] max-w-[800px] items-center justify-center px-5">
        <div role="status" aria-live="polite">
          <div className="size-9 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" aria-hidden />
          <span className="sr-only">Loading Premium subscription</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[62vh] max-w-[520px] flex-col items-center justify-center px-5 text-center">
        <CreditCard className="size-10 text-[var(--accent)]" aria-hidden />
        <h1 className="mt-5 text-2xl font-bold text-white">Sign in to manage Premium</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Your subscription and billing portal are private to your account.</p>
        <Link href={`/login?redirect=${encodeURIComponent("/premium/manage")}`} className="premium-button focus-ring mt-6">Sign in</Link>
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="mx-auto flex min-h-[62vh] max-w-[520px] flex-col items-center justify-center px-5 text-center">
        <CreditCard className="size-10 text-[var(--accent)]" aria-hidden />
        <h1 className="mt-5 text-2xl font-bold text-white">Plans are temporarily unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{error}</p>
        <button type="button" onClick={() => void load()} className="premium-button focus-ring mt-6">
          <RefreshCw className="size-4" aria-hidden /> Try again
        </button>
      </div>
    );
  }

  const currentPlan = billing.currentPlan;
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
  const billingPeriodEnd = billing.currentPeriodEndMs
    ? new Date(billing.currentPeriodEndMs)
    : null;

  return (
    <div className="mx-auto w-full max-w-[800px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <header className="text-center">
        <PremiumBadge />
        <h1 className="mt-5 text-4xl font-bold tracking-[-0.045em] text-white sm:text-5xl">Manage Premium</h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[var(--text-secondary)]">
          See your current plan, compare options, or open secure billing when
          subscription management is available.
        </p>
      </header>

      <section aria-labelledby="current-plan" className="panel mt-10 border-[var(--border-strong)] p-5 sm:p-7">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">Current plan</p>
            <h2 id="current-plan" className="mt-2 text-xl font-bold text-white">
              {currentPlan === "yearly" ? "YO Voice Premium · Yearly" : currentPlan === "monthly" ? "YO Voice Premium · Monthly" : "YO Voice Free"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {billing.billingManagedBy === "admin" && currentPlan !== "none"
                ? "Complimentary Premium access"
                : billing.renewalBehavior === "ends" && billingPeriodEnd
                  ? `Ends ${billingPeriodEnd.toLocaleDateString()}`
                  : billing.renewalBehavior === "renews" && billingPeriodEnd
                    ? `Renews ${billingPeriodEnd.toLocaleDateString()}`
                    : billing.renewalBehavior === "none" && billingPeriodEnd
                      ? billing.billingManagedBy === "stripe"
                        ? `Prepaid access ends ${billingPeriodEnd.toLocaleDateString()}`
                        : `Access through ${billingPeriodEnd.toLocaleDateString()}`
                      : currentPlan === "none"
                        ? "No active paid subscription"
                        : "Premium active"}
              {currentPlan !== "none" ? ` · ${managerLabel}` : ""}
            </p>
          </div>
          {billing.portalAvailable ? (
            <button type="button" disabled={busy !== null} onClick={() => void openPortal()} className="premium-button focus-ring w-full disabled:opacity-60 sm:w-auto">
              <ShieldCheck className="size-4" aria-hidden />
              {busy === "portal" ? "Opening…" : "Change or cancel"}
            </button>
          ) : storeManagementUrl ? (
            <a href={storeManagementUrl} className="premium-button focus-ring w-full sm:w-auto">
              <ShieldCheck className="size-4" aria-hidden />
              Open store subscriptions
            </a>
          ) : null}
        </div>
      </section>

      {error ? <p role="alert" className="status-alert mt-5" data-tone="error">{error}</p> : null}

      <section aria-labelledby="available-plans" className="mt-10">
        <h2 id="available-plans" className="text-xl font-bold text-white">Available plans</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {billing.plans.map((plan) => {
            const active = plan.id === currentPlan;
            return (
              <article key={plan.id} className={`panel p-5 sm:p-6 ${active ? "border-[var(--border-strong)]" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.id === "yearly" ? "Yearly" : "Monthly"}</h3>
                    <p className="mt-2 text-3xl font-bold text-white">{plan.formattedPrice}<span className="text-sm font-semibold text-[var(--text-tertiary)]"> / {plan.interval}</span></p>
                    {billing.localizedAtCheckout ? <p className="mt-2 text-xs leading-5 text-[var(--text-tertiary)]">Base price · final local currency at checkout</p> : null}
                  </div>
                  {active ? <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_38%,transparent)] bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--accent)]">Current</span> : null}
                </div>
                {plan.formattedEquivalent ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{plan.formattedEquivalent} / month</p> : null}
                {plan.savingsPercent > 0 ? <p className="mt-2 text-sm font-semibold text-[var(--success)]">Save {plan.savingsPercent}%</p> : null}
                <p className="mt-5 flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Check className="size-4 text-[var(--accent)]" aria-hidden />All Premium features</p>
                {active ? (
                  <button type="button" disabled className="premium-button-secondary focus-ring mt-5 w-full cursor-not-allowed opacity-50">
                    Your current plan
                  </button>
                ) : (
                  <Link
                    href={`/premium?plan=${plan.id}`}
                    className="premium-button-secondary focus-ring mt-5 w-full"
                  >
                    Choose plan and payment method
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                )}
              </article>
            );
          })}
        </div>
        <p className="mt-5 text-center text-xs leading-5 text-[var(--text-tertiary)]">{billing.taxNotice}</p>
      </section>
    </div>
  );
}
