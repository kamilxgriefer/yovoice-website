"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  AudioLines,
  Check,
  Crown,
  Sparkles,
  UserRound,
} from "lucide-react";

import { PremiumBadge } from "@/components/premium/premium-badge";
import { PremiumRing } from "@/components/premium/premium-ring";
import {
  isPremiumPlanId,
  premiumIncludedFeatures,
  premiumPlanChecklist,
  premiumPlans as premiumPlanCopy,
  type PremiumPlan,
  type PremiumPlanId,
} from "@/config/premium";
import { useAuth } from "@/hooks/use-auth";
import { useEntitlements } from "@/hooks/use-entitlements";
import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";
import {
  countryCodeFromLocale,
  createPremiumCheckoutSession,
  getPremiumBillingContext,
  type PremiumBillingContext,
} from "@/lib/premium/billing";

/**
 * The /premium plans experience. One page, four states:
 *
 *  - anonymous  → plan cards; choosing routes through login with the
 *                 chosen plan preserved (?plan=), so nobody picks twice
 *  - free user  → plan cards; choosing opens the checkout boundary
 *  - premium    → status card (plan, renewal, grace warnings) + manage
 *  - ?checkout=success → the welcome state (the future provider's
 *                 return URL — also what an entitlement flip shows live)
 *
 * The "checkout boundary" is deliberately honest: web billing has no
 * provider configured yet, so instead of a fake payment form the flow
 * ends with exactly what's true — Premium purchases open inside
 * YO Voice first — while every step before it (selection, auth
 * round-trip, entitlement awareness) is real and wired.
 */
export function PremiumPlansView() {
  return (
    <Suspense fallback={null}>
      <PremiumPlansContent />
    </Suspense>
  );
}

function PremiumPlansContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { entitlements, loading: entitlementsLoading } = useEntitlements();
  const [billing, setBilling] = useState<PremiumBillingContext | null>(null);
  const [billingError, setBillingError] = useState(false);

  // A plan carried through the login round-trip (?plan=...) selects
  // itself on arrival — the visitor never has to choose twice. Lazy
  // initializer instead of an effect: the param is present on mount.
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlanId | null>(
    () => {
      const fromUrl = searchParams.get("plan");
      return isPremiumPlanId(fromUrl) ? fromUrl : null;
    },
  );

  useEffect(() => {
    let active = true;
    getPremiumBillingContext(countryCodeFromLocale(navigator.language)).then(
      (context) => {
        if (active) setBilling(context);
      },
      () => {
        if (active) setBillingError(true);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  function choosePlan(plan: PremiumPlanId) {
    if (!user && !authLoading) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/premium?plan=${plan}`)}`,
      );
      return;
    }
    setSelectedPlan(plan);
  }

  const showWelcome =
    searchParams.get("checkout") === "success" || entitlements.isPremium;

  if (!entitlementsLoading && showWelcome && entitlements.isPremium) {
    return <PremiumActiveState />;
  }

  if (!billing) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 text-center">
        {billingError ? (
          <>
            <h1 className="text-2xl font-bold text-white">Local pricing is temporarily unavailable</h1>
            <p className="mt-3 text-sm leading-6 text-white/65">Please check your connection and try again.</p>
          </>
        ) : (
          <div className="size-9 animate-spin rounded-full border-2 border-white/15 border-t-fuchsia-400" aria-label="Loading local prices" />
        )}
      </div>
    );
  }

  const displayPlans = billing.plans.map((localized) => {
    const copy = premiumPlanCopy.find((plan) => plan.id === localized.id)!;
    return {
      ...copy,
      price: localized.formattedPrice,
      period: `/ ${localized.interval}`,
      equivalent: localized.formattedEquivalent
        ? `${localized.formattedEquivalent} / month`
        : undefined,
      savings:
        localized.savingsPercent > 0
          ? `Save ${localized.savingsPercent}%`
          : undefined,
    };
  });

  return (
    <div className="relative mx-auto w-full max-w-[900px] px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
      <div className="mx-auto max-w-xl text-center">
        <PremiumBadge />
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">
          Choose <span className="text-gradient">your plan</span>
        </h1>
        <p className="mt-4 text-[15px] leading-7 text-white/50">
          Unlock the full YO Voice experience. Plans differ only in billing
          period — cancel any time.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2">
        {displayPlans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => choosePlan(plan.id)}
            aria-pressed={selectedPlan === plan.id}
            className={`focus-ring glass-panel group relative rounded-[28px] p-7 text-left transition duration-300 hover:-translate-y-1 ${
              plan.highlight
                ? "border border-fuchsia-400/50 shadow-[0_0_44px_rgba(192,38,255,0.22)]"
                : "hover:border-white/20"
            } ${selectedPlan === plan.id ? "ring-2 ring-fuchsia-400" : ""}`}
          >
            {plan.highlight ? (
              <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#7b2ff7] to-[#c026ff] px-3.5 py-1.5 text-[11px] font-bold text-white shadow-[0_0_14px_rgba(192,38,255,0.45)]">
                <Crown className="size-3" aria-hidden />
                Best value
              </span>
            ) : null}
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/40">
              {plan.name}
            </p>
            <p className="mt-3 text-4xl font-bold text-white">
              {plan.price}
              <span className="text-base font-semibold text-white/40">
                {" "}
                {plan.period}
              </span>
            </p>
            {billing.localizedAtCheckout ? (
              <p className="mt-2 text-xs leading-5 text-white/55">
                Base price · final local currency at checkout
              </p>
            ) : null}
            {plan.equivalent ? (
              <p className="mt-2 text-sm text-white/50">{plan.equivalent}</p>
            ) : null}
            {plan.savings ? (
              <span className="mt-3 inline-flex rounded-full bg-gradient-to-r from-[#7b2ff7] to-[#c026ff] px-3 py-1 text-[11px] font-bold text-white">
                {plan.savings}
              </span>
            ) : null}
            <ul className="mt-5 space-y-2 border-t border-white/[0.07] pt-5">
              {premiumPlanChecklist.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <Check
                    className={`size-3.5 shrink-0 ${
                      plan.highlight ? "text-[#e879f9]" : "text-[#5ce1e6]"
                    }`}
                    aria-hidden
                  />
                  <span className="text-[13px] text-white/65">{item}</span>
                </li>
              ))}
            </ul>
            <span className="premium-button mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2">
              {plan.cta}
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </button>
        ))}
      </div>

      {selectedPlan ? (
        <CheckoutBoundary
          plan={selectedPlan}
          billing={billing}
          displayPlans={displayPlans}
        />
      ) : null}

      <div id="included" className="mx-auto mt-16 max-w-xl scroll-mt-24">
        <h2 className="text-[15px] font-bold text-white">
          Everything Premium includes:
        </h2>
        <ul className="mt-4 space-y-1 rounded-3xl border border-white/[0.07] bg-white/[0.02] px-5 py-3">
          {premiumIncludedFeatures.map((feature, index) => {
            const Icon = includedIcons[index] ?? Sparkles;
            return (
              <li key={feature} className="flex items-center gap-3.5 py-2.5">
                <Icon className="size-[18px] shrink-0 text-[#d3a5ff]" aria-hidden />
                <span className="text-sm font-medium leading-6 text-[#efeaf7]">
                  {feature}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 text-center text-xs leading-5 text-white/35">
          Cancel anytime. Everything essential on YO Voice stays free — rooms,
          chats, friends and joining Clubs. Store pricing may vary by region.
        </p>
      </div>
    </div>
  );
}

const includedIcons = [UserRound, Crown, Sparkles, AudioLines, Sparkles];

/** Stripe-hosted Checkout keeps payment details and final local pricing off-site. */
function CheckoutBoundary({
  plan,
  billing,
  displayPlans,
}: {
  plan: PremiumPlanId;
  billing: PremiumBillingContext;
  displayPlans: Array<
    PremiumPlan & {
      price: string;
      period: string;
      equivalent?: string;
      savings?: string;
    }
  >;
}) {
  const planConfig = displayPlans.find((candidate) => candidate.id === plan);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setBusy(true);
    setError(null);
    try {
      window.location.assign(await createPremiumCheckoutSession(plan));
    } catch {
      setError("We couldn’t open checkout. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div
      role="status"
      className="glass-panel mx-auto mt-6 max-w-xl rounded-[24px] border border-fuchsia-400/25 p-6 text-center"
    >
      <p className="text-sm font-bold text-white">
        {planConfig?.name} plan selected — {planConfig?.price}
        {planConfig?.period}
      </p>
      <p className="mt-2 text-sm leading-6 text-white/60">{billing.taxNotice}</p>
      {error ? <p role="alert" className="mt-3 text-sm text-rose-200">{error}</p> : null}
      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          disabled={!billing.checkoutAvailable || busy}
          onClick={() => void checkout()}
          className="premium-button focus-ring min-h-12 inline-flex items-center justify-center px-6 disabled:opacity-50"
        >
          {busy ? "Opening secure checkout…" : "Continue to checkout"}
        </button>
        <Link
          href="/download"
          className="focus-ring inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 px-6 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:text-white"
        >
          Get the app
        </Link>
      </div>
    </div>
  );
}

/** Premium members see their state, never a purchase pitch. */
function PremiumActiveState() {
  const { entitlements } = useEntitlements();
  const periodEnd = entitlements.currentPeriodEnd;

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-center px-5 pb-24 pt-16 text-center sm:pt-24">
      <PremiumRing size={104}>
        <Image
          src="/logos/yo-voice-symbol.png"
          alt=""
          width={62}
          height={64}
          className="object-contain"
        />
      </PremiumRing>
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.04em] text-white">
        You&apos;re on <span className="text-gradient">YO Voice Premium</span>
      </h1>
      <p className="mt-3 text-[15px] leading-7 text-white/50">
        Your voice just got more room to grow.
      </p>

      <div className="glass-panel mt-8 w-full rounded-[22px] p-5 text-sm text-white/60">
        <p>
          <span className="font-semibold text-white">
            {entitlements.plan === "yearly" ? "Yearly" : "Monthly"} plan
          </span>
          {periodEnd
            ? ` · renews or ends ${periodEnd.toLocaleDateString()}`
            : null}
        </p>
        {entitlements.inGracePeriod ? (
          <p className="mt-2 text-amber-300">
            There&apos;s a payment issue — check your billing details to keep
            Premium active.
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={APP_ENTRY_PATH}
          className="premium-button focus-ring min-h-13 inline-flex items-center justify-center px-7"
        >
          Open YO Voice
        </Link>
        <Link
          href="/premium/manage"
          className="focus-ring inline-flex min-h-13 items-center justify-center rounded-2xl border border-white/15 px-6 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:text-white"
        >
          Manage subscription
        </Link>
      </div>
    </div>
  );
}
