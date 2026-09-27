"use client";

import Link from "next/link";
import { ArrowRight, Download, Globe2, Laptop, Monitor, Smartphone, type LucideIcon } from "lucide-react";

import { useCinema } from "@/components/animations/cinema";
import { Reveal } from "@/components/animations/reveal";
import { SceneOpener } from "@/components/animations/scene-opener";
import { BeYouFinale } from "@/components/sections/be-you-finale";
import { PlatformDeck } from "@/components/sections/download-cinema";
import { MagneticCta } from "@/components/ui/magnetic-cta";
import { currentReleaseAvailability } from "@/content/current-release";
import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";
import { cn } from "@/lib/utils/cn";

/**
 * The way in. Every sentence here is pinned by `tests/product-updates.test.ts`
 * and `tests/servers-landing.test.ts` — the desktop sentence appears exactly
 * twice — so the copy stays in this file and the scroll cinema only moves it.
 *
 * It sits on the homepage frame and opens the way every section does
 * (`SceneOpener`): the ruled eyebrow in the Download ink, "Ready to find /
 * your people?" rising word by word, and the lead. The four platform cards
 * are then dealt from one fanned stack (`PlatformDeck`) and the identity
 * panel rises in. Without the cinema everything is drawn at rest in the same
 * layout.
 *
 * `finale` is the homepage: the section closes the page on the giant
 * "Be You." (`BeYouFinale`), its title takes the scroll cinema's scene size,
 * "Open YO Voice" answers the pointer the way every primary action on the
 * homepage does (`MagneticCta`), and in the cinema it shares the page's one
 * ground with Premium instead of a hairline. /servers renders this section
 * too (owner, 2026-09-26) and ends on the way in, not on the homepage's last
 * word: there it keeps the site's section title size — the page's own `<h1>`
 * is that size, and only the homepage's scenes may outgrow their hero — its
 * hairline and a still button.
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
  const cinema = useCinema();
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
      className={cn(
        // A stacking context of its own, so the finale's flood can lie behind
        // everything in it and still over its ground.
        "relative isolate overflow-x-clip bg-[var(--background)] pt-[var(--opener-top)]",
        finale && cinema ? "" : "border-t border-[var(--border)]",
        finale ? "" : "pb-[var(--section-bottom)]",
      )}
    >
      <div className="frame">
        <SceneOpener
          className="max-w-4xl"
          // /servers keeps the site's section title: its own heading is smaller.
          size={finale ? "scene" : "section"}
          eyebrow="YO Voice everywhere"
          ink="#d986ff"
          title="Ready to find"
          accent="your people?"
          accentClassName="sm:block"
          headingId="download-heading"
          titleClassName="text-balance"
          leadClassName="text-pretty"
          lead="Existing internal testers can review the current tester build, while the web app remains available in a modern browser. Public mobile and desktop releases remain separate milestones."
        />

        {/* min-h on the description exists to equalize card heights when
            they sit in a row; stacked on mobile it only added blank space. */}
        <PlatformDeck
          id="mobile-downloads"
          className="mt-[var(--opener-gap)] grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          cards={platforms.map(({ icon: Icon, title, description, href, action }) => (
            <article key={title} className="panel flex flex-1 flex-col p-5 sm:p-6">
              <span className="icon-tile"><Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true"/></span>
              <h3 className="mt-4 text-lg font-bold text-[var(--foreground)]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)] md:min-h-20">{description}</p>
              {href && action ? (
                <Link href={href} className="focus-ring mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold link-accent">
                  {action}<ArrowRight className="arrow-nudge size-4" aria-hidden="true"/>
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
          {finale ? (
            <MagneticCta href={APP_ENTRY_PATH} wrapperClassName="shrink-0">
              Open YO Voice <ArrowRight className="arrow-nudge size-4" aria-hidden="true"/>
            </MagneticCta>
          ) : (
            <Link href={APP_ENTRY_PATH} className="premium-button focus-ring shrink-0">
              Open YO Voice <ArrowRight className="arrow-nudge size-4" aria-hidden="true"/>
            </Link>
          )}
        </Reveal>

        {finale ? <BeYouFinale /> : null}
      </div>
    </section>
  );
}
