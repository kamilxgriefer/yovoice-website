"use client";

import { ScrollWave } from "@/components/animations/scroll-wave";
import { WordReveal } from "@/components/animations/word-reveal";

/** Placeholder for the pinned app story; replaced by the story scene. */
export function AppStory() {
  return (
    <section id="inside" aria-labelledby="inside-heading" className="relative px-5 py-24">
      <h2 id="inside-heading" className="section-title">Inside YO Voice</h2>
      <WordReveal
        className="mt-6 max-w-3xl text-3xl font-bold leading-tight"
        text="Your people, your Servers, your Chats and the short stuff in between, all in one place that would rather talk than scroll."
      />
      <ScrollWave className="mt-10" />
    </section>
  );
}
