"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { httpsCallable } from "firebase/functions";
import { Mail, ShieldAlert, TriangleAlert } from "lucide-react";

import {
  DELETION_REMOVES,
  DELETION_REQUEST_MAILTO,
  PRIVACY_MAILBOX,
  PUBLIC_DELETION_PATH,
  SELF_SERVICE_DELETION_LIVE,
  deletionRetains,
  deletionTiming,
} from "@/content/account-deletion";
import { useAuth } from "@/hooks/use-auth";
import {
  ACCOUNT_DELETION_CALLABLE,
  getAccountDeletionConfirmation,
  getAccountDeletionErrorMessage,
  hasPasswordSignIn,
  parseAccountDeletionResult,
} from "@/lib/account/account-deletion";
import { getFirebaseFunctions } from "@/lib/firebase/functions";

export default function DeleteAccountPage() {
  const { user } = useAuth();
  // The account layout renders its own loading state and redirects a signed
  // out visitor, so there is nothing to show here until a user exists.
  if (!user) return null;

  const canReauthenticate = hasPasswordSignIn(user.providerData);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Delete account</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
          Deleting your YO Voice account is permanent. Read what happens, then
          confirm it is you.
        </p>
      </header>

      <Consequences />

      {!canReauthenticate ? (
        <ProviderAccountPanel />
      ) : SELF_SERVICE_DELETION_LIVE ? (
        <DeleteAccountForm />
      ) : (
        <RequestByEmailPanel />
      )}
    </div>
  );
}

