"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleDashed, ExternalLink, Loader2, XCircle } from "lucide-react";

type CheckState = "checking" | "ok" | "down" | "unmonitored";

// Only the Website row is checked, against /api/health. The site has no
// endpoint that checks the other systems, so their rows say so instead of
// showing a green badge that nothing measured.
const systems = [
  { name: "Website", description: "yovoice.app and marketing pages", monitored: true },
  { name: "Accounts & sign-in", description: "Registration, login, email verification", monitored: false },
  { name: "Voice services", description: "Real-time voice via LiveKit", monitored: false },
  { name: "Email delivery", description: "Verification and password-reset email", monitored: false },
] as const;

// The viewer's own clock, so the zone shown is the viewer's zone.
function checkTime(): string {
  return new Date().toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "long",
  });
}

export function LiveStatus() {
  const [websiteCheck, setWebsiteCheck] = useState<CheckState>("checking");
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health", { cache: "no-store" })
      .then((res) => {
        if (cancelled) return;
        setWebsiteCheck(res.ok ? "ok" : "down");
        setCheckedAt(checkTime());
      })
      .catch(() => {
        if (cancelled) return;
        setWebsiteCheck("down");
        setCheckedAt(checkTime());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="panel divide-y divide-[var(--border)] overflow-hidden">
        {systems.map((system) => {
          const state: CheckState = system.monitored ? websiteCheck : "unmonitored";
          return (
            <div key={system.name} className="flex items-center justify-between gap-4 p-6">
              <div>
                <p className="font-semibold text-[var(--foreground)]">{system.name}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{system.description}</p>
              </div>
              <StatusBadge state={state} />
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-center text-xs text-[var(--text-secondary)]">
        {checkedAt ? `Website checked live: ${checkedAt}.` : "Checking the website…"} The
        other rows are not monitored from this page.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          YO Voice runs on Firebase, LiveKit and Vercel. For incidents on
          those platforms, see their status pages directly:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
          <a
            href="https://status.firebase.google.com/"
            target="_blank"
            rel="noreferrer"
            className="link-accent focus-ring inline-flex min-h-11 items-center gap-1.5"
          >
            Firebase status <ExternalLink className="size-3.5" />
          </a>
          <a
            href="https://status.livekit.io/"
            target="_blank"
            rel="noreferrer"
            className="link-accent focus-ring inline-flex min-h-11 items-center gap-1.5"
          >
            LiveKit status <ExternalLink className="size-3.5" />
          </a>
          <a
            href="https://www.vercel-status.com/"
            target="_blank"
            rel="noreferrer"
            className="link-accent focus-ring inline-flex min-h-11 items-center gap-1.5"
          >
            Vercel status <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ state }: { state: CheckState }) {
  if (state === "checking") {
    return (
      <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)]">
        <Loader2 className="size-3.5 animate-spin" /> Checking…
      </span>
    );
  }
  if (state === "unmonitored") {
    return (
      <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)]">
        <CircleDashed className="size-3.5" aria-hidden="true" /> Not monitored here
      </span>
    );
  }
  if (state === "down") {
    return (
      <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--error)_38%,transparent)] bg-[var(--danger-surface)] px-3 py-1.5 text-xs font-bold text-[var(--error)]">
        <XCircle className="size-3.5" /> Unreachable
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--success)_38%,transparent)] bg-[var(--success-surface)] px-3 py-1.5 text-xs font-bold text-[var(--success)]">
      <CheckCircle2 className="size-3.5" /> Operational (live)
    </span>
  );
}
