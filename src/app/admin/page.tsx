"use client";

import { useEffect, useState, type FormEvent } from "react";
import { httpsCallable } from "firebase/functions";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { getFirebaseFunctions } from "@/lib/firebase/functions";

// Must match SUPER_ADMIN_EMAIL in functions/utils/roles.js (app repo).
// Only used to decide whether to OFFER the bootstrap button — the Cloud
// Function re-checks the caller's email and verification server-side.
const OWNER_EMAIL = "grieferxgriefer@gmail.com";

const ADMIN_ROLES = new Set(["admin", "superAdmin"]);

type PremiumPlan = "monthly" | "yearly" | "none";

type LookupResult = {
  uid: string;
  email: string | null;
  displayName: string | null;
  username: string | null;
  role: string;
  banned: boolean;
};

type GrantResult = {
  plan: PremiumPlan;
  status: string;
  isPremium: boolean;
  currentPeriodEnd: Date | null;
};

function callableErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Try again.";
}

/** Firestore Timestamps cross the callable boundary as plain objects
 * ({_seconds} from firebase-admin's serialization); tolerate the shapes
 * we might see rather than trusting one. */
function parseTimestampish(value: unknown): Date | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const seconds = record._seconds ?? record.seconds;
  if (typeof seconds === "number") return new Date(seconds * 1000);
  return null;
}

function formatDate(date: Date | null): string {
  if (!date) return "unknown date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400/40";

function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
    >
      {message}
    </p>
  );
}

function SuccessBanner({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
      {children}
    </p>
  );
}

/** Owner sign-in exists but the superAdmin claim hasn't been minted yet
 * (first run on a fresh project, or a rebuilt auth user). Offers the
 * one-time bootstrap; the function only accepts the verified owner email. */