function Consequences() {
  return (
    <section
      aria-labelledby="deletion-consequences-heading"
      className="panel p-5 sm:p-8"
    >
      <div className="flex items-start gap-3">
        <TriangleAlert
          className="mt-0.5 size-5 shrink-0 text-warning"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h2
            id="deletion-consequences-heading"
            className="text-lg font-bold text-white"
          >
            What deleting your account removes
          </h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {deletionTiming.headline} There is no undo, and no recovery window.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-3 text-sm leading-6 text-text-secondary">
        {DELETION_REMOVES.map((item) => (
          <li key={item} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--accent)]"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <details className="mt-5 border-t border-border pt-4">
        <summary className="focus-ring cursor-pointer rounded-lg text-sm font-semibold text-white">
          What we keep, and why
        </summary>
        <ul className="mt-3 space-y-3 text-sm leading-6 text-text-secondary">
          {deletionRetains.map((entry) => (
            <li key={entry.item}>
              <span className="font-semibold text-text-secondary">{entry.item}</span>{" "}
              {entry.reason}
            </li>
          ))}
        </ul>
      </details>

      <p className="mt-5 text-sm leading-6 text-text-secondary">
        The same list, with the full detail and the contact for a manual
        request, is on{" "}
        <Link
          href={PUBLIC_DELETION_PATH}
          className="focus-ring rounded font-semibold text-accent underline underline-offset-4 hover:text-white"
        >
          the public deletion page
        </Link>
        .
      </p>
    </section>
  );
}

/**
 * Google and Apple accounts cannot sign in on this website at all
 * (src/providers/auth-provider.tsx is email/password only), so this panel is
 * defensive: it is what a linked-provider session would see rather than a
 * password form it could never satisfy.
 */
function ProviderAccountPanel() {
  return (
    <section
      aria-labelledby="deletion-provider-heading"
      className="panel p-5 sm:p-8"
    >
      <h2
        id="deletion-provider-heading"
        className="flex items-center gap-2 text-lg font-bold text-white"
      >
        <ShieldAlert className="size-5 text-warning" aria-hidden="true" />
        This account has no password to confirm with
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        It signs in with Google or with Apple. Deleting an account here needs a
        password, so use the YO Voice app, or write to us and we will do it for
        you.
      </p>
      <EmailRequestButton />
    </section>
  );
}

/**
 * Shown while self-service deletion is not switched on in production. It is
 * the honest version of this page: the request is real, the route is real, and
 * nothing here pretends a button deletes an account when no deployed function
 * would answer it.
 */
function RequestByEmailPanel() {
  return (
    <section
      aria-labelledby="deletion-request-heading"
      className="panel p-5 sm:p-8"
    >
      <h2
        id="deletion-request-heading"
        className="text-lg font-bold text-white"
      >
        Ask us to delete this account
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {deletionTiming.detail}
      </p>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        Send the email from the address on this account so we can tell it is
        you. We never ask for your password by email.
      </p>
      <EmailRequestButton />
    </section>
  );
}

function EmailRequestButton() {
  return (
    <a
      href={DELETION_REQUEST_MAILTO}
      className="premium-button focus-ring mt-5 min-h-12"
    >
      <Mail className="size-4" aria-hidden="true" />
      Email {PRIVACY_MAILBOX}
    </a>
  );
}

/**
 * The self-service flow. The callable refuses a sign-in older than five
 * minutes, so the password is not decoration: it is the server's own
 * requirement, satisfied by reauthenticating and refreshing the ID token
 * immediately before the call.
 */
function DeleteAccountForm() {
  const { signOut, reauthenticate } = useAuth();
  const [password, setPassword] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const passwordId = useId();
  const confirmId = useId();
  const errorId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    if (!understood) {
      setError("Tick the box to confirm you understand this cannot be undone.");
      return;
    }
    if (password.length === 0) {
      setError("Enter your current password to confirm it is you.");
      return;
    }

    setSubmitting(true);
    try {
      await reauthenticate(password);
      const deleteAccount = httpsCallable<Record<string, never>, unknown>(
        getFirebaseFunctions(),
        ACCOUNT_DELETION_CALLABLE,
      );
      const response = await deleteAccount({});
      // A malformed body is not a failure: the callable only answers after its
      // transaction has committed, so the account is already being deleted. It
      // only decides which sentence the confirmation uses.
      //
      // ORDER, and why it is not the obvious one. The confirmation is set
      // BEFORE the sign-out, and the sign-out is therefore not yet finished
      // when this panel first paints — which is exactly why
      // getAccountDeletionConfirmation says the sign-out is *happening* and
      // never that it has happened. Awaiting the sign-out first would make the
      // sentence true and the panel unreachable: `signOut()` flips `useAuth()`
      // to "no user", and `DeleteAccountPage` above returns null the moment
      // `user` is null, so the person would watch a blank panel through the
      // navigation instead of a status line. The one sentence that may claim a
      // completed sign-out is the banner on the public page this navigates to,
      // which renders after the sign-out has resolved
      // (src/components/legal/deletion-request-banner.tsx).
      setConfirmation(
        getAccountDeletionConfirmation(parseAccountDeletionResult(response.data)),
      );
      setPassword("");

      try {
        await signOut();
      } catch {
        // The server has already revoked this session; a failed local sign-out
        // must not keep the person on a page for an account that is going.
      }
      // A full navigation on purpose, not a router push. Signing out flips the
      // account layout's useRequireAuth to "no user", which replaces the route
      // with /login; a client-side navigation started here would race that
      // redirect and could leave a person who has just deleted their account
      // staring at a sign-in form. A document navigation cannot lose that race,
      // and it also drops every in-memory Firebase and React state belonging to
      // an account that no longer exists.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`${PUBLIC_DELETION_PATH}?requested=1`);
    } catch (submitError) {
      setError(getAccountDeletionErrorMessage(submitError));
      setSubmitting(false);
    }
  }

  if (confirmation) {
    // The document navigation below is already under way; this is what the
    // person reads while it happens, and what they keep reading if a slow
    // network delays it.
    return (
      <section
        aria-labelledby="deletion-done-heading"
        className="panel p-5 sm:p-8"
      >
        <h2 id="deletion-done-heading" className="text-lg font-bold text-white">
          Deletion started
        </h2>
        <p role="status" className="mt-2 text-sm leading-6 text-text-secondary">
          {confirmation}
        </p>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Taking you to{" "}
          <Link
            href={PUBLIC_DELETION_PATH}
            className="focus-ring rounded font-semibold text-accent underline underline-offset-4 hover:text-white"
          >
            the deletion page
          </Link>
          , which explains what happens next.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="deletion-confirm-heading"
      className="panel p-5 sm:p-8"
    >
      <h2 id="deletion-confirm-heading" className="text-lg font-bold text-white">
        Confirm it is you
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Enter your current password. We ask again even though you are signed in,
        because deleting an account cannot be undone.
      </p>

      <form className="mt-6 max-w-md space-y-5" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p
            id={errorId}
            role="alert"
            data-tone="error"
            className="status-alert"
          >
            {error}
          </p>
        ) : null}

        <div>
          <label
            htmlFor={passwordId}
            className="text-xs font-semibold uppercase tracking-wide text-text-secondary"
          >
            Current password
          </label>
          <div className="glass-field mt-2" data-state={error ? "error" : undefined}>
            <input
              id={passwordId}
              type="password"
              className="glass-field__input"
              autoComplete="current-password"
              value={password}
              disabled={submitting}
              aria-describedby={error ? errorId : undefined}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
            />
          </div>
        </div>

        <div className="flex items-start gap-3">
          <input
            id={confirmId}
            type="checkbox"
            checked={understood}
            disabled={submitting}
            onChange={(event) => {
              setUnderstood(event.target.checked);
              setError(null);
            }}
            className="focus-ring mt-0.5 size-5 shrink-0 accent-[var(--error)]"
          />
          <label htmlFor={confirmId} className="text-sm leading-6 text-text-secondary">
            I understand that my account and the data listed above are deleted
            permanently, and that this cannot be undone.
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-field)] border border-[color-mix(in_srgb,var(--error)_38%,transparent)] bg-[var(--danger-surface)] px-6 text-[15px] font-semibold text-error transition hover:bg-[color-mix(in_srgb,var(--danger-surface)_78%,var(--error))] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? "Deleting your account…" : "Delete my account permanently"}
        </button>

        <p className="text-xs leading-5 text-text-secondary">
          Prefer to ask a person?{" "}
          <a
            href={DELETION_REQUEST_MAILTO}
            className="focus-ring rounded font-semibold text-accent underline underline-offset-4 hover:text-white"
          >
            Email {PRIVACY_MAILBOX}
          </a>
          .
        </p>
      </form>
    </section>
  );
}
