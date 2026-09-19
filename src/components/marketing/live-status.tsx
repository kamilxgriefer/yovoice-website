"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";

type CheckState = "checking" | "ok" | "down";

const systems = [
  { name: "Website", description: "yovoice.app and marketing pages" },
  { name: "Accounts & sign-in", description: "Registration, login, email verification" },
  { name: "Voice services", description: "Real-time voice via LiveKit" },
  { name: "Email delivery", description: "Verification and password-reset email" },
] as const;

export function LiveStatus() {
  const [websiteCheck, setWebsiteCheck] = useState<CheckState>("checking");
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health", { cache: "no-store" })
      .then((res) => {
        if (cancelled) return;
        setWebsiteCheck(res.ok ? "ok" : "down");
        setCheckedAt(new Date().toLocaleTimeString());
      })
      .catch(() => {
        if (cancelled) return;
        setWebsiteCheck("down");
        setCheckedAt(new Date().toLocaleTimeString());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="panel divide-y divide-[var(--border)] overflow-hidden">
        {systems.map((system, index) => {
          const isWebsite = index === 0;
          const state: CheckState = isWebsite ? websiteCheck : "ok";
          return (
            <div key={system.name} className="flex items-center justify-between gap-4 p-6">
              <div>
                <p className="font-semibold text-[var(--foreground)]">{system.name}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{system.description}</p>
              </div>
              <StatusBadge state={state} live={isWebsite} />
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-center text-xs text-[var(--text-secondary)]">
        {checkedAt ? `Website status checked live at ${checkedAt}.` : "Checking live status…"} Other
        rows reflect our current operating status.
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

function StatusBadge({ state, live }: { state: CheckState; live: boolean }) {
  if (state === "checking") {
    return (
      <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)]">
        <Loader2 className="size-3.5 animate-spin" /> Checking…
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
      <CheckCircle2 className="size-3.5" /> Operational{live ? " (live)" : ""}
    </span>
  );
}