function OwnerBootstrapCard({ onActivated }: { onActivated: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  async function activate() {
    setError(null);
    setActivating(true);
    try {
      await httpsCallable(getFirebaseFunctions(), "bootstrapSuperAdmin")();
      onActivated();
    } catch (err) {
      setError(callableErrorMessage(err));
      setActivating(false);
    }
  }

  return (
    <div className="glass-panel rounded-[28px] p-8">
      <h2 className="text-xl font-bold">Owner access not active</h2>
      <p className="mt-2 text-sm text-white/55">
        This is the owner account, but the current session doesn&apos;t carry
        the superAdmin role yet. Activate it once and the session refreshes
        with admin permissions.
      </p>
      <div className="mt-6 space-y-4">
        {error ? <ErrorBanner message={error} /> : null}
        <button
          type="button"
          onClick={activate}
          disabled={activating}
          className="premium-button min-h-12 px-6 disabled:opacity-60"
        >
          {activating ? "Activating…" : "Activate owner access"}
        </button>
      </div>
    </div>
  );
}

function FindUserCard({
  onUseUid,
}: {
  onUseUid: (uid: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setError(null);
    setResult(null);
    setSearching(true);
    try {
      const lookup = httpsCallable<
        { email: string } | { uid: string },
        LookupResult
      >(getFirebaseFunctions(), "getUserRole");
      const response = await lookup(
        trimmed.includes("@") ? { email: trimmed } : { uid: trimmed },
      );
      setResult(response.data);
    } catch (err) {
      setError(callableErrorMessage(err));
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="glass-panel rounded-[28px] p-8">
      <h2 className="text-xl font-bold">Find a user</h2>
      <p className="mt-2 text-sm text-white/55">
        Look up an account by e-mail address or uid to confirm who you&apos;re
        about to change.
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {error ? <ErrorBanner message={error} /> : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="email@example.com or uid"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={inputClassName}
          />
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="premium-button min-h-12 shrink-0 px-6 disabled:opacity-60"
          >
            {searching ? "Searching…" : "Search"}
          </button>
        </div>
      </form>
      {result ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-5">
          <p className="font-semibold text-white">
            {result.displayName ?? "Unnamed account"}
            {result.username ? (
              <span className="ml-2 text-sm font-normal text-white/45">
                @{result.username}
              </span>
            ) : null}
          </p>
          <dl className="mt-3 space-y-1.5 text-sm text-white/55">
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-white/35">email</dt>
              <dd className="break-all">{result.email ?? "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-white/35">uid</dt>
              <dd className="break-all font-mono text-xs leading-5">
                {result.uid}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-white/35">role</dt>
              <dd>
                {result.role}
                {result.banned ? (
                  <span className="ml-2 text-rose-300">banned</span>
                ) : null}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => onUseUid(result.uid)}
            className="mt-4 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-semibold text-fuchsia-200 transition hover:bg-fuchsia-500/20"
          >
            Use this uid below
          </button>
        </div>
      ) : null}
    </div>
  );
}

function GrantPremiumCard({
  uid,
  onUidChange,
}: {
  uid: string;
  onUidChange: (uid: string) => void;
}) {
  const [plan, setPlan] = useState<PremiumPlan>("monthly");
  const [days, setDays] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ uid: string; value: GrantResult } | null>(
    null,
  );
  const [granting, setGranting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const targetUid = uid.trim();
    if (!targetUid) return;

    setError(null);
    setResult(null);
    setGranting(true);
    try {
      const grant = httpsCallable<
        { uid: string; plan: PremiumPlan; days?: number },
        Record<string, unknown>
      >(getFirebaseFunctions(), "adminSetPremiumEntitlements");
      const parsedDays = Number(days);
      const response = await grant({
        uid: targetUid,
        plan,
        ...(plan !== "none" && Number.isFinite(parsedDays) && parsedDays > 0
          ? { days: parsedDays }
          : {}),
      });
      const data = response.data;
      setResult({
        uid: targetUid,
        value: {
          plan,
          status: typeof data.status === "string" ? data.status : "unknown",
          isPremium: data.isPremium === true,
          currentPeriodEnd: parseTimestampish(data.currentPeriodEnd),
        },
      });
    } catch (err) {
      setError(callableErrorMessage(err));
    } finally {
      setGranting(false);
    }
  }

  return (
    <div className="glass-panel mt-6 rounded-[28px] p-8">
      <h2 className="text-xl font-bold">Grant Premium</h2>
      <p className="mt-2 text-sm text-white/55">
        Writes the server-managed entitlement document for the account:
        Premium, creator tools, club creation and premium identity until the
        period end. Choosing “none” revokes immediately.
      </p>
      <form className="mt-6 max-w-md space-y-4" onSubmit={handleSubmit}>
        {error ? <ErrorBanner message={error} /> : null}
        {result ? (
          <SuccessBanner>
            {result.value.plan === "none" ? (
              <>
                Premium revoked for{" "}
                <span className="font-mono text-xs">{result.uid}</span>.
              </>
            ) : (
              <>
                Premium ({result.value.plan}) granted to{" "}
                <span className="font-mono text-xs">{result.uid}</span> — status{" "}
                {result.value.status}, active until{" "}
                {formatDate(result.value.currentPeriodEnd)}.
              </>
            )}
          </SuccessBanner>
        ) : null}
        <input
          type="text"
          placeholder="User uid"
          required
          value={uid}
          onChange={(event) => onUidChange(event.target.value)}
          className={`${inputClassName} font-mono text-sm`}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={plan}
            onChange={(event) => setPlan(event.target.value as PremiumPlan)}
            className={`${inputClassName} appearance-none`}
          >
            <option value="monthly">Monthly (30 days)</option>
            <option value="yearly">Yearly (365 days)</option>
            <option value="none">None — revoke</option>
          </select>
          <input
            type="number"
            min={1}
            max={400}
            placeholder="Days (optional)"
            value={days}
            disabled={plan === "none"}
            onChange={(event) => setDays(event.target.value)}
            className={`${inputClassName} disabled:opacity-40`}
          />
        </div>
        <button
          type="submit"
          disabled={granting || !uid.trim()}
          className="premium-button min-h-12 px-6 disabled:opacity-60"
        >
          {granting
            ? "Applying…"
            : plan === "none"
              ? "Revoke Premium"
              : "Grant Premium"}
        </button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading } = useRequireAuth();
  // null = claims not read yet; the gate renders nothing sensitive until
  // the role is known. The claim is only trusted for choosing what UI to
  // show — every action on this page is re-authorized server-side.
  const [role, setRole] = useState<string | null>(null);
  const [grantUid, setGrantUid] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    user
      .getIdTokenResult()
      .then((token) => {
        if (!cancelled) setRole(String(token.claims.role ?? "user"));
      })
      .catch(() => {
        if (!cancelled) setRole("user");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function refreshRole() {
    if (!user) return;
    // Custom claims only reach the client in a NEW token; force-refresh
    // instead of waiting out the old token's remaining lifetime.
    const token = await user.getIdTokenResult(true);
    setRole(String(token.claims.role ?? "user"));
  }

  if (loading || !user || role === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060511]">
        <p className="text-sm text-white/45">Loading…</p>
      </main>
    );
  }

  const isAdmin = ADMIN_ROLES.has(role);
  const isOwnerAccount =
    (user.email ?? "").trim().toLowerCase() === OWNER_EMAIL;

  return (
    <div>
      <SiteHeader />
      <main className="min-h-screen bg-[#060511] px-5 pb-24 pt-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="mt-2 text-sm text-white/55">
            Owner tools for the live Firebase project. Every action here is
            authorized again by the Cloud Function it calls.
          </p>

          <div className="mt-8 space-y-6">
            {isAdmin ? (
              <>
                <FindUserCard onUseUid={setGrantUid} />
                <GrantPremiumCard uid={grantUid} onUidChange={setGrantUid} />
              </>
            ) : isOwnerAccount ? (
              <OwnerBootstrapCard onActivated={refreshRole} />
            ) : (
              <div className="glass-panel rounded-[28px] p-8">
                <h2 className="text-xl font-bold">No admin access</h2>
                <p className="mt-2 text-sm text-white/55">
                  This account ({user.email ?? "unknown"}) doesn&apos;t have an
                  administrator role, so there&apos;s nothing to see here.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
