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
 * The boundary sentence stays, though. Describing Servers without saying that
 * creation and channel activity are not switched on yet would read as an
 * invitation to do something the backend gate still prevents.
 */
export function ServersWelcome() {
  return (
    <section
      id="servers"
      aria-labelledby="servers-welcome-heading"
      className="relative overflow-hidden border-t border-white/[.06] bg-[var(--background)] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"
    >
      <div className="grid-background absolute inset-0 opacity-15" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-[-8%] top-[18%] size-[440px] rounded-full bg-violet-700/12 blur-[150px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1240px]">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-14">
          <div className="max-w-2xl">
            <p className="eyebrow">Servers</p>
            <h2
              id="servers-welcome-heading"
              className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.06] tracking-[-.045em] text-white sm:text-5xl"
            >
              A server for
              <span className="text-gradient text-gradient-descender-safe block">
                every circle.
              </span>
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-[var(--text-secondary)] sm:text-base sm:leading-8">
              A Server is the home your group comes back to: voice channels to
              talk in, text channels to carry on in, and a shape that suits the
              people inside it. Pick the one that sounds like your circle.
            </p>
          </div>

          {/* The channel list as the app actually draws it: a server's own
              text and voice channels, its member count, and the Invite action
              a private server opens with. The cards below name the starter
              channels per template; this is what they look like inside.

              The frame is trimmed to the settled sheet. The capture caught the
              channel list still presenting, so the Servers screen behind it was
              sliced across the top of the image — the crop starts at the sheet's
              own top edge, which is why the height here is not the 2622 px of
              the other phone frames.

              The file carries a new name rather than replacing the old one in
              place. Next's image optimizer keys its cache on the href, width,
              quality and mime type only — never on the source bytes — so an
              edited file at an unchanged path keeps serving the previous
              transform until the cache TTL lapses. A new href is a cold key
              everywhere. */}
          <figure className="mx-auto w-full max-w-[272px] lg:mx-0 lg:ml-auto">
            <div className="relative rounded-[2.4rem] border border-[#342a43] bg-[#0b0714] p-[6px] shadow-[0_38px_120px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.07)]">
              <div
                className="relative overflow-hidden rounded-[2rem] bg-[#08040f]"
                style={{ aspectRatio: "1206 / 2160" }}
              >
                <Image
                  src="/screenshots/current/workspace-phone-v2.webp"
                  alt="A server's channel list on a phone: the server name, Private server with its member count, an Invite action, then a TEXT group with general and plans and a VOICE group with Lounge and Late night, above Add channel."
                  width={1206}
                  height={2160}
                  sizes="(max-width: 1024px) 70vw, 272px"
                  className="size-full object-cover object-top"
                />
              </div>
            </div>
            <figcaption className="mt-4 text-center text-xs leading-5 text-white/55 lg:text-left">
              Text and voice channels inside one server, with invites in reach.
            </figcaption>
          </figure>
        </div>

        <ul
          className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
          aria-label="The five kinds of Server"
        >
          {serverTemplates.map((template) => (
            <li
              key={template.id}
              className="glass-panel flex min-w-0 flex-col rounded-[24px] p-5 sm:p-6"
            >
              <p className="text-[11px] font-black uppercase tracking-[.18em] text-[var(--accent)]">
                {template.short}
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold text-white">
                {template.name}
              </h3>
              <p className="mt-1.5 text-sm font-semibold text-white/75">
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
                    <li
                      key={channel}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        isVoice
                          ? "border-[var(--accent)]/30 bg-[var(--accent)]/[.09] text-[var(--accent)]"
                          : "border-white/10 bg-white/[.035] text-white/60"
                      }`}
                    >
                      <Icon className="size-3" aria-hidden="true" />
                      {channel}
                      <span className="sr-only">
                        {isVoice ? " voice channel" : " text channel"}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-auto flex items-center gap-1.5 pt-5 text-xs font-semibold text-white/45">
                <Lock className="size-3" aria-hidden="true" />
                {template.privacy}
              </p>
            </li>
          ))}
        </ul>

        <div className="glass-panel mt-8 flex flex-col gap-5 rounded-[26px] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
            Servers are with our internal testers right now. Creating a server,
            joining channels and Podcast recording are not switched on yet —
            when they are, you will read it here first.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/servers"
              className="premium-button-secondary focus-ring min-h-12 px-5 text-sm"
            >
              See the Servers interface
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/updates"
              className="premium-button-ghost focus-ring min-h-12 px-5 text-sm"
            >
              Where it stands
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
