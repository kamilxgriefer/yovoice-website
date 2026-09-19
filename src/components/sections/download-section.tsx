import Link from "next/link";
import { ArrowRight, Download, Globe2, Laptop, Monitor, Smartphone } from "lucide-react";

import { currentReleaseAvailability } from "@/content/current-release";
import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";

const REPO_RELEASES_URL = "https://github.com/kamilxgriefer/yovoice/releases";

/**
 * The way in. Every sentence here is pinned by `tests/product-updates.test.ts`
 * and `tests/servers-landing.test.ts` — "Desktop installers are not available
 * yet" appears exactly twice — so this pass changed the surface only: no
 * bloom behind the section, panels instead of glass, icon tiles instead of
 * gradient squares, and the accent instead of fuchsia on the links.
 */
export function DownloadSection() {
  const platforms = [
    {
      icon: Smartphone,
      title: "Mobile",
      description: `YO Voice on mobile is in internal testing. ${currentReleaseAvailability}`,
      href: "/download",
      action: "View tester access",
    },
    {
      icon: Monitor,
      title: "Windows",
      description: "Desktop installers are not available yet. On Windows, use the web app in a modern browser.",
      href: REPO_RELEASES_URL,
      action: "Check releases",
    },
    {
      icon: Laptop,
      title: "macOS",
      description: "Desktop installers are not available yet. On a Mac, use the web app in a modern browser.",
      href: REPO_RELEASES_URL,
      action: "Check releases",
    },
    {
      icon: Globe2,
      title: "Web",
      description: "Open YO Voice directly from a modern browser without installation.",
      href: APP_ENTRY_PATH,
      action: "Launch web app",
    },
  ];

  return (
    <section id="download" className="relative border-t border-[var(--border)] bg-[var(--background)] py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">YO Voice everywhere</p>
          <h2 className="section-title">
            Ready to find <span className="text-[var(--accent)]">your people?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-[1.6] text-[var(--text-secondary)]">
            Existing internal testers can review the current tester build, while the web app remains available in a modern browser. Public mobile and desktop releases remain separate milestones.
          </p>
        </div>

        {/* min-h on the description exists to equalize card heights when
            they sit in a row; stacked on mobile it only added blank space. */}
        <div id="mobile-downloads" className="mt-10 grid gap-4 sm:mt-14 md:grid-cols-2 xl:grid-cols-4">
          {platforms.map(({icon: Icon,title,description,href,action}) => (
            <article key={title} className="panel flex flex-col p-5 sm:p-6">
              <span className="icon-tile"><Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true"/></span>
              <h3 className="mt-4 text-lg font-bold text-[var(--foreground)]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)] md:min-h-20">{description}</p>
              <Link href={href} className="focus-ring mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--foreground)]">
                {action}<ArrowRight className="size-4"/>
              </Link>
            </article>
          ))}
        </div>

        <div className="panel mt-8 flex flex-col items-start justify-between gap-6 p-6 sm:p-8 lg:flex-row lg:items-center">
          <div className="flex items-start gap-5">
            <span className="icon-tile"><Download className="size-[22px]" strokeWidth={1.8} aria-hidden="true"/></span>
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">One identity across every device</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Your account contract remains shared across the web app and tester builds. Public mobile and desktop installers will be linked here only when they are genuinely available.</p>
            </div>
          </div>
          <Link href={APP_ENTRY_PATH} className="premium-button focus-ring shrink-0">
            Open YO Voice <ArrowRight className="size-4"/>
          </Link>
        </div>
      </div>
    </section>
  );
}
