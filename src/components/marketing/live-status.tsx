"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";

type CheckState = "checking" | "ok" | "down";

const systems = [
  { name: "Website", description: "yovoice.app and marketing pages" },
  { name: "Accounts & sign-in", description: "Registration, login, email verification" },
  { name: "Voice rooms", description: "Real-time voice via LiveKit" },
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
      <div className="glass-panel divide-y divide-white/[.06] overflow-hidden rounded-[28px]">
        {systems.map((system, index) => {
          const isWebsite = index === 0;
          const state: CheckState = isWebsite ? websiteCheck : "ok";
          return (
            <div key={system.name} className="flex items-center justify-between gap-4 p-6">
              <div>
                <p className="font-semibold text-white">{system.name}</p>
                <p className="mt-1 text-xs text-white/40">{system.description}</p>
              </div>
              <StatusBadge state={state} live={isWebsite} />
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-center text-xs text-white/35">
        {checkedAt ? `Website status checked live at ${checkedAt}.` : "Checking live status…"} Other
        rows reflect our current operating status.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-white/45">
          YO Voice runs on Firebase, LiveKit and Vercel. For incidents on
          those platforms, see their status pages directly:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-fuchsia-300">
          <a
            href="https://status.firebase.google.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-white"
          >
            Firebase status <ExternalLink className="size-3.5" />
          </a>
          <a
            href="https://www.vercel-status.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-white"
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
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-xs font-bold text-white/50">
        <Loader2 className="size-3.5 animate-spin" /> Checking…
      </span>
    );
  }
  if (state === "down") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/25 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300">
        <XCircle className="size-3.5" /> Unreachable
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
      <CheckCircle2 className="size-3.5" /> Operational{live ? " (live)" : ""}
    </span>
  );
}
