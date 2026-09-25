"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
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
        <div className="size-9 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" aria-hidden />
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
    <div className="relative mx-auto w-full max-w-[900px] px-5 pb-24 pt-28 sm:px-8">
      <div className="mx-auto max-w-xl text-center">
        <PremiumBadge />
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-[1.875rem] font-extrabold leading-[1.1] tracking-[-.025em] text-[var(--foreground)] sm:text-[2.5rem]">
          Choose <span className="text-[var(--accent)]">your plan</span>
        </h1>
        <p className="mt-4 text-base leading-[1.6] text-[var(--text-secondary)]">
          Premium is €6 monthly or €60 yearly. The yearly subscription includes
          two months free; BLIK is prepaid and never renews automatically.
        </p>
      </div>

      {searchParams.get("checkout") === "cancelled" ? (
        <div
          role="status"
          data-tone="info"
          className="status-alert mx-auto mt-8 max-w-xl"
        >
          <ShieldCheck aria-hidden />
          Checkout was cancelled. No new payment was started — you can choose a
          plan whenever you&apos;re ready.
        </div>
      ) : null}

      {visibleBillingError ? (
        <div
          role="status"
          data-tone="warning"
          className="status-alert mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{visibleBillingError}</span>
          <button
            type="button"
            disabled={billingLoading}
            onClick={() => void loadBilling()}
            className="premium-button-secondary focus-ring shrink-0 disabled:opacity-50"
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
          className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold text-[var(--text-secondary)]"
        >
          <span className="size-3 animate-spin rounded-full border border-[var(--border-strong)] border-t-[var(--accent)]" />
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
            className={`focus-ring panel group relative p-7 text-left disabled:cursor-wait ${
              plan.highlight
                ? "border-[var(--primary)]!"
                : "hover:border-[var(--border-strong)]!"
            } ${selectedPlan === plan.id ? "ring-2 ring-[var(--accent)]" : ""}`}
          >
            {plan.highlight ? (
              <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[var(--primary)] px-3.5 py-1.5 text-[11px] font-bold text-white">
                <Crown className="size-3" aria-hidden />
                Best value
              </span>
            ) : null}
            <p className="eyebrow">
              {plan.name}
            </p>
            <p className="mt-3 text-4xl font-bold text-white">
              {plan.price}
              <span className="text-base font-semibold text-[var(--text-secondary)]">
                {" "}
                {plan.period}
              </span>
            </p>
            {billing?.localizedAtCheckout ? (
              <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                Base price · final local currency at checkout
              </p>
            ) : null}
            {plan.equivalent ? (
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{plan.equivalent}</p>
            ) : null}
            {plan.savings ? (
              <span className="badge badge-verified mt-3">
                {plan.savings}
              </span>
            ) : null}
            <ul className="mt-5 space-y-2 border-t border-[var(--border)] pt-5">
              {premiumPlanChecklist.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <Check
                    className={`size-3.5 shrink-0 ${
                      plan.highlight ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
                    }`}
                    aria-hidden
                  />
                  <span className="text-[13px] text-[var(--text-secondary)]">{item}</span>
                </li>
              ))}
            </ul>
            <span className="premium-button mt-6 w-full">
              {authLoading ? "Checking your account…" : plan.cta}
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
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
          className="scroll-mt-24 rounded-[var(--radius-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
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
        <h2 className="text-base font-bold text-[var(--foreground)]">
          Everything Premium includes:
        </h2>
        <ul className="panel mt-4 space-y-1 px-5 py-3">
          {premiumIncludedFeatures.map((feature, index) => {
            const Icon = includedIcons[index] ?? Sparkles;
            return (
              <li key={feature} className="flex items-center gap-3.5 py-2.5">
                <Icon className="size-5 shrink-0 text-[var(--accent)]" strokeWidth={1.8} aria-hidden />
                <span className="text-sm font-medium leading-6 text-[var(--foreground)]">
                  {feature}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 text-center text-xs leading-5 text-[var(--text-secondary)]">
          Recurring subscriptions can be cancelled any time. Prepaid BLIK
          access ends automatically. Everything essential on YO Voice stays
          free — Chats, Friends, Voice Moments and the current web experience.
          Free can own up to 5 Servers and Premium up to 30; everyone can join
          without a limit. The server enforces these allowances.
        </p>
      </div>
    </div>
  );
}

const includedIcons = [UserRound, Crown, Sparkles, Sparkles];

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
      className="panel mx-auto mt-6 max-w-xl p-6 text-center"
    >
      <p id="premium-checkout-selection" className="text-sm font-bold text-white">
        {planConfig?.name} Premium selected — {selectedPrice}
      </p>

      <fieldset className="mt-5" disabled={busy}>
        <legend className="eyebrow text-left">
          Payment method
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {paymentOptions.map((option) => {
            const selected = paymentMethod === option.id;
            return (
              <label
                key={option.id}
                className={`focus-within:ring-2 focus-within:ring-[var(--focus)] relative cursor-pointer rounded-[var(--radius-field)] border px-3 py-3 text-left transition ${
                  selected
                    ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_16%,var(--surface))]"
                    : "border-[var(--border-strong)] bg-[var(--background)] hover:border-[var(--accent)]"
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
                    <CreditCard className="size-4 text-[var(--accent)]" aria-hidden />
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
                <span className="mt-1.5 block text-xs leading-4 text-[var(--text-secondary)]">
                  {option.description}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className="mt-4 text-xs leading-5 text-[var(--text-secondary)]">
        {recurring
          ? billing?.taxNotice ??
            "The subscription renews automatically until cancelled. The final total is shown before payment."
          : `One-time prepaid BLIK purchase for ${blikOffer.accessDays} days. It does not renew automatically.`}
      </p>

      {!checkoutConfirmed ? (
        <p role="status" data-tone="warning" className="status-alert mt-3">
          {billingLoading
            ? "We’re confirming secure checkout availability."
            : "Secure checkout has not been confirmed by the billing server, so payment remains disabled."}
        </p>
      ) : null}
      {error ? (
        <p role="alert" data-tone="error" className="status-alert mt-3">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        {!checkoutConfirmed ? (
          <button
            type="button"
            disabled={billingLoading}
            onClick={() => void onRetryBilling()}
            className="premium-button focus-ring disabled:cursor-wait disabled:opacity-50"
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
            className="premium-button opacity-50"
          >
            Checking your account…
          </button>
        ) : !signedIn ? (
          <Link
            href={signInHref}
            className="premium-button focus-ring"
          >
            Sign in to continue
          </Link>
        ) : !emailVerified ? (
          <Link
            href={verifyEmailHref}
            className="premium-button focus-ring"
          >
            Verify email to continue
          </Link>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void checkout()}
            className="premium-button focus-ring disabled:cursor-wait disabled:opacity-50"
          >
            {busy ? "Opening secure checkout…" : "Continue to secure checkout"}
          </button>
        )}

        <Link
          href="/download"
          className="premium-button-secondary focus-ring"
        >
          Get the app
        </Link>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
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
    <div className="mx-auto flex min-h-[62vh] w-full max-w-[560px] flex-col items-center justify-center px-5 pb-16 pt-28 text-center">
      <div className="flex size-16 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
        {pending ? (
          <span
            className="size-7 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]"
            aria-hidden
          />
        ) : (
          <Clock3 className="size-7 text-[var(--accent)]" strokeWidth={1.8} aria-hidden />
        )}
      </div>
      <div className="mt-6">
        <PremiumBadge />
      </div>
      <h1 className="mt-5 font-[family-name:var(--font-display)] text-[1.875rem] font-extrabold leading-[1.1] tracking-[-.025em] text-[var(--foreground)] sm:text-[2.5rem]">
        {needsSignIn
          ? "Sign in to confirm Premium"
          : pending
            ? "Confirming your Premium access"
            : "Activation is taking a little longer"}
      </h1>
      <p className="mt-4 max-w-lg text-base leading-[1.6] text-[var(--text-secondary)]">
        {needsSignIn
          ? "We need your account to read the trusted Premium entitlement. The checkout return alone does not activate access."
          : pending
            ? "We’re securely checking your account for the confirmed Premium entitlement. This normally takes only a moment."
            : "We haven’t received the trusted Premium entitlement yet. No additional payment will be started by checking again."}
      </p>

      {pending ? (
        <p role="status" className="mt-5 text-xs font-semibold text-[var(--text-secondary)]">
          Waiting for secure confirmation…
        </p>
      ) : null}

      <div className="mt-7 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
        {needsSignIn ? (
          <Link
            href={signInHref}
            className="premium-button focus-ring"
          >
            Sign in to confirm
          </Link>
        ) : !pending ? (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="premium-button focus-ring"
          >
            <RefreshCw className="size-4" aria-hidden />
            Check again
          </button>
        ) : null}
        <Link
          href="/premium"
          className="premium-button-secondary focus-ring"
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
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-center px-5 pb-24 pt-28 text-center">
      <PremiumRing size={104}>
        <Image
          src="/logos/yo-voice-symbol.png"
          alt=""
          width={62}
          height={64}
          className="object-contain"
        />
      </PremiumRing>
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-[1.875rem] font-extrabold leading-[1.1] tracking-[-.025em] text-[var(--foreground)] sm:text-[2.5rem]">
        You&apos;re on <span className="text-[var(--accent)]">YO Voice Premium</span>
      </h1>
      <p className="mt-3 text-base leading-[1.6] text-[var(--text-secondary)]">
        Your voice just got more room to grow.
      </p>

      <div className="panel mt-8 w-full p-5 text-sm text-[var(--text-secondary)]">
        <p>
          <span className="font-semibold text-white">
            {entitlements.plan === "yearly" ? "Yearly" : "Monthly"} plan
          </span>
          {periodEnd
            ? ` · access through ${periodEnd.toLocaleDateString()}`
            : null}
        </p>
        {entitlements.inGracePeriod ? (
          <p className="mt-2 text-[var(--warning)]">
            There&apos;s a payment issue — check your billing details to keep
            Premium active.
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={APP_ENTRY_PATH}
          className="premium-button focus-ring"
        >
          Open YO Voice
        </Link>
        <Link
          href="/premium/manage"
          className="premium-button-secondary focus-ring"
        >
          Manage Premium
        </Link>
      </div>
    </div>
  );
}
