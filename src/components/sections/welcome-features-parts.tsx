import { Lock, type LucideIcon } from "lucide-react";

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

/** One sentence for the big-screen picture as a whole. */
export const SCREEN_NOTE =
  "The same YO Voice in a modern browser, laid out for a big screen.";

/** The web app's address, drawn in the browser bar above the captures. */
export const SCREEN_ADDRESS = "app.yovoice.app";

/** Every wide capture is 2160 × 1350 (16:10). */
export const SCREEN_SIZE = { width: 2160, height: 1350 } as const;

/**
 * The three large-screen captures, in the order the cinema shows them. They
 * are the current desktop-layout captures on sample content; the alt text
 * describes only what each frame shows and leaves out the sample people's
 * names. Friends has no rail row of its own, so its frame shows More lit.
 */
export const SCREEN_VIEWS = [
  {
    id: "home",
    label: "Home",
    src: "/screenshots/current/home-wide-slim.webp",
    line: "Your people, what is live now and your recent chats, on one page.",
    alt: "YO Voice Home on a large screen: the navigation rail with Home selected, a greeting, a Your people row of friends with their status, a Live now card with a voice waveform, a Got a minute? prompt to record a Voice Moment, your recent chats, and a Here and now card for a server.",
  },
  {
    id: "chats",
    label: "Chats",
    src: "/screenshots/current/chats-wide-slim.webp",
    line: "Private conversations, with search and New message up top.",
    alt: "YO Voice Chats on a large screen: the navigation rail with Chats selected, a search field, Add friend and New message at the start of a row of friends, and a Messages list of private conversations with unread counts.",
  },
  {
    id: "friends",
    label: "Friends",
    src: "/screenshots/current/friends-wide-slim.webp",
    line: "Add friend, search, and All, Online, Requests and Blocked.",
    alt: "YO Voice Friends on a large screen: an Add friend button, All, Online, Requests and Blocked filters, a search field for current friends, and a list of friends, each with a status and a message button.",
  },
] as const;

export type ScreenView = (typeof SCREEN_VIEWS)[number];

/**
 * A quiet browser bar: three dots and the web app's address. It is part of
 * the picture, so it is hidden from assistive technology; the captures carry
 * the description. Its height and type follow `--bar` on an ancestor.
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
      <span className="absolute left-1/2 top-1/2 flex h-[1.9em] min-w-[16em] max-w-[46%] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-[0.5em] rounded-full border border-[#2c2338] bg-[#1a1424] px-[1.2em] font-medium leading-none tracking-[0.01em] text-[#b8afc2]">
        <Lock className="size-[0.9em] flex-none" strokeWidth={2.2} />
        <span className="truncate">{SCREEN_ADDRESS}</span>
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
