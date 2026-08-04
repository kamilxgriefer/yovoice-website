"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, TriangleAlert } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { getAppUrl } from "@/lib/auth/auth-redirect";

export default function ProfilePage() {
  const { user, updateDisplayName, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await updateDisplayName(displayName);
      setSaved(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="glass-panel rounded-[28px] p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="mt-1 text-sm text-white/45">
            This is how you appear across YO Voice.
          </p>
        </div>
        <Link
          href={getAppUrl()}
          className="premium-button min-h-11 shrink-0 px-5 text-sm"
        >
          Open YO Voice <ExternalLink className="size-4" />
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.02] p-4">
        <div>
          <p className="text-sm font-semibold text-white">{user.email}</p>
          {user.emailVerified ? (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="size-3.5" /> Email verified
            </p>
          ) : (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-amber-300">
              <TriangleAlert className="size-3.5" />
              Not verified —{" "}
              <Link href="/verify-email" className="underline underline-offset-2 hover:text-white">
                verify now
              </Link>
            </p>
          )}
        </div>
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Log out
          </button>
        </div>
      </div>

      <form className="mt-8 max-w-md space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <p role="alert" className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Saved.
          </p>
        ) : null}

        <div>
          <label htmlFor="profile-email" className="text-xs font-semibold uppercase tracking-wide text-white/40">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            value={user.email ?? ""}
            disabled
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.02] px-4 py-3.5 text-white/50 outline-none"
          />
          <p className="mt-1 text-xs text-white/35">Change your email from Security.</p>
        </div>

        <div>
          <label htmlFor="profile-name" className="text-xs font-semibold uppercase tracking-wide text-white/40">
            Display name
          </label>
          <input
            id="profile-name"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400/40"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="premium-button min-h-12 px-6 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
