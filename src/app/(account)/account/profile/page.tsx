"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import {
  CalendarClock,
  CheckCircle2,
  CloudOff,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";
import { getFirebaseFirestore } from "@/lib/firebase/config";
import { getFirebaseFunctions } from "@/lib/firebase/functions";
import {
  DISPLAY_NAME_CHANGE_WINDOW_MS,
  formatDisplayNameChangeDate,
  getDisplayNameAvailability,
  getDisplayNameChangeErrorMessage,
  getDisplayNameInputError,
  parseDisplayNameCooldownError,
  parseDisplayNameAuthAccountMissingError,
  parseDisplayNameSyncPendingError,
  parseOwnProfileDisplayNameState,
  parseUpdateDisplayNameResult,
  type DisplayNameChangeState,
} from "@/lib/profile/display-name-change";

type Notice =
  | { kind: "success"; text: string }
  | { kind: "warning"; text: string }
  | { kind: "error"; text: string };

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  return <ProfilePageForUser key={user.uid} />;
}

function ProfilePageForUser() {
  const { user, reloadUser, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [canonicalName, setCanonicalName] = useState("");
  const [profileState, setProfileState] =
    useState<DisplayNameChangeState | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [syncPending, setSyncPending] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const editedRef = useRef(false);
  const callableStateRef = useRef<DisplayNameChangeState | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;

    const profileRef = doc(getFirebaseFirestore(), "users", user.uid);
    return onSnapshot(
      profileRef,
      { includeMetadataChanges: true },
      (snapshot) => {
        const parsed = parseOwnProfileDisplayNameState(snapshot.data(), {
          nowMs: Date.now(),
          fromCache: snapshot.metadata.fromCache,
        });
        setProfileLoading(false);

        if (!parsed) {
          if (callableStateRef.current) return;
          setProfileError(
            "Your canonical YO Voice profile metadata is unavailable. Name changes are disabled rather than guessed.",
          );
          setProfileState(null);
          return;
        }

        // A cached listener emission must never overwrite a newer result
        // returned directly by the authoritative callable.
        if (parsed.source === "cache" && callableStateRef.current) return;
        if (parsed.source === "server") callableStateRef.current = null;

        setProfileError(null);
        setProfileState(parsed);
        setCanonicalName(parsed.displayName);
        if (!editedRef.current) setDisplayName(parsed.displayName);
      },
      () => {
        setProfileLoading(false);
        if (!callableStateRef.current) {
          setProfileError(
            "We could not verify your profile with YO Voice. Name changes are disabled until the server reconnects.",
          );
        }
      },
    );
  }, [user]);

  const normalizedName = displayName.trim();
  const inputError = getDisplayNameInputError(displayName);
  const availability = useMemo(
    () =>
      profileState ? getDisplayNameAvailability(profileState, nowMs) : null,
    [nowMs, profileState],
  );
  const canRetrySync = syncPending && normalizedName === canonicalName;
  const displayNameReadOnly =
    availability?.blocksSubmit === true && !canRetrySync;
  const noChanges =
    normalizedName === canonicalName &&
    profileState?.needsCanonicalization !== true;
  const submitDisabled =
    saving ||
    profileLoading ||
    profileState === null ||
    !user?.emailVerified ||
    inputError !== null ||
    (noChanges && !canRetrySync) ||
    (availability?.blocksSubmit === true && !canRetrySync);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitDisabled) return;

    setNotice(null);
    setSaving(true);
    try {
      const updateName = httpsCallable<{ displayName: string }, unknown>(
        getFirebaseFunctions(),
        "updateMyDisplayName",
      );
      const response = await updateName({ displayName: normalizedName });
      const result = parseUpdateDisplayNameResult(response.data);
      if (!result) {
        throw new Error("Malformed updateMyDisplayName response.");
      }

      callableStateRef.current = result;
      editedRef.current = false;
      setHasEdited(false);
      setProfileState(result);
      setCanonicalName(result.displayName);
      setDisplayName(result.displayName);
      setSyncPending(false);
      setNotice({
        kind: "success",
        text: result.changed
          ? "Display name saved across YO Voice."
          : "Your display name is already up to date.",
      });

      // The callable updates Auth only after the canonical profile commit.
      // Refreshing this browser copy is best-effort and never changes the
      // success status of the canonical update.
      try {
        await reloadUser();
      } catch {
        // A later auth refresh or the next same-name callable retry can heal
        // the secondary Auth mirror; Firestore remains canonical.
      }
    } catch (error) {
      const syncDetails = parseDisplayNameSyncPendingError(error);
      if (syncDetails) {
        const canonicalState: DisplayNameChangeState = {
          displayName: syncDetails.displayName,
          displayNameChangedAtMs: syncDetails.displayNameChangedAtMs,
          nextDisplayNameChangeAtMs:
            syncDetails.nextDisplayNameChangeAtMs,
          canChange: false,
          needsCanonicalization: false,
          source: "callable",
        };
        callableStateRef.current = canonicalState;
        editedRef.current = false;
        setHasEdited(false);
        setProfileState(canonicalState);
        setCanonicalName(syncDetails.displayName);
        setDisplayName(syncDetails.displayName);
        setSyncPending(true);
        setNotice({
          kind: "warning",
          text: getDisplayNameChangeErrorMessage(error),
        });
        return;
      }

      const missingAuth = parseDisplayNameAuthAccountMissingError(error);
      if (missingAuth) {
        const canonicalState: DisplayNameChangeState = {
          displayName: missingAuth.displayName,
          displayNameChangedAtMs: missingAuth.displayNameChangedAtMs,
          nextDisplayNameChangeAtMs: missingAuth.nextDisplayNameChangeAtMs,
          canChange: false,
          needsCanonicalization: false,
          source: "callable",
        };
        callableStateRef.current = canonicalState;
        editedRef.current = false;
        setHasEdited(false);
        setProfileState(canonicalState);
        setCanonicalName(missingAuth.displayName);
        setDisplayName(missingAuth.displayName);
        setSyncPending(false);
        setNotice({
          kind: "warning",
          text: getDisplayNameChangeErrorMessage(error),
        });
        return;
      }

      const cooldown = parseDisplayNameCooldownError(error);
      if (cooldown && profileState) {
        const canonicalState: DisplayNameChangeState = {
          ...profileState,
          displayName: canonicalName,
          displayNameChangedAtMs:
            profileState.displayNameChangedAtMs ??
            cooldown.nextDisplayNameChangeAtMs -
              DISPLAY_NAME_CHANGE_WINDOW_MS,
          nextDisplayNameChangeAtMs: cooldown.nextDisplayNameChangeAtMs,
          canChange: false,
          source: "callable",
        };
        callableStateRef.current = canonicalState;
        editedRef.current = false;
        setHasEdited(false);
        setDisplayName(canonicalName);
        setSyncPending(false);
        setProfileState(canonicalState);
      }
      setNotice({
        kind: "error",
        text: getDisplayNameChangeErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="glass-panel rounded-[28px] p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="mt-1 text-sm text-white/65">
            This is how you appear across YO Voice.
          </p>
        </div>
        <Link
          href={APP_ENTRY_PATH}
          className="premium-button focus-ring min-h-11 shrink-0 px-5 text-sm"
        >
          Open YO Voice <ExternalLink className="size-4" />
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[.02] p-4">
        <div className="min-w-0">
          <p className="break-all text-sm font-semibold text-white">
            {user.email}
          </p>
          {user.emailVerified ? (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="size-3.5" /> Email verified
            </p>
          ) : (
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-amber-300">
              <TriangleAlert className="size-3.5" />
              Not verified —{" "}
              <Link
                href="/verify-email"
                className="underline underline-offset-2 hover:text-white"
              >
                verify now
              </Link>
            </p>
          )}
        </div>
        <div className="sm:ml-auto">
          <button
            type="button"
            onClick={() => signOut()}
            className="focus-ring min-h-11 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Log out
          </button>
        </div>
      </div>

      <form className="mt-8 max-w-xl space-y-5" onSubmit={handleSubmit}>
        {notice ? <ProfileNotice notice={notice} /> : null}

        <div>
          <label
            htmlFor="profile-email"
            className="text-xs font-semibold uppercase tracking-wide text-white/65"
          >
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            value={user.email ?? ""}
            disabled
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.02] px-4 py-3.5 text-white/50 outline-none"
          />
          <p className="mt-1 text-xs text-white/65">
            Change your email from Security.
          </p>
        </div>

        <div>
          <label
            htmlFor="profile-name"
            className="text-xs font-semibold uppercase tracking-wide text-white/65"
          >
            Display name
          </label>
          <input
            id="profile-name"
            type="text"
            value={displayName}
            disabled={profileLoading || profileState === null || saving}
            readOnly={displayNameReadOnly}
            aria-readonly={displayNameReadOnly}
            aria-describedby={`profile-name-help profile-name-availability${
              inputError && hasEdited ? " profile-name-error" : ""
            }`}
            aria-invalid={hasEdited && inputError !== null}
            onChange={(event) => {
              editedRef.current = true;
              setHasEdited(true);
              setDisplayName(event.target.value);
              setNotice(null);
            }}
            className="focus-ring mt-2 w-full rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3.5 text-white outline-none placeholder:text-white/45 focus:border-fuchsia-400/60 read-only:cursor-not-allowed read-only:text-white/65 disabled:cursor-not-allowed disabled:opacity-55"
          />
          <p id="profile-name-help" className="mt-1.5 text-xs text-white/65">
            2–120 visible characters. After a real change, the next one is
            available in 30 days.
          </p>
          {inputError && hasEdited ? (
            <p
              id="profile-name-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-rose-300"
            >
              {inputError}
            </p>
          ) : null}
        </div>

        <DisplayNameAvailabilityCard
          loading={profileLoading}
          error={profileError}
          availability={availability}
        />

        <button
          type="submit"
          disabled={submitDisabled}
          className="premium-button focus-ring min-h-12 px-6 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {saving ? (
            "Saving…"
          ) : canRetrySync ? (
            <>
              <RefreshCw className="size-4" /> Retry account sync
            </>
          ) : (
            "Save display name"
          )}
        </button>
      </form>
    </div>
  );
}

