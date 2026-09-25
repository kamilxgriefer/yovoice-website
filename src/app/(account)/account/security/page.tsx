"use client";

import { useState, type FormEvent } from "react";
import { Mail, ShieldAlert } from "lucide-react";

import { SUPPORT_MAILBOX } from "@/content/account-deletion";
import { useAuth } from "@/hooks/use-auth";
import { hasPasswordSignIn } from "@/lib/account/account-deletion";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import {
  SOCIAL_PROVIDER_NAME,
  socialProvidersOf,
} from "@/lib/auth/social-sign-in";

function PasswordCard() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (newPassword.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel p-5 sm:p-8">
      <h2 className="text-xl font-bold">Password</h2>
      <form className="mt-6 max-w-md space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <p role="alert" data-tone="error" className="status-alert">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p data-tone="success" className="status-alert">
            Password updated.
          </p>
        ) : null}
        <div>
          <label htmlFor="password-current" className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Current password
          </label>
          <input
            id="password-current"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="mt-2 min-h-[52px] w-full rounded-[var(--radius-field)] border border-border-strong bg-[var(--surface)] px-4 py-3 text-white outline-none placeholder:text-text-tertiary focus:border-[var(--focus)] focus:shadow-[0_0_0_1px_var(--focus)]"
          />
        </div>
        <div>
          <label htmlFor="password-new" className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            New password
          </label>
          <input
            id="password-new"
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="mt-2 min-h-[52px] w-full rounded-[var(--radius-field)] border border-border-strong bg-[var(--surface)] px-4 py-3 text-white outline-none placeholder:text-text-tertiary focus:border-[var(--focus)] focus:shadow-[0_0_0_1px_var(--focus)]"
          />
        </div>
        <div>
          <label htmlFor="password-confirm" className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Confirm new password
          </label>
          <input
            id="password-confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-2 min-h-[52px] w-full rounded-[var(--radius-field)] border border-border-strong bg-[var(--surface)] px-4 py-3 text-white outline-none placeholder:text-text-tertiary focus:border-[var(--focus)] focus:shadow-[0_0_0_1px_var(--focus)]"
          />
        </div>
        <button type="submit" disabled={saving} className="premium-button disabled:opacity-60">
          {saving ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}

function EmailCard() {
  const { user, changeEmail } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await changeEmail(currentPassword, newEmail);
      setSaved(true);
      setCurrentPassword("");
      setNewEmail("");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel mt-6 p-5 sm:p-8">
      <h2 className="text-xl font-bold">Email</h2>
      <p className="mt-1 text-sm text-text-tertiary">Current: {user?.email}</p>
      <form className="mt-6 max-w-md space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <p role="alert" data-tone="error" className="status-alert">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p data-tone="success" className="status-alert">
            Email updated. Check your inbox to verify it.
          </p>
        ) : null}
        <div>
          <label htmlFor="email-current-password" className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Current password
          </label>
          <input
            id="email-current-password"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="mt-2 min-h-[52px] w-full rounded-[var(--radius-field)] border border-border-strong bg-[var(--surface)] px-4 py-3 text-white outline-none placeholder:text-text-tertiary focus:border-[var(--focus)] focus:shadow-[0_0_0_1px_var(--focus)]"
          />
        </div>
        <div>
          <label htmlFor="email-new" className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            New email address
          </label>
          <input
            id="email-new"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            className="mt-2 min-h-[52px] w-full rounded-[var(--radius-field)] border border-border-strong bg-[var(--surface)] px-4 py-3 text-white outline-none placeholder:text-text-tertiary focus:border-[var(--focus)] focus:shadow-[0_0_0_1px_var(--focus)]"
          />
        </div>
        <button type="submit" disabled={saving} className="premium-button disabled:opacity-60">
          {saving ? "Updating…" : "Update email"}
        </button>
      </form>
    </div>
  );
}

/**
 * What an account without a password sees (it signs in only with "Continue
 * with Google / Apple"). Both forms above reauthenticate with the current
 * password, which such an account does not have, so they could never
 * succeed; the app has no password or email change either. Mirrors the
 * deletion page's ProviderAccountPanel: say why, and name the route that
 * works.
 */
function ProviderAccountPanel({ providerNames }: { providerNames: string[] }) {
  const { user } = useAuth();
  const providers =
    providerNames.length > 0 ? providerNames.join(" or ") : "Google or Apple";
  return (
    <section
      aria-labelledby="security-provider-heading"
      className="panel p-5 sm:p-8"
    >
      <h2
        id="security-provider-heading"
        className="flex items-center gap-2 text-xl font-bold"
      >
        <ShieldAlert className="size-5 shrink-0 text-warning" aria-hidden="true" />
        This account has no YO Voice password
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
        It signs in with {providers}, so there is no YO Voice password to
        change here. Your {providers} password is changed with {providers}.
      </p>
      {user?.email ? (
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Email on this account:{" "}
          <span className="break-all font-semibold text-white">{user.email}</span>
        </p>
      ) : null}
      <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
        Changing that address here needs a YO Voice password as well. To move
        the account to another address, contact us: we confirm the request
        with you before changing anything. If this is an Apple private relay
        address, write from the address it forwards to and quote the address
        above.
      </p>
      <a
        href={`mailto:${SUPPORT_MAILBOX}?subject=${encodeURIComponent("Change the email on my YO Voice account")}`}
        className="premium-button focus-ring mt-5"
      >
        <Mail className="size-4" aria-hidden="true" />
        Email {SUPPORT_MAILBOX}
      </a>
    </section>
  );
}

export default function SecurityPage() {
  const { user } = useAuth();
  // The account layout renders its own loading state and redirects a signed
  // out visitor, so there is nothing to show here until a user exists.
  if (!user) return null;

  if (!hasPasswordSignIn(user.providerData)) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          How this account signs in.
        </p>
        <div className="mt-6">
          <ProviderAccountPanel
            providerNames={socialProvidersOf(user.providerData).map(
              (provider) => SOCIAL_PROVIDER_NAME[provider],
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Security</h1>
      <p className="mt-1 text-sm text-text-tertiary">
        Manage your password and email. Both require your current password.
      </p>
      <div className="mt-6">
        <PasswordCard />
        <EmailCard />
      </div>
    </div>
  );
}
