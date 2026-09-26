"use client";

import { useCinema } from "@/components/animations/cinema";
import { ServersWelcomeCinema } from "@/components/servers/servers-welcome-cinema";
import {
  SERVERS_INTRO,
  ServersBoundary,
  ServersHeadingWords,
  StarterChannels,
  TemplatePrivacy,
  WORKSPACE_ASPECT,
  WORKSPACE_CAPTION,
  WorkspaceCapture,
} from "@/components/servers/servers-welcome-parts";
import { serverTemplates } from "@/content/server-templates";

/**
 * Servers, introduced rather than announced.
 *
 * The homepage says what a Server *is* — five kinds of space, each with voice
 * channels and text channels — and links to /servers for the full interface
 * and to /updates for the release ledger. It deliberately carries no build
 * number and no "what changed" framing: `serverLaunchPolicy.stage` embeds a
 * build number, so this section states the boundary in words instead.
 *
 * Which channel is a voice channel is not asserted here; it is read from the
 * data (`StarterChannels`), so the split can never drift from the template
 * list the /servers route renders from the same file.
 *
 * The boundary sentence stays, in words and without a build number: Servers
 * have been open to every signed-in account since 16 September 2026 (app
 * ADR-197), YO Voice itself is still in internal testing, and Podcast
 * recording is the one piece still switched off.
 *
 * With the scroll cinema on, the five kinds become a deck of stacking cards
 * (`servers-welcome-cinema.tsx`): each one slides up over the one before it
 * while the heading and the Channels sheet hold still beside them. Without
 * it — on the server, before hydration, with reduced motion, large text or a
 * short window — this grid is what renders, with the same words.
 */
export function ServersWelcome() {
  const cinema = useCinema();
  return cinema ? <ServersWelcomeCinema /> : <ServersWelcomeStatic />;
}

function ServersWelcomeStatic() {
  return (
    <section
      id="servers"
      aria-labelledby="servers-welcome-heading"
      className="relative border-t border-[var(--border)] bg-[var(--background)] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-14">
          <div className="max-w-2xl">
            <p className="eyebrow">Servers</p>
            <h2 id="servers-welcome-heading" className="section-title">
              <ServersHeadingWords />
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-[1.6] text-[var(--text-secondary)]">
              {SERVERS_INTRO}
            </p>
          </div>

          <figure className="mx-auto w-full max-w-[272px] lg:mx-0 lg:ml-auto">
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-1.5">
              <div
                className="relative overflow-hidden rounded-[10px] bg-[var(--surface-sunken)]"
                style={{ aspectRatio: WORKSPACE_ASPECT }}
              >
                <WorkspaceCapture sizes="(max-width: 1024px) 70vw, 272px" />
              </div>
            </div>
            <figcaption className="mt-4 text-center text-xs leading-5 text-[var(--text-tertiary)] lg:text-left">
              {WORKSPACE_CAPTION}
            </figcaption>
          </figure>
        </div>

        <ul
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="The five kinds of Server"
        >
          {serverTemplates.map((template) => (
            <li key={template.id} className="panel flex min-w-0 flex-col p-5">
              <p className="eyebrow">{template.short}</p>
              <h3 className="mt-3 text-lg font-bold text-[var(--foreground)]">{template.name}</h3>
              <p className="mt-1.5 text-sm font-semibold text-[var(--text-secondary)]">
                {template.headline}
              </p>
              <p className="mt-2.5 text-sm leading-6 text-[var(--text-secondary)]">
                {template.description}
              </p>
              <StarterChannels template={template} className="mt-5" />
              <TemplatePrivacy template={template} className="mt-auto pt-5" />
            </li>
          ))}
        </ul>

        <ServersBoundary className="mt-8" />
      </div>
    </section>
  );
}
