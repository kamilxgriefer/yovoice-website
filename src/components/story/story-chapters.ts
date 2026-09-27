import { appScreens } from "@/components/hero/app-screen-rotator";

/**
 * The app story's four chapters: the app's own first four destinations, in
 * the order its navigation dock shows them.
 *
 * The captures and their labels come from the hero's `appScreens`, so the
 * story and the hero can never show two different apps. Every sentence below
 * repeats a claim the rest of the homepage already makes (Servers: five
 * kinds, voice and text channels; Chats: private, with text, voice, photos or
 * video; Voice Moments: short voice updates that last a day; Yeels: your own
 * photo or short video first).
 *
 * `alt` is the story's own short description of the same capture, a part of
 * what the hero's full alt text says about it. The hero already reads the
 * long description; next to a chapter that names the screen, a screen reader
 * hears one sentence instead of the hero's fifty words a second time. (With
 * the cinema on, the story's phone is decorative and the chapter text alone
 * carries the meaning.)
 *
 * Colours are the app's dock colours for each destination:
 * - `core` — the dock colour itself, the one bright glow behind the phone;
 * - `flood` — a deep, dark tint of the same hue that fills the stage, dark
 *   enough that white body copy reads far above WCAG AA on it;
 * - `ink` — a light tint of the same hue for the chapter number and label,
 *   also above AA on its flood.
 */

type AppScreen = (typeof appScreens)[number];

export type StoryChapter = {
  screen: AppScreen;
  number: string;
  title: string;
  text: string;
  /** A short description of the capture, next to the chapter that names it. */
  alt: string;
  ink: string;
  core: string;
  flood: string;
  /** How far the flood brightens toward the phone (1 = the default). Cyan
   * reads far brighter than violet at the same mix, so Chats lifts less. */
  lift: number;
};

function screen(id: AppScreen["id"]): AppScreen {
  const found = appScreens.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`No app capture for ${id}`);
  return found;
}

export const CHAPTERS: readonly StoryChapter[] = [
  {
    screen: screen("home"),
    number: "01",
    title: "Your people, first.",
    text: "Home opens on the friends you want to hear and on whatever is live right now.",
    alt: "Home on a phone, opening on a Your people row of friends and a Live now card.",
    ink: "#c3a8ff",
    core: "#7b2ff7",
    flood: "#1c0b48",
    lift: 1,
  },
  {
    screen: screen("servers"),
    number: "02",
    title: "Five kinds of space.",
    text: "Friends, Community, Podcast, Family and Company — each with voice channels to talk in and text channels to carry on in.",
    alt: "Servers on a phone: a Create server button above five servers, one of each kind.",
    ink: "#dca6ff",
    core: "#9d2afb",
    flood: "#240b4c",
    lift: 1,
  },
  {
    screen: screen("chats"),
    number: "03",
    title: "The thread carries on.",
    text: "Private conversations with text, voice, photos or video keep going when nobody is live.",
    alt: "Chats on a phone: a list of private conversations, one of them a voice message.",
    ink: "#7de9ed",
    core: "#5ce1e6",
    flood: "#03262d",
    lift: 0.62,
  },
  {
    screen: screen("moments"),
    number: "04",
    title: "The short stuff in between.",
    text: "Voice Moments are short voice updates that last a day, and Yeels put your own photo or short video first.",
    alt: "YO Moments on a phone: the Voice and Yeels switch above a feed of short Voice Moments.",
    ink: "#eba6ff",
    core: "#c026ff",
    flood: "#2e0844",
    lift: 1,
  },
] as const;

/** The finale returns the stage to the brand's deep violet. */
export const FINALE_TINT = { core: "#7b2ff7", flood: "#1a0a44", lift: 1 } as const;

/**
 * The scene's timeline over its scroll progress `p` (0 when the stage pins,
 * 1 when it lets go):
 *
 * - `0 → INTRO_END`: the heading, the phone rising, the flood opening;
 * - four chapters of `CHAPTER_LENGTH` each;
 * - `FINALE_START → 1`: the hero's line, giant, arriving behind the phone,
 *   then the phone stepping back below it, and a short rest.
 *
 * The track is 550svh on wide screens and 495svh on phones
 * (`app-story.module.css`), so a chapter is about three quarters of a screen
 * of scrolling and the finale about one.
 */
export const INTRO_END = 0.105;
export const CHAPTER_LENGTH = 0.17;
export const FINALE_START = INTRO_END + CHAPTER_LENGTH * CHAPTERS.length;

export const chapterStart = (index: number) => INTRO_END + CHAPTER_LENGTH * index;
export const chapterMid = (index: number) => chapterStart(index) + CHAPTER_LENGTH / 2;

/** -1 during the intro, 0–3 for the chapters, 4 in the finale. */
export function chapterAt(progress: number): number {
  if (progress < INTRO_END) return -1;
  if (progress >= FINALE_START) return CHAPTERS.length;
  return Math.min(CHAPTERS.length - 1, Math.floor((progress - INTRO_END) / CHAPTER_LENGTH));
}

/**
 * Which chapter the stage's text shows: -1 while the heading has the stage,
 * 0–3 for the chapters, 4 once the finale takes over. The first chapter
 * arrives as the phone lands, a little before its own start, and the last
 * one clears before the giant words come in where it stood.
 */
export function textStepAt(progress: number): number {
  if (progress < INTRO_END - 0.02) return -1;
  if (progress >= FINALE_START - 0.015) return CHAPTERS.length;
  return Math.max(0, chapterAt(progress));
}

/** The phone captures' own pixel size; every frame keeps this ratio. */
export const PHONE_CAPTURE = { width: 1206, height: 2622 } as const;
