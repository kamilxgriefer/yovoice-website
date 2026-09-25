import Link from "next/link";
import {
  Archive,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FlaskConical,
  History,
  Layers3,
  Sparkles,
  TestTube2,
} from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { LatestReleaseSpotlight } from "@/components/sections/latest-release-spotlight";
import { TesterBuildExperience } from "@/components/sections/tester-build-experience";
import {
  productUpdates,
  type ProductUpdate,
  type ProductUpdateStatus,
} from "@/content/product-updates";
import { createPageMetadata } from "@/lib/seo/metadata";
import { currentRelease } from "@/content/current-release";

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
  superseded: {
    label: "Superseded",
    description: "Replaced by a later tester build or surface; kept for history",
    icon: History,
  },
};

const currentWave = productUpdates.filter(
  (update) => update.updatedOn >= "2026-09-01",
);
const earlierUpdates = productUpdates.filter(
  (update) => update.updatedOn < "2026-09-01",
);
const releaseWaveRange = formatReleaseWaveRange(currentWave);
const currentReleaseSlug = `mobile-build-${currentRelease.buildNumber}-internal-testing`;
const currentReleaseUpdate = productUpdates.find(
  (update) => update.slug === currentReleaseSlug,
);

export default function UpdatesPage() {
  return (
    <>
      <PageHero
        compact
        eyebrow="Updates"
        title="What's new in YO Voice"
        description="Every update with its date, and every tester build with its version: what is live, what our testers have, and what is still switched off."
      >
        <Link
          href={`#${currentReleaseSlug}`}
          className="focus-ring mx-auto mt-6 inline-flex min-h-11 max-w-full items-center gap-3 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-1.5 text-left transition hover:border-[var(--accent)]"
        >
          <span className="min-w-0 text-[13px] font-semibold text-[var(--foreground)] sm:text-sm">
            YO Voice {currentRelease.version} · {currentRelease.stage}
          </span>
          <ArrowRight className="size-4 shrink-0 text-[var(--accent)]" aria-hidden="true" />
        </Link>
      </PageHero>

      <aside aria-labelledby="servers-development-heading" className="panel mx-auto mb-10 w-[calc(100%-40px)] max-w-6xl p-6 sm:w-[calc(100%-64px)] sm:p-8">
        <p className="eyebrow">
          Servers
          {currentReleaseUpdate ? <> · {formatLedgerDate(currentReleaseUpdate.updatedOn)}</> : null}
        </p>
        <h2 id="servers-development-heading" className="mt-3 text-2xl font-bold tracking-[-.025em] text-[var(--foreground)]">A new look, the same circles</h2>
        <p className="mt-3 max-w-3xl text-base leading-[1.6] text-[var(--text-secondary)]">
          Servers — Friends, Community, Podcast, Family and Company — are open to every signed-in account. In the new design they sit in a compact list, with a server rail beside the channels. Podcast recording remains disabled.
        </p>
        <Link href="/servers" className="link-accent focus-ring mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold">Explore the Servers interface <ArrowRight className="size-4" aria-hidden="true" /></Link>
      </aside>

      {/* Moved here from the homepage on 2026-09-16: a release spotlight and
          a build-by-build interface walkthrough are release-ledger content,
          not a welcome. The spotlight reads the current tester build from
          current-release.ts; the walkthrough's captures are labelled with the
          build they were taken in (Build 26) and never claim a later one. */}
      <LatestReleaseSpotlight />
      <TesterBuildExperience />

      <section className="mt-16 px-5 pb-24 sm:px-8 sm:mt-20" aria-labelledby="updates-heading">
        <div className="mx-auto max-w-6xl">
          <h2 className="sr-only" id="updates-heading">
            YO Voice product updates
          </h2>

          <div>
            <ul
              className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
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
                      className="release-status rounded-[var(--radius-field)] border px-3.5 py-3"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold sm:text-sm">
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
            <span className="icon-tile">
              <Sparkles className="size-5" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="eyebrow">
                Current release wave
              </p>
              <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                {releaseWaveRange} · newest first
              </p>
            </div>
            <span className="hidden min-h-8 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] font-semibold text-[var(--text-secondary)] sm:inline-flex">
              <Layers3 className="size-3.5" aria-hidden="true" />
              {currentWave.length} entries
            </span>
          </div>

          <ol className="mt-5 space-y-4">
            {currentWave.map((update) => (
              <UpdateCard
                key={update.slug}
                update={update}
                featured={update.slug === currentReleaseSlug}
              />
            ))}
          </ol>

          {earlierUpdates.length > 0 ? (
            <details className="group mt-10 border-t border-[var(--border)] pt-4">
              <summary className="focus-ring flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-[var(--radius-field)] px-2 text-left transition hover:bg-[var(--surface)] [&::-webkit-details-marker]:hidden">
                <span className="icon-tile">
                  <Archive className="size-5" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-[var(--foreground)]">
                    Earlier updates
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--text-secondary)]">
                    {earlierUpdates.length} archived ledger entries
                  </span>
                </span>
                <ChevronDown
                  className="size-4 text-[var(--text-secondary)] transition group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>

              <ol className="mt-3 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                {earlierUpdates.map((update) => (
                  <UpdateCard key={update.slug} update={update} archived />
                ))}
              </ol>
            </details>
          ) : null}

          <div className="panel mt-10 flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                Want the longer view?
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                The roadmap separates what is live, in progress and planned.
              </p>
            </div>
            <Link
              href="/roadmap"
              className="roadmap-cta focus-ring inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-field)] px-5 py-2 text-sm font-semibold transition"
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
  archived = false,
}: {
  update: ProductUpdate;
  featured?: boolean;
  archived?: boolean;
}) {
  const status = statusPresentation[update.status];
  const StatusIcon = status.icon;

  // Current-wave entries are cards; archived entries are plain rows with the
  // date on the left, separated by the list's hairlines instead of boxes.
  return (
    <li id={update.slug} className="scroll-mt-28">
      <article
        aria-labelledby={update.slug + "-title"}
        className={[
          archived
            ? "relative grid grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)] gap-x-4 px-1 py-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-x-8 sm:px-2"
            : "relative p-5 sm:p-7 lg:grid lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-8",
          archived
            ? ""
            : featured && update.release
              ? "release-card-featured"
              : "panel",
        ].join(" ")}
      >
        <div className="min-w-0">
          <time
            dateTime={update.updatedOn}
            className="block text-xs font-semibold text-[var(--text-secondary)] sm:text-sm"
          >
            <span className="block text-[11px] font-bold uppercase tracking-[.12em] text-[var(--text-tertiary)]">
              Updated
            </span>
            <span className="mt-1 block">
              {formatLedgerDate(update.updatedOn)}
            </span>
          </time>
          <div
            data-status={update.status}
            className="release-status mt-3 inline-flex min-h-8 max-w-full items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold"
          >
            <StatusIcon className="size-3.5 shrink-0" aria-hidden="true" />
            {status.label}
          </div>
          {update.release ? (
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 lg:block">
              <span
                className="release-build-orb inline-flex h-7 min-w-10 shrink-0 items-center justify-center px-2.5 text-[13px] font-extrabold tabular-nums text-white"
              >
                <span className="sr-only">Build </span>
                {update.release.buildNumber}
              </span>
              <div className="min-w-0 lg:mt-3">
                <p className="break-words text-sm font-bold text-[var(--foreground)]">
                  {update.release.version}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  {update.release.stage}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className={archived ? "min-w-0" : "mt-5 min-w-0 lg:mt-0"}>
          <p className="eyebrow">{update.eyebrow}</p>
          <h2
            id={update.slug + "-title"}
            className={`mt-2 break-words font-[family-name:var(--font-display)] font-bold tracking-[-.025em] text-[var(--foreground)] ${
              archived ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
            }`}
          >
            {update.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-[1.6] text-[var(--text-secondary)] sm:text-base">
            {update.summary}
          </p>
          <ul className={`mt-4 grid gap-x-6 gap-y-2 ${archived ? "" : "md:grid-cols-3"}`}>
            {update.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex gap-2.5 text-sm leading-6 text-[var(--text-secondary)]"
              >
                <span className="mt-[.6rem] size-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                <span className="min-w-0">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </li>
  );
}

function formatLedgerDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
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
