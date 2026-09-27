import { ArrowRight } from "lucide-react";

import { MagneticCta } from "@/components/ui/magnetic-cta";
import styles from "@/components/story/app-story.module.css";
import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";

/** The story's eyebrow and title, one wording for the heading and for the
 * pinned stage's picture of it. */
export const STORY_EYEBROW = "Inside YO Voice";
export const STORY_TITLE = "Four places your circle lives.";
/** The story's scene ink: the eyebrow's colour, the first chapter's violet. */
export const STORY_INK = "#c3a8ff";

/** The story's heading, the same words and id in the scene and without it. */
export function StoryHeading({
  className,
  titleClassName,
  eyebrowClassName = "eyebrow",
}: {
  className?: string;
  titleClassName?: string;
  eyebrowClassName?: string;
}) {
  return (
    <div className={className}>
      <p className={eyebrowClassName}>{STORY_EYEBROW}</p>
      <h2 id="inside-heading" className={titleClassName}>
        {STORY_TITLE}
      </h2>
    </div>
  );
}

/**
 * The way in, after the story and never inside the pinned stage: it sits in
 * normal flow, so it is always fully visible wherever keyboard focus finds it.
 * Centred: it belongs to the centred phone above it.
 *
 * `large` is the cinema's: the button answers the giant "Start talking." the
 * stage has just let go of, so it is drawn a size up.
 */
export function StoryCta({ className, large = false }: { className?: string; large?: boolean }) {
  return (
    <div className={`frame relative ${className ?? ""}`}>
      <div className="flex flex-col items-center gap-3 text-center">
        <MagneticCta href={APP_ENTRY_PATH} className={large ? styles.ctaLarge : undefined}>
          Start talking
          <ArrowRight className={`arrow-nudge ${large ? "size-5" : "size-4"}`} aria-hidden="true" />
        </MagneticCta>
        <p className="text-sm text-[var(--text-tertiary)]">
          The web app runs in a modern browser.
        </p>
      </div>
    </div>
  );
}
