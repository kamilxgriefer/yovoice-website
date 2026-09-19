"use client";

import { Monitor } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";

export default function DevicesPage() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  const lastSignIn = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString()
    : "Unknown";

  return (
    <div>
      <h1 className="text-2xl font-bold">Devices & Sessions</h1>
      <p className="mt-1 text-sm text-text-tertiary">
        Per-device session management isn&apos;t available yet — this needs a
        backend session registry we haven&apos;t built. For now you can see
        and end this browser session.
      </p>

      <div className="panel mt-6 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="icon-tile">
            <Monitor className="size-5" strokeWidth={1.8} aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold">This browser</p>
            <p className="mt-1 text-xs text-text-tertiary">Last sign-in: {lastSignIn}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="premium-button-secondary focus-ring shrink-0"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
