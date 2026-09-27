import type { LucideIcon } from "lucide-react";

import { CHAPTERS, type StoryChapter } from "@/components/story/story-chapters";

/** A story chapter's colours (`story-chapters.ts`), by its app screen. */
function chapterLight(id: StoryChapter["screen"]["id"]): StoryChapter {
  const chapter = CHAPTERS.find((candidate) => candidate.screen.id === id);
  if (!chapter) throw new Error(`No story chapter for ${id}`);
  return chapter;
}
const HOME_LIGHT = chapterLight("home");
const CHATS_LIGHT = chapterLight("chats");
const MOMENTS_LIGHT = chapterLight("moments");

/**
 * Pieces the "What you get" section shares between its static layout and its
 * scroll cinema (`welcome-features-cinema.tsx`): the big-screen captures, the
 * browser bar they sit under, and the body of one feature row.
 */

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

/**
 * The caption for the big-screen picture as a whole. The frames come from
 * the app's preview harness on sample people (like the /servers and /updates
 * captures, which say so), so the caption says so too: they are an
 * illustration of the layout, not somebody's live account.
 */
export const SCREEN_NOTE =
  "The same YO Voice in a modern browser, laid out for a big screen. The people and messages are sample content, not a live account.";

/**
 * How the section opens, the same words in both layouts (`SceneOpener`): the
 * ruled eyebrow in the scene's ink, the title with its accent, and the note
 * above as the lead, directly above the picture it describes. The ink is the
 * story's Chats label, the colour the section's room light turns to.
 */
export const FEATURES_OPENER = {
  eyebrow: "What you get",
  title: "One place for the",
  accent: "people you talk to.",
  ink: CHATS_LIGHT.ink,
} as const;

/** The note's id, so the picture can point at it as its description. */
export const SCREEN_NOTE_ID = "welcome-features-note";

/** Every wide capture is 2160 × 1350 (16:10). */
export const SCREEN_SIZE = { width: 2160, height: 1350 } as const;

/**
 * The three large-screen captures, in the order the cinema shows them. They
 * are the current desktop-layout captures on sample content; the alt text
 * describes only what each frame shows and leaves out the sample people's
 * names. Friends has no rail row of its own, so its frame shows More lit.
 *
 * `room` is the light each view throws on the room around the screen in the
 * cinema (a deep `flood` of the view's dock colour, lifted toward its `core`
 * by `lift`), and `ink` the light tint of the same hue for the wipe's edge,
 * the caption's number and its progress segment. They are the story's own
 * chapter values, read from `story-chapters.ts` rather than copied: Home
 * violet, Chats cyan, and for Friends the magenta the story gives Moments,
 * the other people-first view.
 */
export const SCREEN_VIEWS = [
  {
    id: "home",
    label: "Home",
    src: "/screenshots/current/home-wide-slim.webp",
    line: "Your people, what is live now and your recent chats, on one page.",
    ink: HOME_LIGHT.ink,
    room: { flood: HOME_LIGHT.flood, core: HOME_LIGHT.core, lift: HOME_LIGHT.lift },
    alt: "YO Voice Home on a large screen: the navigation rail with Home selected, a greeting, a Your people row of friends with their status, a Live now card with a voice waveform, a Got a minute? prompt to record a Voice Moment, your recent chats, and a Here and now card for a server.",
  },
  {
    id: "chats",
    label: "Chats",
    src: "/screenshots/current/chats-wide-slim.webp",
    line: "Private conversations, with search and New message up top.",
    ink: CHATS_LIGHT.ink,
    room: { flood: CHATS_LIGHT.flood, core: CHATS_LIGHT.core, lift: CHATS_LIGHT.lift },
    alt: "YO Voice Chats on a large screen: the navigation rail with Chats selected, a search field, Add friend and New message at the start of a row of friends, and a Messages list of private conversations with unread counts.",
  },
  {
    id: "friends",
    label: "Friends",
    src: "/screenshots/current/friends-wide-slim.webp",
    line: "Add friend, search, and All, Online, Requests and Blocked.",
    ink: MOMENTS_LIGHT.ink,
    room: { flood: MOMENTS_LIGHT.flood, core: MOMENTS_LIGHT.core, lift: MOMENTS_LIGHT.lift },
    alt: "YO Voice Friends on a large screen: an Add friend button, All, Online, Requests and Blocked filters, a search field for current friends, and a list of friends, each with a status and a message button.",
  },
] as const;

export type ScreenView = (typeof SCREEN_VIEWS)[number];

/**
 * A quiet, neutral window bar: three dots and nothing else. It carries no
 * address, lock or account, because the frames are sample-content renders,
 * not a live session at some URL (design-system.md: app previews are labelled
 * illustrations). It is part of the picture, so it is hidden from assistive
 * technology; the captures carry the description. Its height follows `--bar`
 * on an ancestor.
 */
export function BrowserBar() {
  return (
    <div
      aria-hidden="true"
      className="relative flex items-center border-b border-[#241c30] bg-[#120d1b] px-[1.1em]"
      style={{ height: "var(--bar, 2.25rem)", fontSize: "calc(var(--bar, 2.25rem) * 0.34)" }}
    >
      <span className="flex gap-[0.55em]">
        <span className="size-[0.75em] rounded-full bg-[#3a3046]" />
        <span className="size-[0.75em] rounded-full bg-[#3a3046]" />
        <span className="size-[0.75em] rounded-full bg-[#3a3046]" />
      </span>
    </div>
  );
}

/** The icon tile and the words of one feature row (the `<li>` is the caller's). */
export function FeatureRowBody({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <>
      <span className="icon-tile">
        <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="break-words text-base font-bold text-[var(--foreground)]">
          {feature.title}
        </h3>
        <p className="mt-1.5 break-words text-sm leading-6 text-[var(--text-secondary)]">
          {feature.description}
        </p>
      </div>
    </>
  );
}
