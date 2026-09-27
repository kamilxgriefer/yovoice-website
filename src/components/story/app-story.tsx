"use client";

import { useCinema } from "@/components/animations/cinema";
import { AppStoryCinema } from "@/components/story/app-story-cinema";
import { AppStoryStatic } from "@/components/story/app-story-static";

/**
 * Inside YO Voice — the homepage's product scene, right after the hero.
 *
 * With the scroll cinema on, a pinned stage walks through the app's first
 * four destinations on one turning phone (`app-story-cinema.tsx`). Without it
 * — on the server, before hydration, without JavaScript, with reduced motion,
 * large text or a short window — the same heading, chapters and captures are
 * calm rows (`app-story-static.tsx`). Both keep `#inside` and
 * `#inside-heading`, which the hero links to.
 */
export function AppStory() {
  const cinema = useCinema();
  return cinema ? <AppStoryCinema /> : <AppStoryStatic />;
}