function ProfileNotice({ notice }: { notice: Notice }) {
  const classes =
    notice.kind === "success"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
      : notice.kind === "warning"
        ? "border-amber-400/25 bg-amber-500/10 text-amber-100"
        : "border-rose-400/25 bg-rose-500/10 text-rose-200";
  return (
    <p
      role={notice.kind === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`rounded-2xl border px-4 py-3 text-sm ${classes}`}
    >
      {notice.text}
    </p>
  );
}

function DisplayNameAvailabilityCard({
  loading,
  error,
  availability,
}: {
  loading: boolean;
  error: string | null;
  availability: ReturnType<typeof getDisplayNameAvailability> | null;
}) {
  if (loading) {
    return (
      <div
        id="profile-name-availability"
        role="status"
        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 text-white/55"
      >
        <RefreshCw className="mt-0.5 size-4 shrink-0 animate-spin" />
        <p className="text-sm">Checking your name-change date with YO Voice…</p>
      </div>
    );
  }

  if (error || !availability) {
    return (
      <div
        id="profile-name-availability"
        role="alert"
        className="flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-100"
      >
        <CloudOff className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="text-sm font-bold">Availability not verified</p>
          <p className="mt-1 text-xs leading-relaxed text-rose-100/70">
            {error ?? "YO Voice did not return valid profile metadata."}
          </p>
        </div>
      </div>
    );
  }

  const Icon = availability.stale ? CloudOff : ShieldCheck;
  return (
    <div
      id="profile-name-availability"
      role="status"
      className={`rounded-2xl border p-4 ${
        availability.stale
          ? "border-amber-400/20 bg-amber-500/[.08]"
          : "border-fuchsia-400/20 bg-fuchsia-500/[.07]"
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`mt-0.5 size-5 shrink-0 ${
            availability.stale ? "text-amber-300" : "text-fuchsia-300"
          }`}
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-white">{availability.title}</p>
            {availability.stale ? (
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200">
                Cached — checking server
              </span>
            ) : null}
          </div>
          {availability.nextChangeAtMs !== null ? (
            <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-white">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-fuchsia-300" />
              <time
                dateTime={new Date(
                  availability.nextChangeAtMs,
                ).toISOString()}
              >
                {formatDisplayNameChangeDate(availability.nextChangeAtMs)}
              </time>
            </p>
          ) : (
            <p className="mt-2 text-sm font-semibold text-emerald-300">
              No previous display-name change is recorded.
            </p>
          )}
          <p className="mt-1.5 text-xs leading-relaxed text-white/65">
            {availability.description}
          </p>
        </div>
      </div>
    </div>
  );
}
