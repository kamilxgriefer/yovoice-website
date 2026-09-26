import { appScreens } from "@/components/hero/app-screen-rotator";

/**
 * The app story's four chapters: the app's own first four destinations, in
 * the order its navigation dock shows them.
 *
 * The captures, their labels and their alt text come from the hero's
 * `appScreens`, so the story and the hero can never describe two different
 * apps. Every sentence below repeats a claim the rest of the homepage already
 * makes (Servers: five kinds, voice and text channels; Chats: private, with
 * text, voice, photos or video; Voice Moments: short voice updates that last
 * a day; Yeels: your own photo or short video first).
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
    ink: "#c3a8ff",
    core: "#7b2ff7",
    flood: "#1c0b48",
    lift: 1,
  },
  {
    screen: screen("servers"),
    number: "02",
    title: "A home for every circle.",
    text: "Five kinds of space — Friends, Community, Podcast, Family and Company — each with voice channels to talk in and text channels to carry on in.",
    ink: "#dca6ff",
    core: "#9d2afb",
    flood: "#240b4c",
    lift: 1,
  },
  {
    screen: screen("chats"),
    number: "03",
    title: "The thread never drops.",
    text: "Private conversations with text, voice, photos or video keep going when nobody is live.",
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
 * - `FINALE_START → 1`: the hero's line, giant, behind the phone.
 */
export const INTRO_END = 0.1;
export const CHAPTER_LENGTH = 0.16;
export const FINALE_START = INTRO_END + CHAPTER_LENGTH * CHAPTERS.length;

export const chapterStart = (index: number) => INTRO_END + CHAPTER_LENGTH * index;
export const chapterMid = (index: number) => chapterStart(index) + CHAPTER_LENGTH / 2;

/** -1 during the intro, 0–3 for the chapters, 4 in the finale. */
export function chapterAt(progress: number): number {
  if (progress < INTRO_END) return -1;
  if (progress >= FINALE_START) return CHAPTERS.length;
  return Math.min(CHAPTERS.length - 1, Math.floor((progress - INTRO_END) / CHAPTER_LENGTH));
}

/** The phone captures' own pixel size; every frame keeps this ratio. */
export const PHONE_CAPTURE = { width: 1206, height: 2622 } as const;
