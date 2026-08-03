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
      <p className="mt-1 text-sm text-white/45">
        Per-device session management isn&apos;t available yet — this needs a
        backend session registry we haven&apos;t built. For now you can see
        and end this browser session.
      </p>

      <div className="glass-panel mt-6 flex items-center justify-between gap-4 rounded-[28px] p-7">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-500/20 text-fuchsia-200">
            <Monitor className="size-5" />
          </div>
          <div>
            <p className="font-semibold">This browser</p>
            <p className="mt-1 text-xs text-white/40">Last sign-in: {lastSignIn}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
