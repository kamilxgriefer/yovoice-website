import Image from "next/image";
import Link from "next/link";
import { ArrowRight, AudioLines, Hash, Lock } from "lucide-react";

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
 * data. Every template names its live channel in `channel`, and that is the
 * one rendered with the voice glyph, so the split can never drift from the
 * template list the /servers route renders from the same file.
 *
 * The boundary sentence stays, in words and without a build number: Servers
 * have been open to every signed-in account since 16 September 2026 (app
 * ADR-197), YO Voice itself is still in internal testing, and Podcast
 * recording is the one piece still switched off.
 */
export function ServersWelcome() {
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
              A server for{" "}
              <span className="text-[var(--accent)]">every circle.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-[1.6] text-[var(--text-secondary)]">
              A Server is the home your group comes back to: voice channels to
              talk in, text channels to carry on in, and a shape that suits the
              people inside it. Pick the one that sounds like your circle.
            </p>
          </div>

          {/* The channel list as the 3.0.0 app draws it on a phone: the
              Channels sheet, with the server rail down its left edge, the
              server's name, privacy and member count, the Invite action, and
              its text, voice and organisation channels, live voice channels
              marked LIVE. The cards below name the starter channels per
              template; this is what they look like inside.

              The frame is trimmed to the sheet's own top edge, so the dimmed
              workspace behind it is not in the picture — which is why the
              height here is not the 2622 px of the other phone frames.

              The file carries a new name rather than replacing the old one in
              place. Next's image optimizer keys its cache on the href, width,
              quality and mime type only — never on the source bytes — so an
              edited file at an unchanged path keeps serving the previous
              transform until the cache TTL lapses. A new href is a cold key
              everywhere. */}
          <figure className="mx-auto w-full max-w-[272px] lg:mx-0 lg:ml-auto">
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-1.5">
              <div
                className="relative overflow-hidden rounded-[10px] bg-[var(--surface-sunken)]"
                style={{ aspectRatio: "1206 / 2164" }}
              >
                <Image
                  src="/screenshots/current/workspace-phone-slim.webp"
                  alt="A server's Channels sheet on a phone: a rail of the account's servers down the left edge, then the server name, Private server with its member count, an Invite action, a TEXT group with general and memes, a VOICE group with Lounge and Gaming both marked LIVE, an ORGANISATION group with Events and Rules, and Add channel."
                  width={1206}
                  height={2164}
                  sizes="(max-width: 1024px) 70vw, 272px"
                  className="size-full object-cover object-top"
                />
              </div>
            </div>
            <figcaption className="mt-4 text-center text-xs leading-5 text-[var(--text-tertiary)] lg:text-left">
              Text and voice channels inside one server, with invites in reach.
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
              <h3 className="mt-3 text-lg font-bold text-[var(--foreground)]">
                {template.name}
              </h3>
              <p className="mt-1.5 text-sm font-semibold text-[var(--text-secondary)]">
                {template.headline}
              </p>
              <p className="mt-2.5 text-sm leading-6 text-[var(--text-secondary)]">
                {template.description}
              </p>

              {/* The starter channels the template seeds. The live channel
                  carries the voice glyph; the rest are text. */}
              <ul
                className="mt-5 flex flex-wrap gap-1.5"
                aria-label={`Starter channels in a ${template.name} server`}
              >
                {template.channels.map((channel) => {
                  const isVoice = channel === template.channel;
                  const Icon = isVoice ? AudioLines : Hash;
                  return (
                    <li key={channel} className="chip">
                      {/* The colour rides on the glyph, not the chip: `.chip`
                          is unlayered, so a `text-*` utility on the chip
                          itself would be discarded. */}
                      <Icon
                        className={`size-3.5 ${isVoice ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}`}
                        aria-hidden="true"
                      />
                      {channel}
                      <span className="sr-only">
                        {isVoice ? " voice channel" : " text channel"}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-auto flex items-center gap-1.5 pt-5 text-xs font-semibold text-[var(--text-tertiary)]">
                <Lock className="size-3.5" aria-hidden="true" />
                {template.privacy}
              </p>
            </li>
          ))}
        </ul>

        <div className="panel mt-8 flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
            Every signed-in account can create a Server, join one, send
            invites and use its voice and text channels. Podcast recording is
            the one piece still switched off, and YO Voice itself is still in
            internal testing.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/servers" className="premium-button-secondary focus-ring">
              See the Servers interface
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/updates" className="premium-button-ghost focus-ring">
              Where it stands
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
