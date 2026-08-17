import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FlaskConical } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import {
  productUpdates,
  type ProductUpdateStatus,
} from "@/content/product-updates";

export const metadata: Metadata = {
  title: "Updates",
  description:
    "Follow verified YO Voice release progress, from validation through rollout.",
};

const statusPresentation: Record<
  ProductUpdateStatus,
  { label: string; description: string; className: string; icon: typeof CheckCircle2 }
> = {
  live: {
    label: "Live",
    description: "Verified in production",
    className: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
    icon: CheckCircle2,
  },
  ready: {
    label: "Ready for rollout",
    description: "Built and release-tested, not represented as live yet",
    className: "border-amber-300/25 bg-amber-400/10 text-amber-100",
    icon: Clock3,
  },
  verification: {
    label: "In verification",
    description: "Still behind the production release boundary",
    className: "border-fuchsia-300/25 bg-fuchsia-400/10 text-fuchsia-100",
    icon: FlaskConical,
  },
};

export default function UpdatesPage() {
  return (
    <>
      <PageHero
        eyebrow="Updates"
        title="Release progress, without the guesswork"
        description="See what is being verified, what is ready for rollout, and what has been independently confirmed live."
      />

      <section className="px-5 pb-28 sm:px-8" aria-labelledby="updates-heading">
        <div className="mx-auto max-w-6xl">
          <h2 className="sr-only" id="updates-heading">
            YO Voice product updates
          </h2>

          <div className="grid gap-3 sm:grid-cols-3" aria-label="Release status legend">
            {(Object.keys(statusPresentation) as ProductUpdateStatus[]).map((status) => {
              const item = statusPresentation[status];
              const Icon = item.icon;
              return (
                <div key={status} className="rounded-2xl border border-white/8 bg-white/[.025] p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Icon className="size-4 text-fuchsia-200" aria-hidden="true" />
                    {item.label}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-white/60">{item.description}</p>
                </div>
              );
            })}
          </div>

          <ol className="mt-8 space-y-5">
            {productUpdates.map((update) => {
              const status = statusPresentation[update.status];
              const StatusIcon = status.icon;
              return (
                <li key={update.slug} id={update.slug}>
                  <article className="glass-panel rounded-[28px] p-6 sm:p-8 lg:grid lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-10">
                    <div>
                      <time
                        dateTime={update.updatedOn}
                        className="text-sm font-semibold text-white/55"
                      >
                        Updated{" "}
                        {new Intl.DateTimeFormat("en", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          timeZone: "UTC",
                        }).format(new Date(`${update.updatedOn}T00:00:00Z`))}
                      </time>
                      <div
                        className={`mt-3 inline-flex min-h-8 items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                      >
                        <StatusIcon className="size-3.5" aria-hidden="true" />
                        {status.label}
                      </div>
                    </div>

                    <div className="mt-6 min-w-0 lg:mt-0">
                      <p className="eyebrow">{update.eyebrow}</p>
                      <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-.035em] text-white sm:text-3xl">
                        {update.title}
                      </h2>
                      <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55 sm:text-base">
                        {update.summary}
                      </p>
                      <ul className="mt-5 grid gap-3 md:grid-cols-3">
                        {update.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="rounded-2xl border border-white/8 bg-[#0b0714]/55 p-4 text-sm leading-6 text-white/60"
                          >
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[28px] border border-fuchsia-300/15 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <h2 className="text-xl font-bold text-white">Want the longer view?</h2>
              <p className="mt-2 text-sm leading-6 text-white/50">
                The roadmap separates what is live, in progress and planned.
              </p>
            </div>
            <Link
              href="/roadmap"
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 py-2 text-sm font-black text-[#080711] transition hover:bg-fuchsia-100"
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
