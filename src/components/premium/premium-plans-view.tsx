"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  AudioLines,
  Check,
  Clock3,
  CreditCard,
  Crown,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { PremiumBadge } from "@/components/premium/premium-badge";
import { PremiumRing } from "@/components/premium/premium-ring";
import {
  isPremiumPlanId,
  blikPrepaidOffers,
  paymentOptionsForPlan,
  premiumFallbackBillingPlans,
  premiumIncludedFeatures,
  premiumPlanChecklist,
  premiumPlans as premiumPlanCopy,
  type PremiumPlan,
  type PremiumPlanId,
} from "@/config/premium";
import { useAccountCapabilityGuard } from "@/hooks/use-account-capability-guard";
import { useAuth } from "@/hooks/use-auth";
import { useEntitlements } from "@/hooks/use-entitlements";
import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";
import { friendlyBillingError } from "@/lib/premium/billing-errors";
import {
  billingContextForAccount,
  billingContextResolvedForAccount,
  countryCodeFromLocale,
  createPremiumCheckoutSession,
  getPremiumBillingContext,
  type AccountScopedBillingContext,
  type PremiumBillingContext,
  type PremiumPaymentMethod,
} from "@/lib/premium/billing";

const CHECKOUT_CONFIRMATION_TIMEOUT_MS = 15_000;

/**
 * The /premium plans experience. One page, four states:
 *
 *  - anonymous  → plan cards; choosing routes through login with the
 *                 chosen plan preserved (?plan=), so nobody picks twice
 *  - free user  → plan cards; choosing opens the checkout boundary
 *  - premium    → status card (plan, renewal, grace warnings) + manage
 *  - ?checkout=success → a bounded confirmation state until the trusted
 *                 entitlement snapshot catches up with the billing webhook
 *
 * Standard prices remain visible when billing is unavailable. That fallback
 * is display-only: a purchase can start only after the callable returns a
 * valid context with checkoutAvailable=true.
 */
export function PremiumPlansView() {
  return (
    <Suspense fallback={<PremiumPlansLoadingState />}>
      <PremiumPlansContent />
    </Suspense>
  );
}

function PremiumPlansLoadingState() {
  return (
    <div className="mx-auto flex min-h-[62vh] max-w-[900px] items-center justify-center px-5">
      <div role="status" aria-live="polite">
        <div className="size-9 animate-spin rounded-full border-2 border-white/15 border-t-fuchsia-400" aria-hidden />
        <span className="sr-only">Loading Premium plans</span>
      </div>
    </div>
  );
}

function PremiumPlansContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { entitlements, loading: entitlementsLoading } = useEntitlements();
  const [billingSnapshot, setBillingSnapshot] =
    useState<AccountScopedBillingContext | null>(null);
  const [billingRequestLoading, setBillingRequestLoading] = useState(true);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingReloadKey, setBillingReloadKey] = useState(0);
  const [expiredConfirmationKey, setExpiredConfirmationKey] = useState<
    string | null
  >(null);
  const checkoutBoundaryRef = useRef<HTMLDivElement>(null);
  const revealCheckoutOnSelection = useRef(
    isPremiumPlanId(searchParams.get("plan")),
  );

  const accountIdentity = authLoading ? undefined : (user?.uid ?? null);
  const billing =
    accountIdentity === undefined
      ? null
      : billingContextForAccount(billingSnapshot, accountIdentity);
  const billingResolved =
    accountIdentity !== undefined &&
    billingContextResolvedForAccount(billingSnapshot, accountIdentity);
  const billingLoading =
    authLoading || !billingResolved || billingRequestLoading;
  const visibleBillingError = billingResolved ? billingError : null;

  // A plan carried through the login round-trip (?plan=...) selects
  // itself on arrival — the visitor never has to choose twice. Lazy
  // initializer instead of an effect: the param is present on mount.
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlanId | null>(
    () => {
      const fromUrl = searchParams.get("plan");
      return isPremiumPlanId(fromUrl) ? fromUrl : null;
    },
  );

  const loadBilling = useCallback(() => {
    setBillingRequestLoading(true);
    setBillingSnapshot(null);
    setBillingError(null);
    setBillingReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    const requestedIdentity = user?.uid ?? null;
    getPremiumBillingContext(
      countryCodeFromLocale(navigator.language),
    ).then(
      (context) => {
        if (active) {
          setBillingSnapshot({
            accountIdentity: requestedIdentity,
            context,
          });
          setBillingError(null);
          setBillingRequestLoading(false);
        }
      },
      (caught) => {
        if (active) {
          setBillingSnapshot({
            accountIdentity: requestedIdentity,
            context: null,
          });
          setBillingError(friendlyBillingError(caught, "pricing"));
          setBillingRequestLoading(false);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [authLoading, billingReloadKey, user?.uid]);

  const checkoutSucceeded = searchParams.get("checkout") === "success";
  const confirmationKey = searchParams.get("session_id") ?? "checkout-success";

  useEffect(() => {
    if (!checkoutSucceeded || entitlements.isPremium) return;
    const timeout = window.setTimeout(() => {
      setExpiredConfirmationKey(confirmationKey);
    }, CHECKOUT_CONFIRMATION_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [checkoutSucceeded, confirmationKey, entitlements.isPremium]);

  function choosePlan(plan: PremiumPlanId) {
    if (authLoading) return;
    if (!billing?.checkoutAvailable) {
      revealCheckoutOnSelection.current = true;
      setSelectedPlan(plan);
      return;
    }
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/premium?plan=${plan}`)}`,
      );
      return;
    }
    revealCheckoutOnSelection.current = true;
    setSelectedPlan(plan);
  }

  useEffect(() => {
    if (!selectedPlan || !revealCheckoutOnSelection.current) return;
    revealCheckoutOnSelection.current = false;
    if (!window.matchMedia("(max-width: 639px)").matches) return;
    const frame = window.requestAnimationFrame(() => {
      checkoutBoundaryRef.current?.focus({ preventScroll: true });
      checkoutBoundaryRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedPlan]);

  if (!entitlementsLoading && entitlements.isPremium) {
    return <PremiumActiveState />;
  }

  if (checkoutSucceeded) {
    const returnPath = `/premium?${searchParams.toString()}`;
    return (
      <CheckoutConfirmationState
        authLoading={authLoading}
        signedIn={Boolean(user)}
        timedOut={expiredConfirmationKey === confirmationKey}
        signInHref={`/login?redirect=${encodeURIComponent(returnPath)}`}
      />
    );
  }

  const displayPlans = (
    billing?.plans ?? premiumFallbackBillingPlans
  ).map((localized) => {
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
          ? localized.id === "yearly" && localized.savingsPercent >= 16
            ? `2 months free · Save ${localized.savingsPercent}%`
            : `Save ${localized.savingsPercent}%`
          : undefined,
    };
  });

  return (
    <div className="relative mx-auto w-full max-w-[900px] px-5 pb-24 pt-24 sm:px-8 sm:pt-24">
      <div className="mx-auto max-w-xl text-center">
        <PremiumBadge />
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">
          Choose <span className="text-gradient">your plan</span>
        </h1>
        <p className="mt-4 text-[15px] leading-7 text-white/50">
          Premium is €6 monthly or €60 yearly. The yearly subscription includes
          two months free; BLIK is prepaid and never renews automatically.
        </p>
      </div>

      {searchParams.get("checkout") === "cancelled" ? (
        <div
          role="status"
          className="mx-auto mt-8 flex max-w-xl items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-white/65"
        >
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#d3a5ff]" aria-hidden />
          Checkout was cancelled. No new payment was started — you can choose a
          plan whenever you&apos;re ready.
        </div>
      ) : null}

      {visibleBillingError ? (
        <div
          role="status"
          className="mx-auto mt-8 flex max-w-xl flex-col gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm leading-6 text-amber-50/80 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{visibleBillingError}</span>
          <button
            type="button"
            disabled={billingLoading}
            onClick={() => void loadBilling()}
            className="focus-ring inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-100/20 px-4 text-xs font-bold text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`size-3.5 ${billingLoading ? "animate-spin" : ""}`}
              aria-hidden
            />
            Try again
          </button>
        </div>
      ) : billingLoading ? (
        <p
          role="status"
          className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold text-white/60"
        >
          <span className="size-3 animate-spin rounded-full border border-white/20 border-t-fuchsia-300" />
          Checking secure checkout availability…
        </p>
      ) : null}

      <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2">
        {displayPlans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            disabled={authLoading}
            onClick={() => choosePlan(plan.id)}
            aria-pressed={selectedPlan === plan.id}
            className={`focus-ring glass-panel group relative rounded-[28px] p-7 text-left transition duration-300 hover:-translate-y-1 disabled:cursor-wait disabled:hover:translate-y-0 ${
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
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/60">
              {plan.name}
            </p>
            <p className="mt-3 text-4xl font-bold text-white">
              {plan.price}
              <span className="text-base font-semibold text-white/60">
                {" "}
                {plan.period}
              </span>
            </p>
            {billing?.localizedAtCheckout ? (
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
              {authLoading ? "Checking your account…" : plan.cta}
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </button>
        ))}
      </div>

      {selectedPlan ? (
        <div
          ref={checkoutBoundaryRef}
          tabIndex={-1}
          role="region"
          aria-label="Premium checkout options"
          className="scroll-mt-24 rounded-[24px] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/80"
        >
          <CheckoutBoundary
            key={selectedPlan}
            plan={selectedPlan}
            billing={billing}
            billingError={visibleBillingError}
            billingLoading={billingLoading}
            displayPlans={displayPlans}
            accountIdentity={accountIdentity}
            authLoading={authLoading}
            emailVerified={user?.emailVerified === true}
            signedIn={Boolean(user)}
            onRetryBilling={loadBilling}
          />
        </div>
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
        <p className="mt-8 text-center text-xs leading-5 text-white/60">
          Recurring subscriptions can be cancelled any time. Prepaid BLIK
          access ends automatically. Everything essential on YO Voice stays
          free — rooms, chats, friends and joining Clubs.
        </p>
      </div>
    </div>
  );
}

const includedIcons = [UserRound, Crown, Sparkles, AudioLines, Sparkles];

/** Stripe-hosted Checkout keeps payment details and provider pricing off-site. */
function CheckoutBoundary({
  plan,
  billing,
  billingError,
  billingLoading,
  displayPlans,
  accountIdentity,
  authLoading,
  emailVerified,
  signedIn,
  onRetryBilling,
}: {
  plan: PremiumPlanId;
  billing: PremiumBillingContext | null;
  billingError: string | null;
  billingLoading: boolean;
  displayPlans: Array<
    PremiumPlan & {
      price: string;
      period: string;
      equivalent?: string;
      savings?: string;
    }
  >;
  accountIdentity: string | null | undefined;
  authLoading: boolean;
  emailVerified: boolean;
  signedIn: boolean;
  onRetryBilling: () => void;
}) {
  const planConfig = displayPlans.find((candidate) => candidate.id === plan);
  const paymentOptions = paymentOptionsForPlan(plan);
  const [paymentMethod, setPaymentMethod] =
    useState<PremiumPaymentMethod>("recurring");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const capabilityGuard = useAccountCapabilityGuard(accountIdentity);
  const checkoutInFlightRef = useRef(false);
  const checkoutConfirmed =
    billing !== null && billing.checkoutAvailable && !billingError;
  const recurring = paymentMethod !== "blik";
  const blikOffer = blikPrepaidOffers[plan];
  const selectedPrice = recurring
    ? `${planConfig?.price ?? ""} ${planConfig?.period ?? ""}`.trim()
    : `${blikOffer.formattedPrice} · ${blikOffer.accessDays} days`;
  const signInHref = `/login?redirect=${encodeURIComponent(`/premium?plan=${plan}`)}`;
  const verifyEmailHref = `/verify-email?redirect=${encodeURIComponent(`/premium?plan=${plan}`)}`;

  async function checkout() {
    if (
      checkoutInFlightRef.current ||
      !checkoutConfirmed ||
      authLoading ||
      !signedIn ||
      !emailVerified
    ) return;
    const attempt = capabilityGuard.begin();
    if (!attempt) return;
    checkoutInFlightRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const url = await createPremiumCheckoutSession(plan, paymentMethod);
      if (!capabilityGuard.isCurrent(attempt)) {
        if (capabilityGuard.isMounted()) {
          setBusy(false);
          setError(
            "Your account changed. Start checkout again for the current account.",
          );
        }
        return;
      }
      window.location.assign(url);
    } catch (caught) {
      if (capabilityGuard.isMounted()) {
        setError(friendlyBillingError(caught, "checkout"));
        setBusy(false);
      }
    } finally {
      checkoutInFlightRef.current = false;
    }
  }

  return (
    <section
      aria-labelledby="premium-checkout-selection"
      className="glass-panel mx-auto mt-6 max-w-xl rounded-[24px] border border-fuchsia-400/25 p-6 text-center"
    >
      <p id="premium-checkout-selection" className="text-sm font-bold text-white">
        {planConfig?.name} Premium selected — {selectedPrice}
      </p>

      <fieldset className="mt-5" disabled={busy}>
        <legend className="text-left text-xs font-bold uppercase tracking-[0.16em] text-white/60">
          Payment method
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {paymentOptions.map((option) => {
            const selected = paymentMethod === option.id;
            return (
              <label
                key={option.id}
                className={`focus-within:ring-2 focus-within:ring-fuchsia-300/80 relative cursor-pointer rounded-2xl border px-3 py-3 text-left transition ${
                  selected
                    ? "border-fuchsia-400/60 bg-fuchsia-400/10"
                    : "border-white/10 bg-white/[0.025] hover:border-white/20"
                } ${busy ? "cursor-wait opacity-60" : ""}`}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name={`premium-payment-${plan}`}
                  value={option.id}
                  checked={selected}
                  onChange={() => {
                    setPaymentMethod(option.id);
                    setError(null);
                  }}
                />
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  {option.id === "recurring" ? (
                    <CreditCard className="size-4 text-[#d3a5ff]" aria-hidden />
                  ) : (
                    <span
                      className="inline-flex h-4 min-w-7 items-center justify-center rounded bg-white px-1 text-[8px] font-black tracking-[-0.04em] text-[#e6007e]"
                      aria-hidden
                    >
                      BLIK
                    </span>
                  )}
                  {option.label}
                </span>
                <span className="mt-1.5 block text-xs leading-4 text-white/60">
                  {option.description}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className="mt-4 text-xs leading-5 text-white/55">
        {recurring
          ? billing?.taxNotice ??
            "The subscription renews automatically until cancelled. The final total is shown before payment."
          : `One-time prepaid BLIK purchase for ${blikOffer.accessDays} days. It does not renew automatically.`}
      </p>

      {!checkoutConfirmed ? (
        <p role="status" className="mt-3 text-sm leading-6 text-amber-100/75">
          {billingLoading
            ? "We’re confirming secure checkout availability."
            : "Secure checkout has not been confirmed by the billing server, so payment remains disabled."}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm leading-6 text-rose-200">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        {!checkoutConfirmed ? (
          <button
            type="button"
            disabled={billingLoading}
            onClick={() => void onRetryBilling()}
            className="premium-button focus-ring min-h-12 inline-flex items-center justify-center gap-2 px-6 disabled:cursor-wait disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${billingLoading ? "animate-spin" : ""}`}
              aria-hidden
            />
            {billingLoading ? "Checking checkout…" : "Try secure checkout again"}
          </button>
        ) : authLoading ? (
          <button
            type="button"
            disabled
            className="premium-button min-h-12 inline-flex items-center justify-center px-6 opacity-50"
          >
            Checking your account…
          </button>
        ) : !signedIn ? (
          <Link
            href={signInHref}
            className="premium-button focus-ring min-h-12 inline-flex items-center justify-center px-6"
          >
            Sign in to continue
          </Link>
        ) : !emailVerified ? (
          <Link
            href={verifyEmailHref}
            className="premium-button focus-ring min-h-12 inline-flex items-center justify-center px-6"
          >
            Verify email to continue
          </Link>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void checkout()}
            className="premium-button focus-ring min-h-12 inline-flex items-center justify-center px-6 disabled:cursor-wait disabled:opacity-50"
          >
            {busy ? "Opening secure checkout…" : "Continue to secure checkout"}
          </button>
        )}

        <Link
          href="/download"
          className="focus-ring inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 px-6 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:text-white"
        >
          Get the app
        </Link>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-white/60">
        <ShieldCheck className="size-3" aria-hidden />
        Payment details are handled by the secure checkout provider.
      </p>
    </section>
  );
}

/**
 * Checkout success is a hint from the provider, never proof of entitlement.
 * The live entitlement document remains authoritative. The waiting animation
 * is deliberately bounded so a delayed webhook cannot leave the page in an
 * endless success-looking state.
 */
function CheckoutConfirmationState({
  authLoading,
  signedIn,
  timedOut,
  signInHref,
}: {
  authLoading: boolean;
  signedIn: boolean;
  timedOut: boolean;
  signInHref: string;
}) {
  const needsSignIn = !authLoading && !signedIn;
  const pending = !timedOut && !needsSignIn;

  return (
    <div className="mx-auto flex min-h-[62vh] w-full max-w-[560px] flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full border border-fuchsia-300/25 bg-fuchsia-300/[0.08]">
        {pending ? (
          <span
            className="size-7 animate-spin rounded-full border-2 border-white/15 border-t-fuchsia-300"
            aria-hidden
          />
        ) : (
          <Clock3 className="size-7 text-[#d3a5ff]" aria-hidden />
        )}
      </div>
      <div className="mt-6">
        <PremiumBadge />
      </div>
      <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">
        {needsSignIn
          ? "Sign in to confirm Premium"
          : pending
            ? "Confirming your Premium access"
            : "Activation is taking a little longer"}
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-7 text-white/60">
        {needsSignIn
          ? "We need your account to read the trusted Premium entitlement. The checkout return alone does not activate access."
          : pending
            ? "We’re securely checking your account for the confirmed Premium entitlement. This normally takes only a moment."
            : "We haven’t received the trusted Premium entitlement yet. No additional payment will be started by checking again."}
      </p>

      {pending ? (
        <p role="status" className="mt-5 text-xs font-semibold text-white/60">
          Waiting for secure confirmation…
        </p>
      ) : null}

      <div className="mt-7 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
        {needsSignIn ? (
          <Link
            href={signInHref}
            className="premium-button focus-ring inline-flex min-h-12 items-center justify-center px-6"
          >
            Sign in to confirm
          </Link>
        ) : !pending ? (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="premium-button focus-ring inline-flex min-h-12 items-center justify-center gap-2 px-6"
          >
            <RefreshCw className="size-4" aria-hidden />
            Check again
          </button>
        ) : null}
        <Link
          href="/premium"
          className="focus-ring inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 px-6 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:text-white"
        >
          Back to plans
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
            ? ` · access through ${periodEnd.toLocaleDateString()}`
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
          Manage Premium
        </Link>
      </div>
    </div>
  );
}
