"use client";

import {
  CheckCircle2,
  DoorOpen,
  ShieldCheck,
  Users,
} from "lucide-react";

import { usePublicStats } from "@/hooks/use-public-stats";

function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

function formatVerifiedTime(value: Date): string {
  return value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StatsSection() {
  const publicStats = usePublicStats();
  const hasFreshStats = publicStats.status === "fresh";

  const cards = [
    {
      icon: Users,
      value: hasFreshStats
        ? formatCount(publicStats.stats.activeAccounts)
        : "—",
      label: "Accounts on YO Voice",
      description: hasFreshStats
        ? "Accounts that currently exist and are able to use YO Voice."
        : "Current verified total unavailable.",
      verified: hasFreshStats,
    },
    {
      icon: DoorOpen,
      value: hasFreshStats
        ? formatCount(publicStats.stats.existingRooms)
        : "—",
      label: "Rooms on YO Voice",
      description: hasFreshStats
        ? "Voice spaces that currently exist across the platform."
        : "Current verified total unavailable.",
      verified: hasFreshStats,
    },
  ];

  return (
    <section
      id="stats"
      aria-labelledby="verified-stats-heading"
      aria-busy={publicStats.status === "loading"}
      className="relative px-5 pb-20 pt-10 sm:px-8 sm:pt-14 lg:px-10"
    >
      <div className="mx-auto max-w-[920px]">
        <header className="mx-auto max-w-[650px] text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3.5 py-2 text-[10.5px] font-bold tracking-[0.16em] text-emerald-100/75">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            SERVER-VERIFIED TOTALS
          </div>
          <h2
            id="verified-stats-heading"
            className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.035em] text-white sm:text-5xl"
          >
            Real platform. Real numbers.
          </h2>
          <p className="mx-auto mt-4 max-w-[580px] text-sm leading-6 text-white/60 sm:text-base sm:leading-7">
            Platform totals come directly from YO Voice and refresh every five
            minutes. If a measurement is missing or old, we show no number at all.
          </p>
        </header>

        <div className="mt-9 grid gap-4 md:grid-cols-2">
          {cards.map(({ icon: Icon, value, label, description, verified }) => (
            <article
              key={label}
              className="glass-panel group relative flex min-h-[260px] flex-col overflow-hidden rounded-[24px] p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-fuchsia-300/20 sm:p-8"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-fuchsia-500/10 blur-3xl transition-opacity duration-300 group-hover:opacity-80" />
              <div className="relative flex items-start justify-between gap-5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-500/20 text-fuchsia-200">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                {verified && (
                  <CheckCircle2
                    className="mt-1 size-4 text-emerald-300/70"
                    aria-label="Verified"
                  />
                )}
              </div>

              <dl className="relative flex flex-1 flex-col">
                <dt className="order-2 mt-2 text-sm font-semibold text-white/80">
                  {label}
                </dt>
                <dd className="order-1 mt-7 font-[family-name:var(--font-display)] text-4xl font-bold tabular-nums text-white sm:text-5xl">
                  {value}
                </dd>
                <dd className="order-3 mt-2 text-xs leading-5 text-white/55">
                  {description}
                </dd>
              </dl>
            </article>
          ))}
        </div>

        <p
          role="status"
          className="mx-auto mt-5 max-w-[720px] text-center text-xs leading-5 text-white/45"
        >
          {hasFreshStats
            ? `Last verified at ${formatVerifiedTime(publicStats.stats.updatedAt)}. Counts are exact — never rounded up or replaced with estimates.`
            : publicStats.status === "loading"
              ? "Checking the latest server-verified platform totals…"
              : publicStats.status === "stale"
                ? "The latest totals are out of date, so they are hidden until the next verified refresh."
                : "Verified platform totals are temporarily unavailable. They will return automatically after a successful refresh."}
        </p>
      </div>
    </section>
  );
}
