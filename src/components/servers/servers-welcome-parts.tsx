import Image from "next/image";
import Link from "next/link";
import { ArrowRight, AudioLines, Hash, Lock } from "lucide-react";

import type { ServerTemplate } from "@/content/server-templates";
import { cn } from "@/lib/utils/cn";

/**
 * The words and pieces the homepage's Servers welcome is made of, shared by
 * its static layout (`servers-welcome.tsx`) and its stacking-cards scene
 * (`servers-welcome-cinema.tsx`), so the two can never say different things.
 */

export const SERVERS_INTRO =
  "A Server is the home your group comes back to: voice channels to talk in, text channels to carry on in, and a shape that suits the people inside it. Pick the one that sounds like your circle.";

export const WORKSPACE_CAPTION =
  "Text and voice channels inside one server, with invites in reach.";

/** "A server for every circle." with the solid accent on its last words. */
export function ServersHeadingWords({ accentClassName }: { accentClassName?: string }) {
  return (
    <>
      A server for{" "}
      <span className={cn("text-[var(--accent)]", accentClassName)}>every circle.</span>
    </>
  );
}

/*
 * The channel list as the 3.0.0 app draws it on a phone: the Channels sheet,
 * with the server rail down its left edge, the server's name, privacy and
 * member count, the Invite action, and its text, voice and organisation
 * channels, live voice channels marked LIVE. The cards name the starter
 * channels per template; this is what they look like inside.
 *
 * The frame is trimmed to the sheet's own top edge, so the dimmed workspace
 * behind it is not in the picture — which is why the height here is not the
 * 2622 px of the other phone frames.
 *
 * The file carries a new name rather than replacing the old one in place.
 * Next's image optimizer keys its cache on the href, width, quality and mime
 * type only — never on the source bytes — so an edited file at an unchanged
 * path keeps serving the previous transform until the cache TTL lapses. A new
 * href is a cold key everywhere.
 */
export const WORKSPACE_ASPECT = "1206 / 2164";

export function WorkspaceCapture({ sizes, className }: { sizes: string; className?: string }) {
  return (
    <Image
      src="/screenshots/current/workspace-phone-slim.webp"
      alt="A server's Channels sheet on a phone: a rail of the account's servers down the left edge, then the server name, Private server with its member count, an Invite action, a TEXT group with general and memes, a VOICE group with Lounge and Gaming both marked LIVE, an ORGANISATION group with Events and Rules, and Add channel."
      width={1206}
      height={2164}
      sizes={sizes}
      className={cn("size-full object-cover object-top", className)}
    />
  );
}

/**
 * The starter channels a template seeds. Which one is the voice channel is
 * read from the data: every template names its live channel in `channel`,
 * and that is the one drawn with the voice glyph, so the split can never
 * drift from the template list the /servers route renders from the same file.
 */
export function StarterChannels({
  template,
  className,
}: {
  template: ServerTemplate;
  className?: string;
}) {
  return (
    <ul
      className={cn("flex flex-wrap gap-1.5", className)}
      aria-label={`Starter channels in a ${template.name} server`}
    >
      {template.channels.map((channel) => {
        const isVoice = channel === template.channel;
        const Icon = isVoice ? AudioLines : Hash;
        return (
          <li key={channel} className="chip">
            {/* The colour rides on the glyph, not the chip: `.chip` is
                unlayered, so a `text-*` utility on the chip itself would be
                discarded. */}
            <Icon
              className={`size-3.5 ${isVoice ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}`}
              aria-hidden="true"
            />
            {channel}
            <span className="sr-only">{isVoice ? " voice channel" : " text channel"}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function TemplatePrivacy({
  template,
  className,
}: {
  template: ServerTemplate;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-xs font-semibold text-[var(--text-tertiary)]",
        className,
      )}
    >
      <Lock className="size-3.5" aria-hidden="true" />
      {template.privacy}
    </p>
  );
}

/**
 * The boundary, in words and without a build number: Servers have been open
 * to every signed-in account since 16 September 2026 (app ADR-197), YO Voice
 * itself is still in internal testing, and Podcast recording is the one piece
 * still switched off.
 */
export function ServersBoundary({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "panel flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <p className="max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
        Every signed-in account can create a Server, join one, send invites and use its voice and
        text channels. Podcast recording is the one piece still switched off, and YO Voice itself
        is still in internal testing.
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
  );
}
