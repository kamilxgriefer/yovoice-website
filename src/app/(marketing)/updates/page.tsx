import Link from "next/link";
import {
  Archive,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FlaskConical,
  Layers3,
  Sparkles,
  TestTube2,
} from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import {
  productUpdates,
  type ProductUpdate,
  type ProductUpdateStatus,
} from "@/content/product-updates";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Updates",
  description:
    "Follow verified YO Voice release progress, from validation through rollout.",
  path: "/updates",
  socialTitle: "YO Voice Updates",
});

const statusPresentation: Record<
  ProductUpdateStatus,
  {
    label: string;
    description: string;
    icon: typeof CheckCircle2;
  }
> = {
  live: {
    label: "Live",
    description: "Verified in production",
    icon: CheckCircle2,
  },
  testing: {
    label: "In testing",
    description: "Available; acceptance continues",
    icon: TestTube2,
  },
  ready: {
    label: "Ready for rollout",
    description: "Built and release-tested",
    icon: Clock3,
  },
  verification: {
    label: "In verification",
    description: "Still behind a release boundary",
    icon: FlaskConical,
  },
};

const currentWave = productUpdates.filter(
  (update) => update.updatedOn >= "2026-09-01",
);
const earlierUpdates = productUpdates.filter(
  (update) => update.updatedOn < "2026-09-01",
);
const releaseWaveRange = formatReleaseWaveRange(currentWave);

