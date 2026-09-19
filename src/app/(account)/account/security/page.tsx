"use client";

import { useState, type FormEvent } from "react";

import { useAuth } from "@/hooks/use-auth";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

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
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Current password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className="min-h-[52px] w-full rounded-[var(--radius-field)] border border-border-strong bg-[var(--surface)] px-4 py-3 text-white outline-none placeholder:text-text-tertiary focus:border-[var(--focus)] focus:shadow-[0_0_0_1px_var(--focus)]"
        />
        <input
          type="password"
          autoComplete="new-password"
          placeholder="New password"
          required
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className="min-h-[52px] w-full rounded-[var(--radius-field)] border border-border-strong bg-[var(--surface)] px-4 py-3 text-white outline-none placeholder:text-text-tertiary focus:border-[var(--focus)] focus:shadow-[0_0_0_1px_var(--focus)]"
        />
        <input
          type="password"
          autoComplete="new-password"
          placeholder="Confirm new password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="min-h-[52px] w-full rounded-[var(--radius-field)] border border-border-strong bg-[var(--surface)] px-4 py-3 text-white outline-none placeholder:text-text-tertiary focus:border-[var(--focus)] focus:shadow-[0_0_0_1px_var(--focus)]"
        />
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
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Current password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className="min-h-[52px] w-full rounded-[var(--radius-field)] border border-border-strong bg-[var(--surface)] px-4 py-3 text-white outline-none placeholder:text-text-tertiary focus:border-[var(--focus)] focus:shadow-[0_0_0_1px_var(--focus)]"
        />
        <input
          type="email"
          autoComplete="email"
          placeholder="New email address"
          required
          value={newEmail}
          onChange={(event) => setNewEmail(event.target.value)}
          className="min-h-[52px] w-full rounded-[var(--radius-field)] border border-border-strong bg-[var(--surface)] px-4 py-3 text-white outline-none placeholder:text-text-tertiary focus:border-[var(--focus)] focus:shadow-[0_0_0_1px_var(--focus)]"
        />
        <button type="submit" disabled={saving} className="premium-button disabled:opacity-60">
          {saving ? "Updating…" : "Update email"}
        </button>
      </form>
    </div>
  );
}

export default function SecurityPage() {
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
