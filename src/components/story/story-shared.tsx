import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import styles from "@/components/story/app-story.module.css";
import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";

/** The story's eyebrow and title, one wording for the heading and for the
 * pinned stage's picture of it. */
export const STORY_EYEBROW = "Inside YO Voice";
export const STORY_TITLE = "Four places your circle lives.";

/** The story's heading, the same words and id in the scene and without it. */
export function StoryHeading({
  className,
  titleClassName,
  eyebrowClassName = "eyebrow",
  eyebrowIcon,
}: {
  className?: string;
  titleClassName?: string;
  eyebrowClassName?: string;
  eyebrowIcon?: ReactNode;
}) {
  return (
    <div className={className}>
      <p className={eyebrowClassName}>
        {eyebrowIcon}
        {STORY_EYEBROW}
      </p>
      <h2 id="inside-heading" className={titleClassName}>
        {STORY_TITLE}
      </h2>
    </div>
  );
}

/**
 * The way in, after the story and never inside the pinned stage: it sits in
 * normal flow, so it is always fully visible wherever keyboard focus finds it.
 *
 * `large` is the cinema's: the button answers the giant "Start talking." the
 * stage has just let go of, so it is drawn a size up.
 */
export function StoryCta({ className, large = false }: { className?: string; large?: boolean }) {
  return (
    <div className={`relative px-5 sm:px-8 ${className ?? ""}`}>
      <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-3 text-center">
        <Link
          href={APP_ENTRY_PATH}
          className={`premium-button focus-ring ${large ? styles.ctaLarge : ""}`}
        >
          Start talking
          <ArrowRight className={large ? "size-5" : "size-4"} aria-hidden="true" />
        </Link>
        <p className="text-sm text-[var(--text-tertiary)]">
          The web app runs in a modern browser.
        </p>
      </div>
    </div>
  );
}
