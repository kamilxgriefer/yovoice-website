import Link from "next/link";
import { ArrowRight, Download, Globe2, Laptop, Monitor, Smartphone, type LucideIcon } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";
import { BeYouFinale } from "@/components/sections/be-you-finale";
import { PlatformDeck, ZoomHeading } from "@/components/sections/download-cinema";
import { currentReleaseAvailability } from "@/content/current-release";
import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";

/**
 * The way in. Every sentence here is pinned by `tests/product-updates.test.ts`
 * and `tests/servers-landing.test.ts` — the desktop sentence appears exactly
 * twice — so the copy stays in this file and the scroll cinema only moves it:
 * the heading zooms into place (`ZoomHeading`), the four platform cards are
 * dealt from one fanned stack (`PlatformDeck`) and the identity panel rises
 * in. Without the cinema everything is drawn at rest in the same layout.
 *
 * `finale` closes the page on the giant "Be You." (`BeYouFinale`). Only the
 * homepage asks for it (owner, 2026-09-26): /servers renders this section
 * too and ends on the way in, not on the homepage's last word.
 *
 * The desktop cards carry no action: there are no desktop installers and no
 * published GitHub releases, and the Web card already links to the web app.
 */
type PlatformCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  action?: string;
};

export function DownloadSection({ finale = false }: { finale?: boolean }) {
  const platforms: PlatformCard[] = [
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
    },
    {
      icon: Laptop,
      title: "macOS",
      description: "Desktop installers are not available yet. On a Mac, use the web app in a modern browser.",
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
    <section
      id="download"
      aria-labelledby="download-heading"
      className={`relative overflow-x-clip border-t border-[var(--border)] bg-[var(--background)] pt-16 sm:pt-24 ${finale ? "" : "pb-16 sm:pb-24"}`}
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <p className="eyebrow">YO Voice everywhere</p>
          </Reveal>
          <ZoomHeading id="download-heading" className="section-title">
            Ready to find <span className="text-[var(--accent)]">your people?</span>
          </ZoomHeading>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-[1.6] text-[var(--text-secondary)]">
              Existing internal testers can review the current tester build, while the web app remains available in a modern browser. Public mobile and desktop releases remain separate milestones.
            </p>
          </Reveal>
        </div>

        {/* min-h on the description exists to equalize card heights when
            they sit in a row; stacked on mobile it only added blank space. */}
        <PlatformDeck
          id="mobile-downloads"
          className="mt-10 grid gap-4 sm:mt-14 md:grid-cols-2 xl:grid-cols-4"
          cards={platforms.map(({ icon: Icon, title, description, href, action }) => (
            <article key={title} className="panel flex flex-1 flex-col p-5 sm:p-6">
              <span className="icon-tile"><Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true"/></span>
              <h3 className="mt-4 text-lg font-bold text-[var(--foreground)]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)] md:min-h-20">{description}</p>
              {href && action ? (
                <Link href={href} className="focus-ring mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold link-accent">
                  {action}<ArrowRight className="size-4" aria-hidden="true"/>
                </Link>
              ) : null}
            </article>
          ))}
        />

        <Reveal className="panel mt-8 flex flex-col items-start justify-between gap-6 p-6 sm:p-8 lg:flex-row lg:items-center">
          <div className="flex items-start gap-5">
            <span className="icon-tile"><Download className="size-[22px]" strokeWidth={1.8} aria-hidden="true"/></span>
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">One identity across every device</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Your account contract remains shared across the web app and tester builds. Public mobile and desktop installers will be linked here only when they are genuinely available.</p>
            </div>
          </div>
          <Link href={APP_ENTRY_PATH} className="premium-button focus-ring shrink-0">
            Open YO Voice <ArrowRight className="size-4" aria-hidden="true"/>
          </Link>
        </Reveal>

        {finale ? <BeYouFinale /> : null}
      </div>
    </section>
  );
}