export default function UpdatesPage() {
  return (
    <>
      <PageHero
        compact
        eyebrow="Updates"
        title="What changed — and where it really stands"
        description="A release-truth ledger for the current YO Voice experience: verified production work, tester builds, rollout-ready changes and items that still have a boundary to clear."
      >
        <Link
          href="#mobile-build-20-invited-testing"
          className="focus-ring mx-auto mt-7 inline-flex min-h-12 max-w-full items-center gap-3 rounded-full border border-[color:var(--accent)]/25 bg-[color:var(--accent)]/[.075] px-4 text-left transition hover:border-[color:var(--accent)]/45 hover:bg-[color:var(--accent)]/[.12]"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[11px] font-black text-white shadow-[0_8px_24px_rgba(123,47,247,.35)]">
            20
          </span>
          <span className="min-w-0 text-xs font-bold text-white/80 sm:text-sm">
            Build 20 · invited testing
          </span>
          <ArrowRight className="size-4 shrink-0 text-[var(--accent)]" aria-hidden="true" />
        </Link>
      </PageHero>

      <section className="px-5 pb-24 sm:px-8" aria-labelledby="updates-heading">
        <div className="mx-auto max-w-6xl">
          <h2 className="sr-only" id="updates-heading">
            YO Voice product updates
          </h2>

          <div className="rounded-[26px] border border-white/[.07] bg-[var(--surface-muted)]/70 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.035)] sm:p-3">
            <ul
              className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 lg:grid-cols-4"
              aria-label="Release status legend"
            >
              {(Object.keys(statusPresentation) as ProductUpdateStatus[]).map(
                (status) => {
                  const item = statusPresentation[status];
                  const Icon = item.icon;
                  return (
                    <li
                      key={status}
                      data-status={status}
                      className="release-status rounded-2xl border px-3.5 py-3"
                    >
                      <div className="flex items-center gap-2 text-xs font-black sm:text-sm">
                        <Icon className="size-4" aria-hidden="true" />
                        {item.label}
                      </div>
                      <p className="mt-1 text-[11px] leading-4 sm:text-xs">
                        {item.description}
                      </p>
                    </li>
                  );
                },
              )}
            </ul>
          </div>

          <div className="mt-9 flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-2xl border border-[color:var(--accent)]/25 bg-[color:var(--accent)]/10 text-[var(--accent)]">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--accent)]">
                Current release wave
              </p>
              <p className="mt-0.5 text-sm text-white/60">
                {releaseWaveRange} · source, tests and rollout truth
              </p>
            </div>
            <span className="hidden min-h-9 items-center gap-2 rounded-full border border-white/[.08] bg-white/[.035] px-3 text-xs font-bold text-white/55 sm:inline-flex">
              <Layers3 className="size-3.5" aria-hidden="true" />
              {currentWave.length} entries
            </span>
          </div>

          <ol className="mt-5 space-y-4">
            {currentWave.map((update, index) => (
              <UpdateCard
                key={update.slug}
                update={update}
                featured={index === 0}
              />
            ))}
          </ol>

          {earlierUpdates.length > 0 ? (
            <details className="group mt-6 rounded-[28px] border border-[var(--border)] bg-[var(--surface-muted)]/80 p-3 sm:p-4">
              <summary className="focus-ring flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-[20px] px-3 text-left transition hover:bg-white/[.035] sm:px-4 [&::-webkit-details-marker]:hidden">
                <span className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[.04] text-white/70">
                  <Archive className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black text-white">
                    Earlier updates
                  </span>
                  <span className="mt-0.5 block text-xs text-white/60">
                    {earlierUpdates.length} archived ledger entries
                  </span>
                </span>
                <ChevronDown
                  className="size-4 text-white/60 transition group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>

              <ol className="mt-3 space-y-4 border-t border-white/[.06] pt-4">
                {earlierUpdates.map((update) => (
                  <UpdateCard key={update.slug} update={update} />
                ))}
              </ol>
            </details>
          ) : null}

          <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[28px] border border-[color:var(--accent)]/20 bg-gradient-to-r from-[color:var(--primary)]/12 to-[color:var(--accent)]/8 p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <h2 className="text-xl font-bold text-white">
                Want the longer view?
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/65">
                The roadmap separates what is live, in progress and planned.
              </p>
            </div>
            <Link
              href="/roadmap"
              className="roadmap-cta focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-2 text-sm font-black transition"
            >
              View roadmap
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function UpdateCard({
  update,
  featured = false,
}: {
  update: ProductUpdate;
  featured?: boolean;
}) {
  const status = statusPresentation[update.status];
  const StatusIcon = status.icon;

  return (
    <li id={update.slug} className="scroll-mt-28">
      <article
        aria-labelledby={update.slug + "-title"}
        className={[
          "relative rounded-[26px] p-5 sm:p-7 lg:grid lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-8",
          featured && update.release
            ? "release-card-featured"
            : featured
              ? "glass-panel-glow"
              : "glass-panel",
        ].join(" ")}
      >
        <div>
          <time
            dateTime={update.updatedOn}
            className="block text-xs font-semibold text-white/60 sm:text-sm"
          >
            <span className="block text-[10px] font-black uppercase tracking-[.16em] text-white/40">
              Updated
            </span>
            <span className="mt-1 block">
              {new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }).format(new Date(`${update.updatedOn}T00:00:00Z`))}
            </span>
          </time>
          <div
            data-status={update.status}
            className="release-status mt-3 inline-flex min-h-8 items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold"
          >
            <StatusIcon className="size-3.5" aria-hidden="true" />
            {status.label}
          </div>
          {update.release ? (
            <div className="mt-5 flex items-center gap-3 lg:block">
              <span
                className="release-build-orb flex size-14 shrink-0 items-center justify-center rounded-2xl font-[family-name:var(--font-display)] text-2xl font-black tabular-nums text-white lg:size-20 lg:rounded-[24px] lg:text-3xl"
              >
                <span className="sr-only">Build </span>
                {update.release.buildNumber}
              </span>
              <div className="min-w-0 lg:mt-3">
                <p className="break-words text-sm font-black text-white">
                  {update.release.version}
                </p>
                <p className="mt-0.5 text-xs text-white/50">
                  {update.release.stage}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-5 min-w-0 lg:mt-0">
          <p className="eyebrow">{update.eyebrow}</p>
          <h2
            id={update.slug + "-title"}
            className="mt-2 break-words font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-.035em] text-white sm:text-3xl"
          >
            {update.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-secondary)] sm:text-[15px]">
            {update.summary}
          </p>
          <ul className="mt-4 grid gap-2.5 md:grid-cols-3">
            {update.highlights.map((highlight) => (
              <li
                key={highlight}
                className="rounded-[18px] border border-white/[.085] bg-[var(--surface-sunken)]/78 p-3.5 text-sm leading-6 text-[var(--text-secondary)] shadow-[inset_0_1px_0_rgba(255,255,255,.025)]"
              >
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </li>
  );
}

function formatReleaseWaveRange(updates: readonly ProductUpdate[]) {
  if (updates.length === 0) return "No current entries";

  const dates = updates.map((update) => update.updatedOn).sort();
  const format = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  const first = format.format(new Date(`${dates[0]}T00:00:00Z`));
  const last = format.format(new Date(`${dates.at(-1)}T00:00:00Z`));

  return first === last ? first : `${first} – ${last}`;
}
