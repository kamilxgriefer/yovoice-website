import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { APP_ENTRY_PATH } from "@/lib/auth/auth-redirect";

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
        Inside YO Voice
      </p>
      <h2 id="inside-heading" className={titleClassName}>
        Four places your circle lives.
      </h2>
    </div>
  );
}

/**
 * The way in, after the story and never inside the pinned stage: it sits in
 * normal flow, so it is always fully visible wherever keyboard focus finds it.
 */
export function StoryCta({ className }: { className?: string }) {
  return (
    <div className={`relative px-5 sm:px-8 ${className ?? ""}`}>
      <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-3 text-center">
        <Link href={APP_ENTRY_PATH} className="premium-button focus-ring">
          Start talking
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <p className="text-sm text-[var(--text-tertiary)]">
          The web app runs in a modern browser.
        </p>
      </div>
    </div>
  );
}
